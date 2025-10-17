import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { bids, bidTokenOwners } from "@/lib/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";

interface UpdateBidStateRequest {
  bidId: string;
  settledTxHash: string;
  action: "withdraw" | "accept";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateBidStateRequest;
    const { bidId, settledTxHash, action } = body;

    if (!bidId || !settledTxHash || !action) {
      return NextResponse.json(
        {
          error: "Missing required fields: bidId, settledTxHash, action",
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

    // Get the current bid
    const [currentBid] = await db.select().from(bids).where(eq(bids.id, bidId));

    if (!currentBid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Update the bid state based on the action
    const updateData = {
      isActive: false,
      settledTxHash,
      updatedAt: new Date(),
      ...(action === "withdraw"
        ? { isWithdrawn: true }
        : { isAccepted: true, tokenOwner: currentBid.bidder }),
    };

    await db.update(bids).set(updateData).where(eq(bids.id, bidId));

    let otherBidsUpdated: string[] = [];

    if (action === "accept") {
      // Check if there are other bids on this token; if yes, update token_owner
      const sameTokenBids = await db
        .select({
          id: bids.id,
        })
        .from(bids)
        .where(and(eq(bids.tokenId, currentBid.tokenId), ne(bids.id, bidId)));

      if (sameTokenBids.length > 0) {
        otherBidsUpdated = sameTokenBids.map((bid) => bid.id);

        // Update main bids table
        await db
          .update(bids)
          .set({ tokenOwner: currentBid.bidder })
          .where(inArray(bids.id, otherBidsUpdated));

        // Update relationship table
        await db
          .update(bidTokenOwners)
          .set({ ownerAddress: currentBid.bidder })
          .where(inArray(bidTokenOwners.bidId, otherBidsUpdated));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bid successfully ${action === "withdraw" ? "withdrawn" : "accepted"}. ${
        otherBidsUpdated.length > 0
          ? `Tokens with ids ${otherBidsUpdated.join(", ")} had their token_owner updated to ${currentBid.bidder}!`
          : ""
      }`,
      action,
      settledTxHash,
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
