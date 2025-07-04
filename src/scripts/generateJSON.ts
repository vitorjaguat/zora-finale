import fs from "fs";
import path from "path";

interface AuctionData {
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

interface AuctionDataMap {
  [key: string]: AuctionData;
}

async function main() {
  console.log("🔄 Generating JSON data for production...");

  try {
    // Import auction repo
    const { auctionRepo } = await import("../lib/db/dbClass");

    const allAuctions: AuctionDataMap = {};

    // Get auctions from SQLite database
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
