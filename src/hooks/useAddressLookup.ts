import { useState, useCallback } from "react"; // Removed unused useEffect
import { isAddress } from "viem";
import { isLikelyENSName, resolveAddressOrENS } from "@/lib/ensUtils";

export interface AuctionData {
  auctionId: string;
  tokenId: string;
  tokenContract: string;
  approved: boolean;
  amount: string;
  amountFormatted: string;
  duration: string;
  firstBidTime: string;
  reservePrice: string;
  curatorFeePercentage: number;
  tokenOwner: string;
  bidder: string;
  curator: string;
  currency: string; // The auctionCurrency address
  currencySymbol: string;
  currencyDecimals: number;
  isSettled: boolean;
}

export interface ActiveBid {
  eventType: string;
  implementation: string;
  eventSignature: string;
  tokenId: string;
  amount: string;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
  currencyDecimals: number;
  bidder: string;
  recipient: string;
  sellOnShareValue?: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  logIndex: number;
  processedAt: string;
  decodingMethod: string;
  rawData: Record<string, unknown>;
  contractVerification: Record<string, unknown>;
  tokenOwner: string;
  // Status fields
  isActive: boolean;
  isWithdrawn: boolean;
  isAccepted: boolean;
  status: "active" | "withdrawn" | "accepted";
}

export interface ActiveBidsResult {
  hasActiveBids: boolean;
  bidsCount: number;
  bids: ActiveBid[];
  breakdown: {
    asTokenOwner: number;
    asBidder: number;
  };
}

export interface Result {
  address: string;
  originalInput: string; // Keep track of original input (ENS or 0x)
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[];
  breakdown: {
    asTokenOwner: number;
    asCurator: number;
    asBidder: number;
  };
  activeBids: ActiveBidsResult | null;
}

interface ErrorResponse {
  error: string;
}

export function useAddressLookup() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedAddress, setLastSearchedAddress] = useState<string>("");

  const handleSubmit = useCallback(
    async (inputAddress: string): Promise<void> => {
      let address = inputAddress.trim();
      const originalInput = address; // Store the original input

      // Prevent duplicate searches (compare against original input)
      if (originalInput === lastSearchedAddress && result) {
        return;
      }

      if (!address || (!isAddress(address) && !isLikelyENSName(address))) {
        setError("Please enter a valid address.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      // ENS resolution - resolve to 0x address but keep original input for UI
      if (isLikelyENSName(address)) {
        try {
          const resolved = await resolveAddressOrENS(address);
          if (resolved.wasResolved) {
            address = resolved.address; // Use resolved address for API calls
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

      // Store the original input we're searching for (not the resolved address)
      setLastSearchedAddress(originalInput);

      // Make parallel API calls to both endpoints
      try {
        const [auctionsResponse, activeBidsResponse] = await Promise.allSettled(
          [
            fetch(
              `/api/auctions/address-lookup?address=${encodeURIComponent(address)}`,
            ),
            fetch(
              `/api/bids/address-lookup?address=${encodeURIComponent(address)}`,
            ),
          ],
        );

        let auctionsData: Result | null = null;
        let activeBidsData: ActiveBidsResult | null = null;

        // Process auctions response
        if (auctionsResponse.status === "fulfilled") {
          const contentType =
            auctionsResponse.value.headers.get("content-type");
          if (!contentType?.includes("application/json")) {
            throw new Error(
              "Auctions API endpoint not found or returned invalid response",
            );
          }

          if (!auctionsResponse.value.ok) {
            const errorData =
              (await auctionsResponse.value.json()) as ErrorResponse;
            throw new Error(errorData.error ?? "Failed to check auctions.");
          }

          auctionsData = (await auctionsResponse.value.json()) as Result;
        } else {
          console.warn("Auctions API call failed:", auctionsResponse.reason);
        }

        // Process active bids response
        if (activeBidsResponse.status === "fulfilled") {
          const contentType =
            activeBidsResponse.value.headers.get("content-type");
          if (
            contentType?.includes("application/json") &&
            activeBidsResponse.value.ok
          ) {
            const activeBidsFullResponse =
              (await activeBidsResponse.value.json()) as {
                activeBids: ActiveBidsResult;
              };
            activeBidsData = activeBidsFullResponse.activeBids;
          } else {
            console.warn(
              "Active bids API call failed or returned invalid response",
            );
          }
        } else {
          console.warn(
            "Active bids API call failed:",
            activeBidsResponse.reason,
          );
        }

        // If auctions API failed completely, throw error
        if (!auctionsData) {
          throw new Error("Failed to fetch auction data");
        }

        // Combine the results
        const combinedResult: Result = {
          ...auctionsData,
          originalInput: originalInput, // Include the original input (ENS or 0x)
          activeBids: activeBidsData,
        };

        setResult(combinedResult);
        console.dir(combinedResult, { depth: null });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    },
    [lastSearchedAddress, result],
  );

  console.dir(result);

  return {
    result,
    loading,
    error,
    handleSubmit,
  };
}
