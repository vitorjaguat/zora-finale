import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Dynamic import to handle potential issues
    const { auctionRepo } = await import("@/lib/db/dbClass");

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

    // Get auctions by owner
    const auctions = auctionRepo.getAuctionsByOwner(address);

    return NextResponse.json({
      address: address.toLowerCase(),
      hasAuctions: auctions.length > 0,
      auctionCount: auctions.length,
      auctions: auctions,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: `Database error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
