import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Basic address format validation (Ethereum address)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Try SQLite first, fallback to JSON
    try {
      const { auctionRepo } = await import("@/lib/db/dbClass");
      const auctions = auctionRepo.getAuctionsByOwner(address);
      
      return NextResponse.json({
        address: address.toLowerCase(),
        hasAuctions: auctions.length > 0,
        auctionCount: auctions.length,
        auctions: auctions,
      });
    } catch (dbError) {
      console.log('SQLite failed, trying JSON fallback:', dbError);
      
      // Fallback to JSON file
      const dataPath = path.join(process.cwd(), 'public', 'data', 'auctions.json');
      
      if (!fs.existsSync(dataPath)) {
        return NextResponse.json(
          { error: "Database not available" },
          { status: 503 }
        );
      }

      const auctionData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      // Filter auctions by owner
      const auctions = Object.values(auctionData).filter((auction: any) => 
        auction.tokenOwner?.toLowerCase() === address.toLowerCase()
      );

      return NextResponse.json({
        address: address.toLowerCase(),
        hasAuctions: auctions.length > 0,
        auctionCount: auctions.length,
        auctions: auctions,
        source: 'json-fallback'
      });
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
