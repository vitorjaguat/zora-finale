import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import type { AuctionData } from "@/hooks/useAddressLookup";

interface AuctionsResult {
  address: string;
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[];
  breakdown: {
    active: {
      asTokenOwner: number;
      asCurator: number;
      asBidder: number;
    };
    settled: {
      asTokenOwner: number;
      asCurator: number;
      asBidder: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 },
      );
    }

    // Get auction IDs for each role with simple queries
    const [tokenOwnerResults, curatorResults, bidderResults] =
      await Promise.all([
        // Token owner auctions
        db.execute(sql`
        SELECT auction_id FROM auction_token_owners 
        WHERE LOWER(owner_address) = LOWER(${address})
      `),
        // Curator auctions
        db.execute(sql`
        SELECT auction_id FROM auction_curators 
        WHERE LOWER(curator_address) = LOWER(${address})
      `),
        // Bidder auctions
        db.execute(sql`
        SELECT auction_id FROM auction_bidders 
        WHERE LOWER(bidder_address) = LOWER(${address})
      `),
      ]);

    // Collect all unique auction IDs
    const tokenOwnerIds = new Set(
      tokenOwnerResults.map((r) => r.auction_id as number),
    );
    const curatorIds = new Set(
      curatorResults.map((r) => r.auction_id as number),
    );
    const bidderIds = new Set(bidderResults.map((r) => r.auction_id as number));

    const allAuctionIds = new Set([
      ...tokenOwnerIds,
      ...curatorIds,
      ...bidderIds,
    ]);

    if (allAuctionIds.size === 0) {
      return NextResponse.json({
        address,
        hasAuctions: false,
        auctionCount: 0,
        auctions: [],
        breakdown: {
          active: {
            asTokenOwner: 0,
            asCurator: 0,
            asBidder: 0,
          },
          settled: {
            asTokenOwner: 0,
            asCurator: 0,
            asBidder: 0,
          },
        },
      } satisfies AuctionsResult);
    }

    // Get auction details for all relevant auctions
    const auctionIdsArray = Array.from(allAuctionIds);
    const auctionDetails = await db.execute(sql`
      SELECT 
        id,
        token_id as "tokenId",
        token_contract as "tokenContract", 
        approved,
        amount,
        amount_formatted as "amountFormatted",
        duration,
        first_bid_time as "firstBidTime",
        reserve_price as "reservePrice",
        curator_fee_percentage as "curatorFeePercentage",
        token_owner as "tokenOwner",
        bidder,
        curator,
        currency,
        currency_symbol as "currencySymbol",
        currency_decimals as "currencyDecimals",
        is_settled as "isSettled"
      FROM auctions 
      WHERE id IN (${sql.join(
        auctionIdsArray.map((id) => sql`${Number(id)}`),
        sql`, `,
      )})
      ORDER BY id
    `);

    // Calculate breakdown by role and active/settled status
    let activeAsTokenOwner = 0;
    let activeAsCurator = 0;
    let activeAsBidder = 0;
    let settledAsTokenOwner = 0;
    let settledAsCurator = 0;
    let settledAsBidder = 0;

    // Transform and add auctionId field
    const auctions: AuctionData[] = auctionDetails.map((auction) => {
      if (auction.isSettled) {
        if (auction.tokenOwner === address) {
          settledAsTokenOwner++;
        }
        if (auction.bidder === address) {
          settledAsBidder++;
        }
        if (auction.curator === address && auction.tokenOwner !== address) {
          settledAsCurator++;
        }
      } else {
        if (auction.tokenOwner === address) {
          activeAsTokenOwner++;
        }
        if (auction.bidder === address) {
          activeAsBidder++;
        }
        if (auction.curator === address && auction.tokenOwner !== address) {
          activeAsCurator++;
        }
      }
      return {
        ...auction,
        auctionId: String(auction.id),
      };
    }) as AuctionData[];

    const response: AuctionsResult = {
      address,
      hasAuctions: auctions.length > 0,
      auctionCount: auctions.length,
      auctions,
      breakdown: {
        active: {
          asTokenOwner: activeAsTokenOwner,
          asCurator: activeAsCurator,
          asBidder: activeAsBidder,
        },
        settled: {
          asTokenOwner: settledAsTokenOwner,
          asCurator: settledAsCurator,
          asBidder: settledAsBidder,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to lookup address" },
      { status: 500 },
    );
  }
}
