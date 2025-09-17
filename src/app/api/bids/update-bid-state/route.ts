import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { bids } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

interface UpdateBidStateRequest {
  tokenId: string;
  bidder: string;
  transactionHash: string;
  action: "withdraw" | "accept";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateBidStateRequest;
    const { tokenId, bidder, transactionHash, action } = body;

    if (!tokenId || !bidder || !transactionHash || !action) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: tokenId, bidder, transactionHash, action",
        },
        { status: 400 },
      );
    }

    if (action !== "withdraw" && action !== "accept") {
      return NextResponse.json(
        { error: "Action must be either 'withdraw' or 'accept'" },
        { status: 400 },
      );
    }

    // Update the bid state based on the action
    const updateData = {
      isActive: false,
      updatedAt: new Date(),
      ...(action === "withdraw" ? { isWithdrawn: true } : { isAccepted: true }),
    };

    await db
      .update(bids)
      .set(updateData)
      .where(
        and(
          eq(bids.tokenId, tokenId),
          eq(bids.bidder, bidder),
          eq(bids.transactionHash, transactionHash),
        ),
      );

    return NextResponse.json({
      success: true,
      message: `Bid successfully ${action === "withdraw" ? "withdrawn" : "accepted"}`,
      action,
    });
  } catch (error) {
    console.error("Error updating bid state:", error);
    return NextResponse.json(
      {
        error: "Failed to update bid state",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
