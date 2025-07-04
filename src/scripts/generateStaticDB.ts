import { fetchAllAuctions } from "../lib/db/dbFetcher";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔄 Generating SQLite database for production...");

  // Fetch all auction data and save to SQLite
  await fetchAllAuctions();

  // Copy the SQLite database to public directory so it gets deployed
  const srcDB = path.join(process.cwd(), "src", "data", "auctions.db");
  const publicDB = path.join(process.cwd(), "public", "data", "auctions.db");

  // Ensure public/data directory exists
  fs.mkdirSync(path.dirname(publicDB), { recursive: true });

  // Copy database file
  fs.copyFileSync(srcDB, publicDB);

  console.log(`✅ SQLite database copied to: ${publicDB}`);
}

main().catch(console.error);
