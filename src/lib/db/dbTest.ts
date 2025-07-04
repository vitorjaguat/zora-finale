import { auctionRepo } from "./dbClass"; // Remove .js extension

console.log("=== SQLite Database Test ===");
console.log(`Total auctions: ${auctionRepo.getTotalCount()}`);

// Test getting a specific auction
const auction = auctionRepo.getAuction("453");
if (auction) {
  console.log("\n=== Sample Auction ===");
  console.log(JSON.stringify(auction, null, 2));
}

// Test getting auctions by owner
const ownerAuctions = auctionRepo.getAuctionsByOwner(
  "0x7bd65884845d654224c659329c14e5b3a880353e",
);
console.log(`\n=== Auctions by owner ===`);
console.log(`Found ${ownerAuctions.length} auctions for this owner`);
