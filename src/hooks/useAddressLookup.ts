import { useState } from "react";
import { isAddress } from "viem";
import { isLikelyENSName, resolveAddressOrENS } from "@/lib/ensUtils";
import type { AuctionData } from "@/scripts/generateJSON";

interface CheckResult {
  address: string;
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[]; // Changed from any[] to AuctionData[]
}

interface ErrorResponse {
  error: string;
}

export function useAddressLookup() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuctions, setSelectedAuctions] = useState<AuctionData[]>([]);

  const handleSubmit = async (inputAddress: string): Promise<void> => {
    let address = inputAddress.trim();

    if (!address || (!isAddress(address) && !isLikelyENSName(address))) {
      setError("Please enter a valid address.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedAuctions([]);

    // ENS resolution
    if (isLikelyENSName(address)) {
      try {
        const resolved = await resolveAddressOrENS(address);
        if (resolved.wasResolved) {
          address = resolved.address;
        } else {
          setError("Failed to resolve ENS name to an address.");
          setLoading(false);
          return;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error resolving ENS",
        );
        setLoading(false);
        return;
      }
    }

    // API call //
    try {
      const response = await fetch(
        `/api/auctions/owner?address=${encodeURIComponent(address)}`,
      );

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("API endpoint not found or returned invalid response");
      }

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to check address.");
      }

      const data = (await response.json()) as CheckResult;
      setResult(data);
      console.dir(data, { depth: null });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (auction: AuctionData, selected: boolean) => {
    setSelectedAuctions((prev) =>
      selected
        ? [...prev, auction]
        : prev.filter((a) => a.auctionId !== auction.auctionId),
    );
  };

  return {
    result,
    loading,
    error,
    selectedAuctions,
    handleSubmit,
    handleSelectionChange,
  };
}
