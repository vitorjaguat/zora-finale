import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import type { AuctionData } from "@/scripts/generateJSON";

// Load the auction data
import auctionDatabase from "public/data/auctions.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inputAddress = searchParams.get("address");

    if (!inputAddress) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 },
      );
    }

    if (!isAddress(inputAddress)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address" },
        { status: 400 },
      );
    }

    // Normalize address to lowercase for comparison
    const address = inputAddress.toLowerCase();

    // Find auctions where the address is involved as owner, curator, or bidder
    const relatedAuctions: AuctionData[] = [];
    const auctionIds = new Set<string>(); // To prevent duplicates

    // Check all auctions
    for (const [auctionId, auction] of Object.entries(
      auctionDatabase.auctions,
    )) {
      const auctionData = auction as AuctionData;
      const isTokenOwner = auctionData.tokenOwner.toLowerCase() === address;
      const isCurator = auctionData.curator.toLowerCase() === address;
      const isBidder =
        auctionData.bidder.toLowerCase() === address &&
        auctionData.bidder !== "0x0000000000000000000000000000000000000000";

      if (isTokenOwner || isCurator || isBidder) {
        if (!auctionIds.has(auctionId)) {
          auctionIds.add(auctionId);
          relatedAuctions.push(auctionData);
        }
      }
    }

    // Sort auctions by ID (newest first)
    relatedAuctions.sort(
      (a, b) => parseInt(b.auctionId) - parseInt(a.auctionId),
    );

    const result = {
      address: inputAddress,
      hasAuctions: relatedAuctions.length > 0,
      auctionCount: relatedAuctions.length,
      auctions: relatedAuctions,
      breakdown: {
        asTokenOwner: relatedAuctions.filter(
          (a) => a.tokenOwner.toLowerCase() === address,
        ).length,
        asCurator: relatedAuctions.filter(
          (a) => a.curator.toLowerCase() === address,
        ).length,
        asBidder: relatedAuctions.filter(
          (a) =>
            a.bidder.toLowerCase() === address &&
            a.bidder !== "0x0000000000000000000000000000000000000000",
        ).length,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
