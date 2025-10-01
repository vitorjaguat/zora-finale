import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Alchemy, Network } from "alchemy-sdk";
import type { AuctionData, Result } from "@/hooks/useAddressLookup";
import type { AlchemyNFTResponse } from "@/hooks/useNFTMetadata";
import type { Bid } from "../../bids/address-lookup/route";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is not set in environment variables");
}

const alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

// Enhanced types with metadata
export interface AuctionDataWithMetadata extends AuctionData {
  metadata?: AlchemyNFTResponse;
}

export interface BidDataWithMetadata extends Bid {
  metadata?: AlchemyNFTResponse;
}

export interface ResultWithFirstMetadata
  extends Omit<Result, "auctions" | "bids"> {
  auctions: AuctionDataWithMetadata[];
  bids: {
    hasBids?: boolean;
    bidsCount?: number;
    breakdown?: {
      active: {
        asTokenOwner: number;
        asBidder: number;
      };
      settled: {
        asTokenOwner: number;
        asBidder: number;
      };
    };
    bids: BidDataWithMetadata[];
  };
}

interface TokenReference {
  contractAddress: string;
  tokenId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Result;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected Result object." },
        { status: 400 },
      );
    }

    // Extract unique tokens from auctions and bids
    const uniqueTokens = new Map<string, TokenReference>();

    // Collect tokens from auctions
    if (body?.auctions) {
      body.auctions.forEach((auction) => {
        const key = `${auction.tokenContract}-${auction.tokenId}`;
        uniqueTokens.set(key, {
          contractAddress: auction.tokenContract,
          tokenId: auction.tokenId,
        });
      });
    }

    // Collect tokens from bids
    if (body.bids?.bids) {
      body.bids.bids.forEach((bid) => {
        const key = `${bid.tokenContract}-${bid.tokenId}`;
        uniqueTokens.set(key, {
          contractAddress: bid.tokenContract,
          tokenId: bid.tokenId,
        });
      });
    }

    const tokens = Array.from(uniqueTokens.values());
    console.log(`Fetching metadata for ${tokens.length} unique tokens`);

    const metadataMap = new Map<string, AlchemyNFTResponse>();

    // Fetch metadata in batches (Alchemy supports up to 100 tokens per batch)
    if (tokens.length > 0) {
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < tokens.length; i += batchSize) {
        batches.push(tokens.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        try {
          console.log(`Processing batch of ${batch.length} tokens`);

          const batchResults = await alchemy.nft.getNftMetadataBatch(
            batch.map((token) => ({
              contractAddress: token.contractAddress,
              tokenId: token.tokenId,
            })),
          );

          // Map results to our metadata map
          batchResults.nfts.forEach((nft, index) => {
            if (nft && batch[index]) {
              const key = `${batch[index].contractAddress}-${batch[index].tokenId}`;
              metadataMap.set(key, nft as AlchemyNFTResponse);
            }
          });
        } catch (batchError) {
          console.error(`Error processing batch:`, batchError);
          // Continue with other batches even if one fails
        }
      }
    }

    console.log(`Successfully fetched metadata for ${metadataMap.size} tokens`);

    // Helper function to get metadata for a token
    const getMetadata = (
      tokenContract: string,
      tokenId: string,
    ): AlchemyNFTResponse | undefined => {
      const key = `${tokenContract}-${tokenId}`;
      return metadataMap.get(key);
    };

    // Enhance auctions with metadata
    const enhancedAuctions: AuctionDataWithMetadata[] =
      body.auctions?.map((auction) => ({
        ...auction,
        metadata: getMetadata(auction.tokenContract, auction.tokenId),
      })) || [];

    // Enhance bids with metadata
    const enhancedBids: BidDataWithMetadata[] =
      body.bids?.bids?.map((bid) => ({
        ...bid,
        metadata: getMetadata(bid.tokenContract, bid.tokenId),
      })) ?? [];

    // Create the enhanced result
    const resultWithMetadata: ResultWithFirstMetadata = {
      ...body,
      auctions: enhancedAuctions,
      bids: {
        ...body.bids,
        bids: enhancedBids,
      },
    };

    console.log("Results with metadata:");
    console.dir(resultWithMetadata);

    return NextResponse.json(resultWithMetadata);
  } catch (error) {
    console.error("Error processing batch metadata request:", error);
    return NextResponse.json(
      {
        error: "Failed to process batch metadata request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
