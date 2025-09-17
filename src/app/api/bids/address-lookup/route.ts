import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Define the structure of an active bid
interface ActiveBid {
  id: string;
  transactionHash: string;
  logIndex: number;
  tokenId: string;
  tokenContract: string;
  amount: string;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
  currencyDecimals: number;
  bidder: string;
  recipient: string;
  tokenOwner: string;
  timestamp: string;
  blockNumber: number;
  isActive: boolean;
  isWithdrawn: boolean;
  isAccepted: boolean;
  processedAt: string;
  status: "active" | "withdrawn" | "accepted" | "inactive";
  // Legacy fields for backwards compatibility
  eventType?: string;
  implementation?: string;
  eventSignature?: string;
  decodingMethod?: string;
  rawData?: Record<string, unknown>;
  contractVerification?: Record<string, unknown>;
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
            b.transaction_hash,
            b.log_index,
            b.token_id,
            b.token_contract,
            b.amount,
            b.amount_formatted,
            b.currency,
            b.currency_symbol,
            b.currency_decimals,
            b.bidder,
            b.recipient,
            b.token_owner,
            b.timestamp,
            b.block_number,
            b.is_active,
            b.is_withdrawn,
            b.is_accepted,
            b.created_at,
            'bidder' as role
          FROM bids b
          JOIN bid_bidders bb ON b.id = bb.bid_id
          WHERE LOWER(bb.bidder_address) = LOWER(${address})
          
          UNION
          
          -- Get bids where address is token owner
          SELECT 
            b.id,
            b.transaction_hash,
            b.log_index,
            b.token_id,
            b.token_contract,
            b.amount,
            b.amount_formatted,
            b.currency,
            b.currency_symbol,
            b.currency_decimals,
            b.bidder,
            b.recipient,
            b.token_owner,
            b.timestamp,
            b.block_number,
            b.is_active,
            b.is_withdrawn,
            b.is_accepted,
            b.created_at,
            'token_owner' as role
          FROM bids b
          JOIN bid_token_owners bto ON b.id = bto.bid_id
          WHERE LOWER(bto.owner_address) = LOWER(${address})
        ),
        role_counts AS (
          SELECT 
            COUNT(CASE WHEN role = 'token_owner' THEN 1 END) as token_owner_count,
            COUNT(CASE WHEN role = 'bidder' THEN 1 END) as bidder_count
          FROM address_bids
        ),
        unique_bids AS (
          SELECT DISTINCT 
            id,
            transaction_hash,
            log_index,
            token_id,
            token_contract,
            amount,
            amount_formatted,
            currency,
            currency_symbol,
            currency_decimals,
            bidder,
            recipient,
            token_owner,
            timestamp,
            block_number,
            is_active,
            is_withdrawn,
            is_accepted,
            created_at
          FROM address_bids
        )
        SELECT 
          COALESCE(
            JSON_AGG(
              json_build_object(
                'id', ub.id,
                'transactionHash', ub.transaction_hash,
                'logIndex', ub.log_index,
                'tokenId', ub.token_id,
                'tokenContract', ub.token_contract,
                'amount', ub.amount,
                'amountFormatted', ub.amount_formatted,
                'currency', ub.currency,
                'currencySymbol', ub.currency_symbol,
                'currencyDecimals', ub.currency_decimals,
                'bidder', ub.bidder,
                'recipient', ub.recipient,
                'tokenOwner', ub.token_owner,
                'timestamp', ub.timestamp,
                'blockNumber', ub.block_number,
                'isActive', ub.is_active,
                'isWithdrawn', ub.is_withdrawn,
                'isAccepted', ub.is_accepted,
                'processedAt', ub.created_at,
                'status', 
                CASE 
                  WHEN ub.is_accepted = true THEN 'accepted'
                  WHEN ub.is_withdrawn = true THEN 'withdrawn'
                  WHEN ub.is_active = true THEN 'active'
                  ELSE 'inactive'
                END
              ) ORDER BY ub.id
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

      // Handle the bids data - now includes all bid fields directly
      let bidsData: ActiveBid[] = [];
      if ((result as { bids: string | unknown[] | null }).bids) {
        if (
          typeof (result as { bids: string | unknown[] | null }).bids ===
          "string"
        ) {
          if (typeof result.bids === "string") {
            bidsData = JSON.parse(result.bids) as ActiveBid[];
          }
        } else if (
          Array.isArray((result as { bids: unknown[] | string | null }).bids)
        ) {
          bidsData = (result as { bids: ActiveBid[] }).bids;
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
