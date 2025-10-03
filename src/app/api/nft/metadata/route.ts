import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AlchemyNFTResponse } from "@/hooks/useNFTMetadata";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { MEDIA_CONTRACT } from "@/config/contract";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;

if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is not set in environment variables");
}

if (!ALCHEMY_RPC_URL) {
  throw new Error("ALCHEMY_RPC_URL is not set in environment variables");
}

// Create a public client for contract interactions
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(ALCHEMY_RPC_URL),
});

export interface TokenMetadataUri {
  title?: string;
  description?: string;
  image?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get("contractAddress");
  const tokenId = searchParams.get("tokenId");

  if (!contractAddress || !tokenId) {
    return NextResponse.json(
      { error: "Missing contractAddress or tokenId" },
      { status: 400 },
    );
  }

  // TODO: remove getNFTMetadata, as the basic metadata is already being batch fetched with alchemy SDK in api/nft/firstMetadataBatch; return only the metadataUri property object and use it on BidCard and AuctionCard

  // Enhanced metadata fetching from Media contract
  try {
    // Only fetch from Media contract if it's the Zora Media contract
    if (
      contractAddress.toLowerCase() === MEDIA_CONTRACT.address.toLowerCase()
    ) {
      console.log(`Fetching tokenMetadataURI for token ${tokenId}...`);

      const metadataURI = await publicClient.readContract({
        address: MEDIA_CONTRACT.address,
        abi: MEDIA_CONTRACT.abi,
        functionName: "tokenMetadataURI",
        args: [BigInt(tokenId)],
      });

      console.log(`TokenMetadataURI: ${metadataURI}`);

      if (metadataURI && metadataURI.trim() !== "") {
        // Resolve IPFS URLs to gateway URLs
        const resolvedURI = metadataURI.startsWith("ipfs://")
          ? metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/")
          : metadataURI;

        console.log(`Fetching metadata from: ${resolvedURI}`);

        // Fetch the metadata JSON
        const metadataResponse = await fetch(resolvedURI, {
          headers: {
            Accept: "application/json",
          },
        });

        if (metadataResponse.ok) {
          const metadata = (await metadataResponse.json()) as TokenMetadataUri;
          console.log("Successfully fetched metadata:", metadata);

          return NextResponse.json(metadata);
        } else {
          console.warn(
            `Failed to fetch metadata from URI: ${metadataResponse.status} ${metadataResponse.statusText}`,
          );
        }
      } else {
        console.log("No metadata URI found for this token");
      }
    }
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFT metadata" },
      { status: 500 },
    );
  }
}
