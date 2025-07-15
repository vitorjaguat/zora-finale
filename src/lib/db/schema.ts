import {
  pgTable,
  bigint,
  text,
  timestamp,
  primaryKey,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const auctions = pgTable("auctions", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  data: jsonb("data").notNull(), // Store full auction data as JSON
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
