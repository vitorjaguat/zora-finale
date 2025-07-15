import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auctions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { auctionId: string } },
) {
  try {
    const { auctionId } = params;
    const body = (await request.json()) as { isSettled: boolean };
    const { isSettled } = body;

    // Validate input
    if (typeof isSettled !== "boolean") {
      return NextResponse.json(
        { error: "isSettled must be a boolean" },
        { status: 400 },
      );
    }

    // Get the current auction data
    const [auction] = await db
      .select()
      .from(auctions)
      .where(eq(auctions.id, BigInt(auctionId)));

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Update the auction data with new settlement status
    const currentData = auction.data as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      isSettled,
    };

    // Update the auction in the database
    await db
      .update(auctions)
      .set({
        data: updatedData,
        updatedAt: new Date(),
      })
      .where(eq(auctions.id, BigInt(auctionId)));

    return NextResponse.json({
      success: true,
      auctionId,
      isSettled,
    });
  } catch (error) {
    console.error("Error updating auction settlement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
