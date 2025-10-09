import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bids, auctions } from "@/lib/db/schema";
import { eq, sum, count, sql } from "drizzle-orm";

export interface ZeraUnlockedData {
  market: {
    reclaimedBids: number;
    reclaimedWETH: number;
    reclaimedDAI: number;
    reclaimedUSDC: number;
  };
  auctionHouse: {
    settledAuctions: number;
    reclaimedWETH: number;
  };
  nfts: {
    reclaimed: number;
    uniqueOwners: number;
  };
}

export async function GET() {
  try {
    // Market contract queries

    // Query 1: Count of reclaimed bids (inactive bids)
    const reclaimedBidsResult = await db
      .select({ count: count() })
      .from(bids)
      .where(eq(bids.isActive, false));
    const reclaimedBids = Number(reclaimedBidsResult[0]?.count ?? 0);

    // Query 2: Sum of reclaimed WETH from inactive bids
    const reclaimedWETHResult = await db
      .select({ total: sum(bids.amountFormatted) })
      .from(bids)
      .where(sql`${bids.isActive} = false AND ${bids.currencySymbol} = 'WETH'`);
    const reclaimedWETH = Number(reclaimedWETHResult[0]?.total ?? 0);

    // Query 3: Sum of reclaimed DAI from inactive bids
    const reclaimedDAIResult = await db
      .select({ total: sum(bids.amountFormatted) })
      .from(bids)
      .where(sql`${bids.isActive} = false AND ${bids.currencySymbol} = 'DAI'`);
    const reclaimedDAI = Number(reclaimedDAIResult[0]?.total ?? 0);

    // Query 4: Sum of reclaimed USDC from inactive bids
    const reclaimedUSDCResult = await db
      .select({ total: sum(bids.amountFormatted) })
      .from(bids)
      .where(sql`${bids.isActive} = false AND ${bids.currencySymbol} = 'USDC'`);
    const reclaimedUSDC = Number(reclaimedUSDCResult[0]?.total ?? 0);

    // Auction House contract queries

    // Query 5: Count of settled auctions (bidder != zero address)
    const settledAuctionsResult = await db
      .select({ count: count() })
      .from(auctions)
      .where(
        sql`${auctions.isSettled} = true AND ${auctions.bidder} != '0x0000000000000000000000000000000000000000'`,
      );
    const settledAuctions = Number(settledAuctionsResult[0]?.count ?? 0);

    // Query 6: Sum of reclaimed WETH from settled auctions
    const auctionReclaimedWETHResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${auctions.amountFormatted} AS DECIMAL)), 0)`,
      })
      .from(auctions)
      .where(eq(auctions.isSettled, true));
    const auctionReclaimedWETH = Number(
      auctionReclaimedWETHResult[0]?.total ?? 0,
    );

    // NFTs queries

    // Query 7: Count of reclaimed NFTs (settled auctions)
    const reclaimedNFTsResult = await db
      .select({ count: count() })
      .from(auctions)
      .where(eq(auctions.isSettled, true));
    const reclaimedNFTs = Number(reclaimedNFTsResult[0]?.count ?? 0);

    // Query 8: Count of unique owners from settled auctions
    const uniqueOwnersResult = await db
      .select({
        count: sql<string>`COUNT(DISTINCT ${auctions.tokenOwner})`,
      })
      .from(auctions)
      .where(eq(auctions.isSettled, true));
    const uniqueOwners = Number(uniqueOwnersResult[0]?.count ?? 0);

    const data: ZeraUnlockedData = {
      market: {
        reclaimedBids,
        reclaimedWETH,
        reclaimedDAI,
        reclaimedUSDC,
      },
      auctionHouse: {
        settledAuctions,
        reclaimedWETH: auctionReclaimedWETH,
      },
      nfts: {
        reclaimed: reclaimedNFTs,
        uniqueOwners,
      },
    };

    console.log("🔓 Zera unlocked data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Zera unlocked data:", error);
    return NextResponse.json(
      { error: "Failed to fetch unlocked assets data" },
      { status: 500 },
    );
  }
}
