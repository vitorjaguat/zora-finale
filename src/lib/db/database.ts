import Database from 'better-sqlite3';
import path from 'path';

// Choose database path based on environment
function getDatabasePath(): string {
  if (process.env.NODE_ENV === 'production') {
    // In production, read from the deployed static file
    return path.join(process.cwd(), 'public', 'data', 'auctions.db');
  } else {
    // In development, use the writable src directory
    return path.join(process.cwd(), 'src', 'data', 'auctions.db');
  }
}

const dbPath = getDatabasePath();

// Create or open the database (read-only in production)
const db = new Database(dbPath, {
  readonly: process.env.NODE_ENV === 'production'
});

// Only create tables in development
if (process.env.NODE_ENV !== 'production') {
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables and indexes (only in development)
  db.exec(`
    CREATE TABLE IF NOT EXISTS auctions (
      auction_id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      token_contract TEXT NOT NULL,
      approved INTEGER NOT NULL,
      amount TEXT NOT NULL,
      duration TEXT NOT NULL,
      first_bid_time TEXT NOT NULL,
      reserve_price TEXT NOT NULL,
      curator_fee_percentage INTEGER NOT NULL,
      token_owner TEXT NOT NULL,
      bidder TEXT NOT NULL,
      curator TEXT NOT NULL,
      auction_currency TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_token_owner ON auctions(token_owner);
    CREATE INDEX IF NOT EXISTS idx_bidder ON auctions(bidder);
    CREATE INDEX IF NOT EXISTS idx_curator ON auctions(curator);
    CREATE INDEX IF NOT EXISTS idx_token_contract ON auctions(token_contract);
    CREATE INDEX IF NOT EXISTS idx_reserve_price ON auctions(CAST(reserve_price AS INTEGER));
  `);

  console.log('✅ Database initialized at:', dbPath);
} else {
  console.log('📖 Using read-only database at:', dbPath);
}

export { db };
