import { useMemo } from "react";

interface BidSharesResult {
  prevOwnerPercent: number;
  creatorPercent: number;
  ownerPercent: number;
  prevOwnerAmount: number;
  creatorAmount: number;
  ownerAmount: number;
}

/**
 * Simple hook to parse bid shares and calculate amounts
 * @param amountFormatted - The formatted bid amount as string or number
 * @param bidShares - Comma-separated bid shares string from database
 * @returns Object with percentages and calculated amounts
 */
export function useBidShares(
  amountFormatted: string | number,
  bidShares?: string,
): BidSharesResult | null {
  return useMemo(() => {
    if (!bidShares?.trim()) return null;

    try {
      const amount =
        typeof amountFormatted === "string"
          ? parseFloat(amountFormatted)
          : amountFormatted;

      if (isNaN(amount)) return null;

      const [prevOwnerWei, creatorWei, ownerWei] = bidShares.split(",");

      // Validate we have all three values
      if (!prevOwnerWei || !creatorWei || !ownerWei) return null;

      // Convert wei to percentages using BigInt for precision
      const prevOwnerPercent = Number(BigInt(prevOwnerWei)) / 1e18;
      const creatorPercent = Number(BigInt(creatorWei)) / 1e18;
      const ownerPercent = Number(BigInt(ownerWei)) / 1e18;

      // Calculate amounts with precision control
      const prevOwnerAmount = parseFloat(
        (amount * (prevOwnerPercent / 100)).toFixed(8),
      );
      const creatorAmount = parseFloat(
        (amount * (creatorPercent / 100)).toFixed(8),
      );
      const ownerAmount = parseFloat(
        (amount * (ownerPercent / 100)).toFixed(8),
      );

      return {
        prevOwnerPercent,
        creatorPercent,
        ownerPercent,
        prevOwnerAmount,
        creatorAmount,
        ownerAmount,
      };
    } catch {
      return null;
    }
  }, [amountFormatted, bidShares]);
}
