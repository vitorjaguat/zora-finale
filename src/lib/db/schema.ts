import {
  pgTable,
  bigint,
  text,
  timestamp,
  primaryKey,
  index,
  jsonb,
  integer,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

export const auctions = pgTable("auctions", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),

  // Core auction properties
  tokenId: text("token_id").notNull(),
  tokenContract: text("token_contract").notNull(),
  approved: boolean("approved").notNull(),
  amount: text("amount").notNull(), // Store as string to preserve precision
  amountFormatted: text("amount_formatted").notNull(),
  duration: text("duration").notNull(),
  firstBidTime: text("first_bid_time").notNull(),
  reservePrice: text("reserve_price").notNull(),
  curatorFeePercentage: integer("curator_fee_percentage").notNull(),

  // Address fields
  tokenOwner: text("token_owner").notNull(),
  bidder: text("bidder").notNull(),
  curator: text("curator").notNull(),

  // Currency information
  currency: text("currency").notNull(), // The auctionCurrency address
  currencySymbol: text("currency_symbol").notNull(),
  currencyDecimals: integer("currency_decimals").notNull(),

  // Status
  isSettled: boolean("is_settled").notNull(),

  // Full JSON data for complete information
  data: jsonb("data").notNull(),

  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auctionTokenOwners = pgTable(
  "auction_token_owners",
  {
    auctionId: bigint("auction_id", { mode: "bigint" }).references(
      () => auctions.id,
    ),
    ownerAddress: text("owner_address").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.auctionId, table.ownerAddress] }),
    ownerIdx: index("idx_token_owners_address").on(table.ownerAddress),
  }),
);

export const auctionCurators = pgTable(
  "auction_curators",
  {
    auctionId: bigint("auction_id", { mode: "bigint" }).references(
      () => auctions.id,
    ),
    curatorAddress: text("curator_address").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.auctionId, table.curatorAddress] }),
    curatorIdx: index("idx_curators_address").on(table.curatorAddress),
  }),
);

export const auctionBidders = pgTable(
  "auction_bidders",
  {
    auctionId: bigint("auction_id", { mode: "bigint" }).references(
      () => auctions.id,
    ),
    bidderAddress: text("bidder_address").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.auctionId, table.bidderAddress] }),
    bidderIdx: index("idx_bidders_address").on(table.bidderAddress),
  }),
);

// Bids table schema
export const bids = pgTable("bids", {
  // Core identification
  id: text("id").primaryKey(),
  transactionHash: text("transaction_hash").notNull(),
  logIndex: integer("log_index").notNull(),

  // Token info
  tokenId: text("token_id").notNull(),
  tokenContract: text("token_contract").notNull(),

  // Amounts & Currency
  amount: numeric("amount", { precision: 38, scale: 0 }).notNull(), // Raw wei amount
  amountFormatted: numeric("amount_formatted", {
    precision: 20,
    scale: 8,
  }).notNull(), // Formatted amount
  currency: text("currency").notNull(),
  currencySymbol: text("currency_symbol").notNull(),
  currencyDecimals: integer("currency_decimals").notNull(),

  // Addresses
  bidder: text("bidder").notNull(),
  recipient: text("recipient").notNull(),
  tokenOwner: text("token_owner").notNull(),

  // Timing & Block
  timestamp: timestamp("timestamp").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),

  // Status (converted from strings to booleans)
  isActive: boolean("is_active").notNull().default(true),
  isWithdrawn: boolean("is_withdrawn").notNull().default(false),
  isAccepted: boolean("is_accepted").notNull().default(false),

  // Metadata
  createdAt: timestamp("created_at").notNull(), // From JSON data, not defaultNow
  updatedAt: timestamp("updated_at").defaultNow(), // Migration timestamp
});

// Simplified relationship tables
export const bidBidders = pgTable(
  "bid_bidders",
  {
    bidId: text("bid_id").references(() => bids.id),
    bidderAddress: text("bidder_address").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bidId, table.bidderAddress] }),
    bidderIdx: index("idx_bid_bidders_address").on(table.bidderAddress),
  }),
);

export const bidTokenOwners = pgTable(
  "bid_token_owners",
  {
    bidId: text("bid_id").references(() => bids.id),
    ownerAddress: text("owner_address").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bidId, table.ownerAddress] }),
    ownerIdx: index("idx_bid_token_owners_address").on(table.ownerAddress),
  }),
);
