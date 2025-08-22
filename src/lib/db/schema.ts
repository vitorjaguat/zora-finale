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
  id: text("id").primaryKey(), // Using transactionHash + logIndex as unique ID
  transactionHash: text("transaction_hash").notNull(),
  logIndex: bigint("log_index", { mode: "bigint" }).notNull(),
  tokenId: text("token_id").notNull(),
  tokenContract: text("token_contract")
    .notNull()
    .default("0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7"),
  amount: text("amount").notNull(), // Store as string to avoid precision loss
  amountFormatted: text("amount_formatted").notNull(),
  currency: text("currency").notNull(),
  currencySymbol: text("currency_symbol").notNull(),
  currencyDecimals: bigint("currency_decimals", { mode: "number" }).notNull(),
  bidder: text("bidder").notNull(),
  recipient: text("recipient").notNull(),
  tokenOwner: text("token_owner").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),

  // Status tracking
  isActive: text("is_active").notNull().default("true"), // "true", "false"
  isWithdrawn: text("is_withdrawn").notNull().default("false"), // "true", "false"
  isAccepted: text("is_accepted").notNull().default("false"), // "true", "false"

  // Full JSON data for complete information
  data: jsonb("data").notNull(),

  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
