import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { bidId: string } },
) {
  try {
    const { bidId } = params;
    const body = (await request.json()) as {
      isSettled?: boolean;
      settledTxHash?: string;
    };
    const { isSettled, settledTxHash } = body;

    // Validate input - at least one field must be provided
    if (isSettled === undefined && !settledTxHash) {
      return NextResponse.json(
        { error: "Either isSettled or settledTxHash must be provided" },
        { status: 400 },
      );
    }

    if (isSettled !== undefined && typeof isSettled !== "boolean") {
      return NextResponse.json(
        { error: "isSettled must be a boolean" },
        { status: 400 },
      );
    }

    if (settledTxHash !== undefined && typeof settledTxHash !== "string") {
      return NextResponse.json(
        { error: "settledTxHash must be a string" },
        { status: 400 },
      );
    }

    // Get the current bid data
    const [bid] = await db.select().from(bids).where(eq(bids.id, bidId));

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Build the update object dynamically
    const updateFields: {
      isAccepted?: boolean;
      settledTxHash?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // Update isAccepted if provided (for bids, settlement means acceptance)
    if (isSettled !== undefined) {
      updateFields.isAccepted = isSettled;
    }

    // Update settledTxHash if provided
    if (settledTxHash !== undefined) {
      updateFields.settledTxHash = settledTxHash;
    }

    // Update the bid
    await db.update(bids).set(updateFields).where(eq(bids.id, bidId));

    return NextResponse.json({
      success: true,
      bidId,
      ...(isSettled !== undefined && { isAccepted: isSettled }),
      ...(settledTxHash !== undefined && { settledTxHash }),
    });
  } catch (error) {
    console.error("Error updating bid settlement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
