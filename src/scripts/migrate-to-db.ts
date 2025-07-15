import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables FIRST
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });

// Ensure DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.error(
    "Make sure you have a .env.local file with your database credentials",
  );
  process.exit(1);
}

console.log("Environment variables loaded:", !!process.env.DATABASE_URL);

import { db } from "@/lib/db";
import {
  auctions,
  auctionTokenOwners,
  auctionCurators,
  auctionBidders,
} from "@/lib/db/schema";
import auctionsData from "../../public/data/auctions.json";
import type { AuctionData } from "./generateJSON";
import { zeroAddress } from "viem";
import { sql } from "drizzle-orm";

async function migrateToDatabase() {
  try {
    console.log("Starting migration...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    // Test the connection and check what database we're connected to
    const dbResult = await db.execute(sql`SELECT current_database()`);
    console.log("Connected to database:", dbResult[0]);

    // Check what tables exist
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(
      "Available tables:",
      result.map((r) => (r as { table_name: string }).table_name),
    );

    // Also check if we can see the tables directly
    const directCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'auctions'
      )
    `);
    console.log("Auctions table exists:", directCheck[0]);

    // If tables don't exist, let's create them
    if (result.length === 0) {
      console.log("No tables found, creating them...");

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "auctions" (
          "id" bigint PRIMARY KEY NOT NULL,
          "data" jsonb NOT NULL,
          "created_at" timestamp DEFAULT now(),
          "updated_at" timestamp DEFAULT now()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "auction_token_owners" (
          "auction_id" bigint,
          "owner_address" text NOT NULL,
          CONSTRAINT "auction_token_owners_auction_id_owner_address_pk" PRIMARY KEY("auction_id","owner_address"),
          FOREIGN KEY ("auction_id") REFERENCES "auctions"("id")
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "auction_curators" (
          "auction_id" bigint,
          "curator_address" text NOT NULL,
          CONSTRAINT "auction_curators_auction_id_curator_address_pk" PRIMARY KEY("auction_id","curator_address"),
          FOREIGN KEY ("auction_id") REFERENCES "auctions"("id")
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "auction_bidders" (
          "auction_id" bigint,
          "bidder_address" text NOT NULL,
          CONSTRAINT "auction_bidders_auction_id_bidder_address_pk" PRIMARY KEY("auction_id","bidder_address"),
          FOREIGN KEY ("auction_id") REFERENCES "auctions"("id")
        )
      `);

      // Create indexes
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS "idx_token_owners_address" ON "auction_token_owners"("owner_address")`,
      );
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS "idx_curators_address" ON "auction_curators"("curator_address")`,
      );
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS "idx_bidders_address" ON "auction_bidders"("bidder_address")`,
      );

      console.log("Tables created successfully");
    }

    // Clear existing data before inserting new data
    console.log("Clearing existing data...");
    await db.execute(sql`DELETE FROM auction_bidders`);
    console.log("Cleared bidders");
    await db.execute(sql`DELETE FROM auction_curators`);
    console.log("Cleared curators");
    await db.execute(sql`DELETE FROM auction_token_owners`);
    console.log("Cleared token owners");
    await db.execute(sql`DELETE FROM auctions`);
    console.log("Cleared auctions");
    console.log("All existing data cleared successfully");

    // Convert the auctions object to an array
    const auctionsArray = Object.values(auctionsData.auctions) as AuctionData[];
    const { indexes } = auctionsData;

    // Insert auction data
    console.log(`Inserting ${auctionsArray.length} auctions...`);
    for (const auction of auctionsArray) {
      await db.insert(auctions).values({
        id: BigInt(auction.auctionId), // Use auction.auctionId based on your JSON structure
        data: auction,
      });
    }

    // Insert token owner relationships
    console.log("Inserting token owner relationships...");
    for (const [ownerAddress, auctionIds] of Object.entries(
      indexes.byTokenOwner,
    )) {
      for (const auctionId of auctionIds) {
        await db.insert(auctionTokenOwners).values({
          auctionId: BigInt(auctionId),
          ownerAddress,
        });
      }
    }

    // Insert curator relationships
    console.log("Inserting curator relationships...");
    for (const [curatorAddress, auctionIds] of Object.entries(
      indexes.byCurator,
    )) {
      for (const auctionId of auctionIds) {
        await db.insert(auctionCurators).values({
          auctionId: BigInt(auctionId),
          curatorAddress,
        });
      }
    }

    // Extract and insert bidder relationships from auction data
    console.log("Extracting and inserting bidder relationships...");
    for (const auction of auctionsArray) {
      // Extract bidders from bids array
      if (auction.bidder && auction.bidder != zeroAddress) {
        await db.insert(auctionBidders).values({
          auctionId: BigInt(auction.auctionId), // Use auction.auctionId
          bidderAddress: auction.bidder,
        });
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// ES module way to check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToDatabase().catch(console.error);
}

export default migrateToDatabase;
