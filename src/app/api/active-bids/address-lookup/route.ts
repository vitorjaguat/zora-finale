import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Define the structure of an active bid
interface ActiveBid {
  eventType: string;
  implementation: string;
  eventSignature: string;
  tokenId: string;
  amount: string;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
  currencyDecimals: number;
  bidder: string;
  recipient: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  logIndex: number;
  processedAt: string;
  decodingMethod: string;
  rawData: Record<string, unknown>;
  contractVerification: Record<string, unknown>;
  tokenOwner: string;
}

interface ActiveBidsResult {
  activeBids: {
    hasActiveBids: boolean;
    bidsCount: number;
    bids: ActiveBid[];
    breakdown: {
      asTokenOwner: number;
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

    // Query the database for active bids where address is bidder or token owner
    try {
      const results = await db.execute(sql`
        WITH address_bids AS (
          -- Get bids where address is bidder
          SELECT 
            b.id,
            b.data,
            'bidder' as role
          FROM bids b
          JOIN bid_bidders bb ON b.id = bb.bid_id
          WHERE LOWER(bb.bidder_address) = LOWER(${address})
          AND b.is_active = 'true'
          
          UNION
          
          -- Get bids where address is token owner
          SELECT 
            b.id,
            b.data,
            'token_owner' as role
          FROM bids b
          JOIN bid_token_owners bto ON b.id = bto.bid_id
          WHERE LOWER(bto.owner_address) = LOWER(${address})
          AND b.is_active = 'true'
        ),
        role_counts AS (
          SELECT 
            COUNT(CASE WHEN role = 'token_owner' THEN 1 END) as token_owner_count,
            COUNT(CASE WHEN role = 'bidder' THEN 1 END) as bidder_count
          FROM address_bids
        ),
        unique_bids AS (
          SELECT DISTINCT id, data
          FROM address_bids
        )
        SELECT 
          COALESCE(
            JSON_AGG(
              ub.data ORDER BY ub.id
            ) FILTER (WHERE ub.id IS NOT NULL), 
            '[]'
          ) as bids,
          rc.token_owner_count::integer as token_owner_count,
          rc.bidder_count::integer as bidder_count
        FROM unique_bids ub
        CROSS JOIN role_counts rc
        GROUP BY rc.token_owner_count, rc.bidder_count
      `);

      const result = results[0] ?? {
        bids: [],
        token_owner_count: 0,
        bidder_count: 0,
      };

      // Handle the bids data - it should already be parsed JSON from the database
      let bidsData: ActiveBid[] = [];
      if ((result as { bids: string | ActiveBid[] | null }).bids) {
        if (
          typeof (result as { bids: string | ActiveBid[] | null }).bids ===
          "string"
        ) {
          if (typeof result.bids === "string") {
            bidsData = JSON.parse(result.bids) as ActiveBid[];
          }
        } else if (
          Array.isArray((result as { bids: ActiveBid[] | string | null }).bids)
        ) {
          bidsData = (result as { bids: ActiveBid[] }).bids;
        } else {
          console.log(
            "Unexpected bids data type:",
            typeof (result as { bids: string | ActiveBid[] | null }).bids,
            (result as { bids: string | ActiveBid[] | null }).bids,
          );
          bidsData = [];
        }
      }

      const tokenOwnerCount =
        "token_owner_count" in result &&
        typeof result.token_owner_count === "number"
          ? result.token_owner_count
          : 0;
      const bidderCount =
        "bidder_count" in result && typeof result.bidder_count === "number"
          ? result.bidder_count
          : 0;

      // Calculate breakdown
      const breakdown = {
        asTokenOwner: tokenOwnerCount,
        asBidder: bidderCount,
      };

      const response: ActiveBidsResult = {
        activeBids: {
          hasActiveBids: bidsData.length > 0,
          bidsCount: bidsData.length,
          bids: bidsData,
          breakdown,
        },
      };

      return NextResponse.json(response);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in active-bids address lookup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
