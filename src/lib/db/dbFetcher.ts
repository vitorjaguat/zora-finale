import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { CONTRACT } from "@/config/contract";
import { auctionRepo } from "./dbClass";
import type { AuctionData } from "./dbClass";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ALCHEMY_RPC_URL),
});

export async function fetchAllAuctions(): Promise<void> {
  const startId = 400n;
  const endId = 500n;
  const auctions: AuctionData[] = [];

  console.log(`Fetching auctions from ${startId} to ${endId}...`);

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

            auctions.push(parsedAuction);
          }
        }
      }
    });

    // Add delay between batches
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Save all auctions to SQLite in a single transaction
  console.log(`Saving ${auctions.length} auctions to database...`);
  auctionRepo.insertAuctions(auctions);

  console.log(`✅ Saved ${auctions.length} auctions to SQLite database`);
  console.log(`📊 Total auctions in database: ${auctionRepo.getTotalCount()}`);
}

// Main execution function
async function main(): Promise<void> {
  try {
    await fetchAllAuctions();
  } catch (error) {
    console.error("Failed to fetch auctions:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
