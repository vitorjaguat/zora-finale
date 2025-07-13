import { createPublicClient, http, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import { CONTRACT } from "@/config/contract";
import fs from "fs";
import path from "path";

export interface AuctionData {
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

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ALCHEMY_RPC_URL),
});

function createIndexes(
  auctions: Record<string, AuctionData>,
): AuctionDatabase["indexes"] {
  const byTokenOwner: Record<string, string[]> = {};
  const byCurator: Record<string, string[]> = {};
  const byBidder: Record<string, string[]> = {};
  const byTokenContract: Record<string, string[]> = {};

  for (const [auctionId, auction] of Object.entries(auctions)) {
    // Index by tokenOwner
    const tokenOwner = auction.tokenOwner.toLowerCase();
    byTokenOwner[tokenOwner] ??= [];
    byTokenOwner[tokenOwner].push(auctionId);

    // Index by curator
    const curator = auction.curator.toLowerCase();
    if (curator != tokenOwner) {
      byCurator[curator] ??= [];
      byCurator[curator].push(auctionId);
    }

    // Index by bidder
    const bidder = auction.bidder.toLowerCase();
    if (bidder != zeroAddress) {
      byBidder[bidder] ??= [];
      byBidder[bidder].push(auctionId);
    }

    // Index by tokenContract
    const tokenContract = auction.tokenContract.toLowerCase();
    byTokenContract[tokenContract] ??= [];
    byTokenContract[tokenContract].push(auctionId);
  }

  return {
    byTokenOwner,
    byCurator,
    byBidder,
    byTokenContract,
  };
}

async function fetchAuctionsToJSON(): Promise<void> {
  const startId = 1n;
  const endId = 8410n;
  const allAuctions: Record<string, AuctionData> = {};

  console.log(`🔄 Fetching auctions from ${startId} to ${endId} via RPC...`);

  // Create array of auction IDs to fetch
  const auctionIdsToFetch: bigint[] = [];
  for (let i = startId; i <= endId; i++) {
    auctionIdsToFetch.push(i);
  }

  // Batch the requests to avoid rate limits
  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < auctionIdsToFetch.length; i += batchSize) {
    batches.push(auctionIdsToFetch.slice(i, i + batchSize));
  }

  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

    const batchPromises = batch.map(async (auctionId) => {
      try {
        const auctionData = await publicClient.readContract({
          address: CONTRACT.address,
          abi: CONTRACT.abi,
          functionName: "auctions",
          args: [auctionId],
        });

        return {
          auctionId: auctionId.toString(),
          data: auctionData,
        };
      } catch (error) {
        console.warn(`Failed to fetch auction ${auctionId}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    // Process results
    batchResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        const { auctionId, data } = result.value;

        if (data && Array.isArray(data) && data.length >= 12) {
          const [
            tokenId,
            tokenContract,
            approved,
            amount,
            duration,
            firstBidTime,
            reservePrice,
            curatorFeePercentage,
            tokenOwner,
            bidder,
            curator,
            auctionCurrency,
          ] = data;

          // Only include auctions that actually exist
          if (
            tokenContract &&
            tokenContract !== "0x0000000000000000000000000000000000000000"
          ) {
            const parsedAuction: AuctionData = {
              auctionId,
              tokenId: String(tokenId),
              tokenContract: String(tokenContract),
              approved: Boolean(approved),
              amount: String(amount),
              duration: String(duration),
              firstBidTime: String(firstBidTime),
              reservePrice: String(reservePrice),
              curatorFeePercentage: Number(curatorFeePercentage),
              tokenOwner: String(tokenOwner),
              bidder: String(bidder),
              curator: String(curator),
              auctionCurrency: String(auctionCurrency),
            };

            allAuctions[auctionId] = parsedAuction;
          }
        }
      }
    });

    // Add delay between batches
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Create indexes for fast lookups
  console.log("🔍 Creating indexes for fast lookups...");
  const indexes = createIndexes(allAuctions);

  // Create the complete database structure
  const database: AuctionDatabase = {
    auctions: allAuctions,
    indexes,
    metadata: {
      totalAuctions: Object.keys(allAuctions).length,
      generatedAt: new Date().toISOString(),
      startId: Number(startId),
      endId: Number(endId),
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(dataDir, { recursive: true });

  // Save as JSON
  const filePath = path.join(dataDir, "auctions.json");
  fs.writeFileSync(filePath, JSON.stringify(database, null, 2));

  console.log(`✅ Generated indexed JSON database: ${filePath}`);
  console.log(`📊 Total auctions: ${database.metadata.totalAuctions}`);
  console.log(
    `🔍 Indexed ${Object.keys(indexes.byTokenOwner).length} token owners`,
  );
  console.log(`🔍 Indexed ${Object.keys(indexes.byCurator).length} curators`);
  console.log(`🔍 Indexed ${Object.keys(indexes.byBidder).length} bidders`);
}

async function main(): Promise<void> {
  try {
    await fetchAuctionsToJSON();
  } catch (error) {
    console.error("❌ Failed to generate JSON:", error);
    process.exit(1);
  }
}

main().catch(console.error);
