import { NextRequest, NextResponse } from "next/server";
import { auctionRepo } from "@/lib/db/dbClass";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 },
      );
    }

    // Basic address format validation (Ethereum address)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 },
      );
    }

    // Get auctions by owner
    const auctions = auctionRepo.getAuctionsByOwner(address);

    return NextResponse.json({
      address: address.toLowerCase(),
      hasAuctions: auctions.length > 0,
      auctionCount: auctions.length,
      auctions: auctions,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
