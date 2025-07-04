import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

interface AuctionData {
  auctionId: string;
  tokenId: string;
  tokenContract: string;
  approved: boolean;
  amount: string;
  duration: string;
  firstBidTime: string;
  reservePrice: string;
  curatorFeePercentage: number;
  tokenOwner: string;
  bidder: string;
  curator: string;
  auctionCurrency: string;
}

interface AuctionDatabase {
  auctions: Record<string, AuctionData>;
  indexes: {
    byTokenOwner: Record<string, string[]>;
    byCurator: Record<string, string[]>;
    byBidder: Record<string, string[]>;
    byTokenContract: Record<string, string[]>;
  };
  metadata: {
    totalAuctions: number;
    generatedAt: string;
    startId: number;
    endId: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    const dataPath = path.join(process.cwd(), 'public', 'data', 'auctions.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: "Auction database not available" },
        { status: 503 }
      );
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const database: AuctionDatabase = JSON.parse(fileContent) as AuctionDatabase;
    
    const normalizedAddress = address.toLowerCase();
    
    // Use curator index for fast lookup
    const auctionIds = database.indexes.byCurator[normalizedAddress] ?? [];
    const auctions = auctionIds.map(id => database.auctions[id]).filter(Boolean);

    return NextResponse.json({
      address: normalizedAddress,
      role: "curator",
      hasAuctions: auctions.length > 0,
      auctionCount: auctions.length,
      auctions: auctions,
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}