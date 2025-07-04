import { db } from "./database";

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

// Define the database row type
interface AuctionRow {
  auction_id: string;
  token_id: string;
  token_contract: string;
  approved: number;
  amount: string;
  duration: string;
  first_bid_time: string;
  reserve_price: string;
  curator_fee_percentage: number;
  token_owner: string;
  bidder: string;
  curator: string;
  auction_currency: string;
}

export class AuctionRepository {
  // Prepared statements for better performance
  private insertStmt = db.prepare(`
    INSERT OR REPLACE INTO auctions (
      auction_id, token_id, token_contract, approved, amount, duration,
      first_bid_time, reserve_price, curator_fee_percentage, token_owner,
      bidder, curator, auction_currency, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  private getByIdStmt = db.prepare(
    "SELECT * FROM auctions WHERE auction_id = ?",
  );
  private getByOwnerStmt = db.prepare(
    "SELECT * FROM auctions WHERE token_owner = ? COLLATE NOCASE ORDER BY auction_id",
  );
  private getByBidderStmt = db.prepare(`
    SELECT * FROM auctions 
    WHERE bidder = ? AND bidder != '0x0000000000000000000000000000000000000000' 
    COLLATE NOCASE ORDER BY auction_id
  `);
  private getCountStmt = db.prepare("SELECT COUNT(*) as count FROM auctions");

  // Insert a single auction
  insertAuction(auction: AuctionData): void {
    this.insertStmt.run(
      auction.auctionId,
      auction.tokenId,
      auction.tokenContract,
      auction.approved ? 1 : 0,
      auction.amount,
      auction.duration,
      auction.firstBidTime,
      auction.reservePrice,
      auction.curatorFeePercentage,
      auction.tokenOwner.toLowerCase(),
      auction.bidder.toLowerCase(),
      auction.curator.toLowerCase(),
      auction.auctionCurrency,
    );
  }

  // Insert many auctions in a transaction (faster)
  insertAuctions(auctions: AuctionData[]): void {
    const transaction = db.transaction((auctions: AuctionData[]) => {
      for (const auction of auctions) {
        this.insertAuction(auction);
      }
    });

    transaction(auctions);
  }

  // Get auction by ID
  getAuction(auctionId: string): AuctionData | null {
    const row = this.getByIdStmt.get(auctionId) as AuctionRow | undefined;
    return row ? this.mapRowToAuction(row) : null;
  }

  // Get auctions by token owner
  getAuctionsByOwner(owner: string): AuctionData[] {
    const rows = this.getByOwnerStmt.all(owner.toLowerCase()) as AuctionRow[];
    return rows.map((row) => this.mapRowToAuction(row));
  }

  // Get auctions by bidder
  getAuctionsByBidder(bidder: string): AuctionData[] {
    const rows = this.getByBidderStmt.all(bidder.toLowerCase()) as AuctionRow[];
    return rows.map((row) => this.mapRowToAuction(row));
  }

  // Get total count
  getTotalCount(): number {
    const result = this.getCountStmt.get() as { count: number };
    return result.count;
  }

  // Clear all auctions (useful for fresh imports)
  clearAll(): void {
    db.exec("DELETE FROM auctions");
  }

  // Convert database row to AuctionData
  private mapRowToAuction(row: AuctionRow): AuctionData {
    return {
      auctionId: row.auction_id,
      tokenId: row.token_id,
      tokenContract: row.token_contract,
      approved: row.approved === 1,
      amount: row.amount,
      duration: row.duration,
      firstBidTime: row.first_bid_time,
      reservePrice: row.reserve_price,
      curatorFeePercentage: row.curator_fee_percentage,
      tokenOwner: row.token_owner,
      bidder: row.bidder,
      curator: row.curator,
      auctionCurrency: row.auction_currency,
    };
  }
}

// Export a singleton instance
export const auctionRepo = new AuctionRepository();
