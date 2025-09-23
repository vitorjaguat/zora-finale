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
      settled: number;
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
      // Get bid IDs for each role with simple queries
      const [bidderResults, tokenOwnerResults] = await Promise.all([
        // Bidder bids
        db.execute(sql`
          SELECT bid_id FROM bid_bidders 
          WHERE LOWER(bidder_address) = LOWER(${address})
        `),
        // Token owner bids
        db.execute(sql`
          SELECT bid_id FROM bid_token_owners 
          WHERE LOWER(owner_address) = LOWER(${address})
        `),
      ]);

      // Collect all unique bid IDs
      const bidderIds = new Set(bidderResults.map((r) => r.bid_id as number));
      const tokenOwnerIds = new Set(
        tokenOwnerResults.map((r) => r.bid_id as number),
      );
      const allBidIds = new Set([...bidderIds, ...tokenOwnerIds]);

      if (allBidIds.size === 0) {
        return NextResponse.json({
          activeBids: {
            hasActiveBids: false,
            bidsCount: 0,
            bids: [],
            breakdown: {
              asTokenOwner: 0,
              asBidder: 0,
              settled: 0,
            },
          },
        } satisfies ActiveBidsResult);
      }

      // Get bid details for all relevant bids
      const bidIdsArray = Array.from(allBidIds);
      const bidDetails = await db.execute(sql`
        SELECT 
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
        FROM bids 
        WHERE id = ANY(ARRAY[${sql.join(
          bidIdsArray.map((id) => sql`${id}`),
          sql`, `,
        )}])
        ORDER BY timestamp
      `);

      // Prepare settled bids count
      let settledBidsCount = 0;

      // Transform data and calculate status in JavaScript
      const bidsData: ActiveBid[] = bidDetails.map((bid) => {
        const isActive = bid.is_active as boolean;
        const isWithdrawn = bid.is_withdrawn as boolean;
        const isAccepted = bid.is_accepted as boolean;
        if (!isActive) settledBidsCount++;

        let status: "active" | "withdrawn" | "accepted" | "inactive";
        if (isAccepted) status = "accepted";
        else if (isWithdrawn) status = "withdrawn";
        else if (isActive) status = "active";
        else status = "inactive";

        return {
          id: String(bid.id),
          transactionHash: bid.transaction_hash as string,
          logIndex: bid.log_index as number,
          tokenId: bid.token_id as string,
          tokenContract: bid.token_contract as string,
          amount: bid.amount as string,
          amountFormatted: bid.amount_formatted as string,
          currency: bid.currency as string,
          currencySymbol: bid.currency_symbol as string,
          currencyDecimals: bid.currency_decimals as number,
          bidder: bid.bidder as string,
          recipient: bid.recipient as string,
          tokenOwner: bid.token_owner as string,
          timestamp: bid.timestamp as string,
          blockNumber: bid.block_number as number,
          isActive,
          isWithdrawn,
          isAccepted,
          processedAt: bid.created_at as string,
          status,
        };
      });

      const response: ActiveBidsResult = {
        activeBids: {
          hasActiveBids: bidsData.length > 0,
          bidsCount: bidsData.length,
          bids: bidsData,
          breakdown: {
            asTokenOwner: tokenOwnerIds.size,
            asBidder: bidderIds.size,
            settled: settledBidsCount,
          },
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
