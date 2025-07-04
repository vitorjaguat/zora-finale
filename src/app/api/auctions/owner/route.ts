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
    console.log('API route called');
    
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

    // Read auction database from JSON file
    const dataPath = path.join(process.cwd(), 'public', 'data', 'auctions.json');
    
    console.log(`Looking for database at: ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      console.error(`Database file not found at: ${dataPath}`);
      return NextResponse.json(
        { error: "Auction database not available. Please generate the database first." },
        { status: 503 }
      );
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const database: AuctionDatabase = JSON.parse(fileContent) as AuctionDatabase;
    
    console.log(`Database loaded. Total auctions: ${database.metadata.totalAuctions}`);
    
    const normalizedAddress = address.toLowerCase();
    
    // Use indexes for fast lookup - FIX: Use nullish coalescing
    const auctionIds = database.indexes.byTokenOwner[normalizedAddress] ?? [];
    
    console.log(`Found ${auctionIds.length} auctions for address ${normalizedAddress}`);
    
    // Get auction data for found IDs
    const auctions = auctionIds.map(id => database.auctions[id]).filter(Boolean);

    return NextResponse.json({
      address: normalizedAddress,
      hasAuctions: auctions.length > 0,
      auctionCount: auctions.length,
      auctions: auctions,
      metadata: {
        databaseGenerated: database.metadata.generatedAt,
        totalAuctionsInDB: database.metadata.totalAuctions,
      },
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
