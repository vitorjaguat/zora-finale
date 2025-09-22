import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { bids, bidTokenOwners } from "@/lib/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";

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
      ...(action === "withdraw"
        ? { isWithdrawn: true }
        : { isAccepted: true, tokenOwner: bidder }),
    };

    await db
      .update(bids)
      .set(updateData)
      .where(
        and(
          eq(bids.tokenId, tokenId),
          eq(bids.transactionHash, transactionHash),
        ),
      );

    let otherBidsUpdated: string[] = [];

    if (action === "accept") {
      // check if there are other bids on this token; if yes, update token_owner
      const sameTokenBids = await db
        .select({
          id: bids.id,
        })
        .from(bids)
        .where(
          and(
            eq(bids.tokenId, tokenId),
            ne(bids.transactionHash, transactionHash),
          ),
        );

      if (sameTokenBids.length > 0) {
        otherBidsUpdated = sameTokenBids.map((bid) => bid.id);

        // Update main bids table
        await db
          .update(bids)
          .set({ tokenOwner: bidder })
          .where(inArray(bids.id, otherBidsUpdated));

        // Update relationship table (corrected)
        await db
          .update(bidTokenOwners)
          .set({ ownerAddress: bidder })
          .where(inArray(bidTokenOwners.bidId, otherBidsUpdated)); // Use bidTokenOwners.bidId
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bid successfully ${action === "withdraw" ? "withdrawn" : "accepted"}. ${
        otherBidsUpdated.length > 0
          ? `Tokens with ids ${otherBidsUpdated.join(", ")} had their token_owner updated to ${bidder}!`
          : ""
      }`,
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
