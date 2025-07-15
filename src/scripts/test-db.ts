import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config({ path: ".env.local", override: true });

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function testDatabase() {
  try {
    console.log("Testing database...");

    // Test counts
    const auctionCount = await db.execute(sql`SELECT COUNT(*) FROM auctions`);
    console.log("Total auctions:", auctionCount[0]?.count ?? 0);

    const ownerCount = await db.execute(
      sql`SELECT COUNT(*) FROM auction_token_owners`,
    );
    console.log("Total token owner relationships:", ownerCount[0]?.count);

    const curatorCount = await db.execute(
      sql`SELECT COUNT(*) FROM auction_curators`,
    );
    console.log("Total curator relationships:", curatorCount[0]?.count);

    const bidderCount = await db.execute(
      sql`SELECT COUNT(*) FROM auction_bidders`,
    );
    console.log("Total bidder relationships:", bidderCount[0]?.count);

    // Test sample data
    const sampleAuctions = await db.execute(sql`
      SELECT id, data->>'tokenId' as token_id, data->>'tokenOwner' as token_owner 
      FROM auctions 
      LIMIT 3
    `);
    console.log("Sample auctions:", sampleAuctions);

    // Test a specific address lookup
    const testAddress = "0x1Eb5992385388f4c56c210f763D423AAE3911ba4";
    const ownerAuctions = await db.execute(sql`
      SELECT COUNT(*) 
      FROM auction_token_owners 
      WHERE owner_address = ${testAddress}
    `);
    console.log(`Auctions owned by ${testAddress}:`, ownerAuctions[0]?.count);

    console.log("Database test completed successfully!");
  } catch (error) {
    console.error("Database test failed:", error);
  }
}

testDatabase().catch(console.error);
