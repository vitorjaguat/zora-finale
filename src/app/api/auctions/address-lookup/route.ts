import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import type { AuctionData } from "@/scripts/generateJSON";

interface CheckResult {
  address: string;
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[];
  breakdown: {
    asTokenOwner: number;
    asCurator: number;
    asBidder: number;
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

    // Raw SQL query to get comprehensive auction data for an address
    const result = await db.execute(sql`
      WITH address_auctions AS (
        -- Get auctions where address is token owner
        SELECT 
          a.id,
          a.data,
          'token_owner' as role
        FROM auctions a
        JOIN auction_token_owners ato ON a.id = ato.auction_id
        WHERE LOWER(ato.owner_address) = LOWER(${address})
        
        UNION
        
        -- Get auctions where address is curator
        SELECT 
          a.id,
          a.data,
          'curator' as role
        FROM auctions a
        JOIN auction_curators ac ON a.id = ac.auction_id
        WHERE LOWER(ac.curator_address) = LOWER(${address})
        
        UNION
        
        -- Get auctions where address is bidder
        SELECT 
          a.id,
          a.data,
          'bidder' as role
        FROM auctions a
        JOIN auction_bidders ab ON a.id = ab.auction_id
        WHERE LOWER(ab.bidder_address) = LOWER(${address})
      ),
      role_counts AS (
        SELECT 
          COUNT(CASE WHEN role = 'token_owner' THEN 1 END) as token_owner_count,
          COUNT(CASE WHEN role = 'curator' THEN 1 END) as curator_count,
          COUNT(CASE WHEN role = 'bidder' THEN 1 END) as bidder_count
        FROM address_auctions
      ),
      unique_auctions AS (
        SELECT DISTINCT id, data
        FROM address_auctions
      )
      SELECT 
        COALESCE(
          JSON_AGG(
            ua.data ORDER BY ua.id
          ) FILTER (WHERE ua.id IS NOT NULL), 
          '[]'::json
        ) as auctions,
        COALESCE(rc.token_owner_count, 0) as token_owner_count,
        COALESCE(rc.curator_count, 0) as curator_count,
        COALESCE(rc.bidder_count, 0) as bidder_count,
        COUNT(ua.id) as total_count
      FROM unique_auctions ua
      CROSS JOIN role_counts rc
      GROUP BY rc.token_owner_count, rc.curator_count, rc.bidder_count
    `);

    const row = result[0];

    if (!row) {
      return NextResponse.json({
        address,
        hasAuctions: false,
        auctionCount: 0,
        auctions: [],
        breakdown: {
          asTokenOwner: 0,
          asCurator: 0,
          asBidder: 0,
        },
      } satisfies CheckResult);
    }

    const auctions = row.auctions as AuctionData[];
    const auctionCount = Number(row.total_count) || 0;
    const hasAuctions = auctionCount > 0;

    const response: CheckResult = {
      address,
      hasAuctions,
      auctionCount,
      auctions,
      breakdown: {
        asTokenOwner: Number(row.token_owner_count) || 0,
        asCurator: Number(row.curator_count) || 0,
        asBidder: Number(row.bidder_count) || 0,
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
