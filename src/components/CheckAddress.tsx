"use client";

import type { AuctionData } from "@/lib/db/dbClass";
import { useRef, useState } from "react";

interface CheckResult {
  address: string;
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[];
}

interface ErrorResponse {
  error: string;
}

export default function CheckAddress() {
  const addressRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!addressRef.current?.value) {
      setError("Please enter a valid address.");
      return;
    }

    const address = addressRef.current.value;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/auctions/owner?address=${encodeURIComponent(address)}`,
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to check address.");
      }

      const data = (await response.json()) as CheckResult;
      setResult(data);
      console.dir(data, { depth: null });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      void handleSubmit();
    }
  };

  const handleButtonClick = (): void => {
    void handleSubmit();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-3xl text-neutral-200">Check Address</div>
      <input
        ref={addressRef}
        className="w-2xl rounded-lg bg-neutral-500 p-2 text-center text-white outline-0"
        type="text"
        name="address"
        id="address"
        onKeyDown={handleKeyPress}
        placeholder="0x1234...abcd"
      />
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className="rounded-lg bg-neutral-300 px-4 py-2.5 tracking-wider text-black uppercase duration-300 ease-out hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Checking..." : "Submit"}
      </button>

      {/* Error Display */}
      {error && (
        <div className="w-full rounded-lg border border-red-600 bg-red-900/50 p-4 text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-6">
          <h3 className="mb-4 text-xl text-neutral-200">
            Results for {result.address}
          </h3>

          {result.hasAuctions ? (
            <div className="space-y-4">
              <div className="font-semibold text-green-400">
                ✅ This address owns {result.auctionCount} auction
                {result.auctionCount !== 1 ? "s" : ""}
              </div>

              <div className="space-y-2">
                {result.auctions.map((auction) => (
                  <div
                    key={auction.auctionId}
                    className="rounded bg-neutral-700 p-3"
                  >
                    <div className="text-neutral-200">
                      <strong>Auction #{auction.auctionId}</strong>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-400">
                      <div>Token ID: {auction.tokenId}</div>
                      <div>Reserve Price: {auction.reservePrice} wei</div>
                      <div>Token Contract: {auction.tokenContract}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="font-semibold text-red-400">
              ❌ This address does not own any auctions
            </div>
          )}
        </div>
      )}
    </div>
  );
}
