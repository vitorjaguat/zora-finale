import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });

// Ensure DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.error(
    "Make sure you have a .env.local file with your database credentials",
  );
  process.exit(1);
}

import { db } from "@/lib/db";
import { auctions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Update auction settlement status
 * @param auctionId - The auction ID to update
 * @param isSettled - Whether the auction is settled
 */
async function updateAuctionSettlement(auctionId: bigint, isSettled: boolean) {
  try {
    console.log(
      `Updating auction ${auctionId} settlement status to ${isSettled}...`,
    );

    // Get the current auction data
    const [auction] = await db
      .select()
      .from(auctions)
      .where(eq(auctions.id, auctionId));

    if (!auction) {
      throw new Error(`Auction ${auctionId} not found`);
    }

    // Update the data with new settlement status
    const currentData = auction.data as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      isSettled,
    };

    // Update the auction in the database
    await db
      .update(auctions)
      .set({
        data: updatedData,
        updatedAt: new Date(),
      })
      .where(eq(auctions.id, auctionId));

    console.log(`✅ Auction ${auctionId} updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating auction ${auctionId}:`, error);
    throw error;
  }
}

/**
 * Batch update multiple auctions
 * @param updates - Array of {auctionId, isSettled} objects
 */
async function batchUpdateAuctions(
  updates: Array<{ auctionId: bigint; isSettled: boolean }>,
) {
  console.log(`Starting batch update of ${updates.length} auctions...`);

  for (const update of updates) {
    await updateAuctionSettlement(update.auctionId, update.isSettled);
  }

  console.log(`✅ Batch update completed successfully`);
}

// Export functions for use in other scripts
export { updateAuctionSettlement, batchUpdateAuctions };

// CLI usage example
if (process.argv.length > 2) {
  const auctionIdArg = process.argv[2];
  const isSettledArg = process.argv[3];

  if (!auctionIdArg || !isSettledArg) {
    console.error(
      "Usage: tsx update-auction-settlement.ts <auctionId> <isSettled>",
    );
    process.exit(1);
  }

  const auctionId = BigInt(auctionIdArg);
  const isSettled = isSettledArg === "true";

  updateAuctionSettlement(auctionId, isSettled)
    .then(() => console.log("Update completed"))
    .catch(console.error);
}
