import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AlchemyNFTResponse } from "@/hooks/useNFTMetadata";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY; // No NEXT_PUBLIC prefix

if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is not set in environment variables");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get("contractAddress");
    const tokenId = searchParams.get("tokenId");

    if (!contractAddress || !tokenId) {
      return NextResponse.json(
        { error: "Missing contractAddress or tokenId" },
        { status: 400 },
      );
    }

    const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata`;
    const params = new URLSearchParams({
      contractAddress,
      tokenId,
      refreshCache: "false",
    });

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Alchemy API error: ${response.status} ${response.statusText}`,
      );
    }

    const rawData: unknown = await response.json();
    if (rawData && typeof rawData === "object" && rawData !== null) {
      const data = rawData as AlchemyNFTResponse;
      return NextResponse.json(data);
    } else {
      throw new Error("Invalid response format from Alchemy API");
    }
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFT metadata" },
      { status: 500 },
    );
  }
}
