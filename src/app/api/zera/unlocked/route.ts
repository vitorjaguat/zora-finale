import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bids, auctions } from "@/lib/db/schema";
import { eq, sum, count, sql } from "drizzle-orm";

export interface ZeraUnlockedData {
  unlockedEthMarket: number;
  unlockedEthAuctionHouse: number;
  unlockedNFTs: number;
}

export async function GET() {
  try {
    // Query 1: Sum of ETH from inactive bids (Market contract)
    // bids.amountFormatted is numeric type
    const marketResult = await db
      .select({ total: sum(bids.amountFormatted) })
      .from(bids)
      .where(eq(bids.isActive, false));
    const unlockedEthMarket = Number(marketResult[0]?.total ?? 0);

    // Query 2: Sum of ETH from settled auctions (Auction House contract)
    // auctions.amountFormatted is text type, so we need to cast it
    const auctionEthResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${auctions.amountFormatted} AS NUMERIC(20,8))), 0)`,
      })
      .from(auctions)
      .where(eq(auctions.isSettled, true));
    const unlockedEthAuctionHouse = Number(auctionEthResult[0]?.total ?? 0);

    // Query 3: Count of settled auctions (unlocked NFTs)
    const nftResult = await db
      .select({ count: count() })
      .from(auctions)
      .where(eq(auctions.isSettled, true));
    const unlockedNFTs = Number(nftResult[0]?.count ?? 0);

    const data: ZeraUnlockedData = {
      unlockedEthMarket,
      unlockedEthAuctionHouse,
      unlockedNFTs,
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
