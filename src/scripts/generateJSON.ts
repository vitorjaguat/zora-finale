import { auctionRepo } from "../lib/db/dbClass";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔄 Generating JSON data for production...");

  try {
    // Get all auctions from SQLite
    const allAuctions: any = {};
    
    // You might need to add a getAllAuctions method to your repo
    // For now, let's generate from known data
    for (let i = 400; i <= 500; i++) {
      const auction = auctionRepo.getAuction(i.toString());
      if (auction) {
        allAuctions[auction.auctionId] = auction;
      }
    }

    // Ensure public/data directory exists
    const dataDir = path.join(process.cwd(), "public", "data");
    fs.mkdirSync(dataDir, { recursive: true });

    // Save as JSON
    const filePath = path.join(dataDir, "auctions.json");
    fs.writeFileSync(filePath, JSON.stringify(allAuctions, null, 2));

    console.log(`✅ Generated JSON data: ${filePath}`);
    console.log(`📊 Total auctions: ${Object.keys(allAuctions).length}`);
    
  } catch (error) {
    console.error("❌ Failed to generate JSON:", error);
    process.exit(1);
  }
}

main().catch(console.error);