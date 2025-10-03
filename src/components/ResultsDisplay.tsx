import { AuctionCard } from "./AuctionCard";
import { AddressDisplay } from "./AddressDisplay";
import BidCard from "./BidCard";
import { HiArrowTurnRightDown, HiArrowTurnLeftDown } from "react-icons/hi2";
import { useState, useEffect } from "react";
import type { Bid } from "@/app/api/bids/address-lookup/route";
import type { AuctionData, Result } from "@/hooks/useAddressLookup";
// import type { ResultWithFirstMetadata } from "@/app/api/nft/firstMetadataBatch/route";

// interface CheckResult {
//   address: string;
//   hasAuctions: boolean;
//   auctionCount: number;
//   auctions: AuctionData[];
//   breakdown: {
//     asTokenOwner: number;
//     asCurator: number;
//     asBidder: number;
//   };
// }

interface ResultsDisplayProps {
  result: Result;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [resultWithMetadata, setResultWithMetadata] = useState<Result | null>(
    null,
  );
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [filteredAuctions, setFilteredAuctions] = useState<AuctionData[]>(
    result.auctions,
  );
  const [filteredBids, setFilteredBids] = useState<Bid[]>(result.bids!.bids);

  // Fetch metadata whenever result changes
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!result) return;

      setMetadataLoading(true);
      setMetadataError(null);

      try {
        const response = await fetch("/api/nft/firstMetadataBatch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch metadata: ${response.status} ${response.statusText}`,
          );
        }

        const enhancedResult: Result = (await response.json()) as Result;
        setResultWithMetadata(enhancedResult);
        // console.dir(enhancedResult);
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setResultWithMetadata(result);
        setMetadataError(
          error instanceof Error ? error.message : "Failed to fetch metadata",
        );
        // // Fallback to original result structure
        // setResultWithMetadata({
        //   ...result,
        //   hasAuctions: result.hasAuctions,
        //   auctionCount: result.auctionCount,
        //   breakdown: result.breakdown,
        //   auctions: result.auctions.map((auction) => ({
        //     ...auction,
        //     metadata: undefined,
        //   })),
        //   bids: {
        //     hasBids: result.bids?.hasBids ?? false,
        //     bidsCount: result.bids?.bidsCount ?? 0,
        //     bids: (result.bids?.bids ?? []).map((bid) => ({
        //       ...bid,
        //       metadata: undefined,
        //     })),
        //     breakdown: result.bids?.breakdown ?? {
        //       active: {
        //         asTokenOwner: 0,
        //         asBidder: 0,
        //       },
        //       settled: {
        //         asTokenOwner: 0,
        //         asBidder: 0,
        //       },
        //     },
        //   },
        // });
      } finally {
        setMetadataLoading(false);
      }
    };

    void fetchMetadata();
  }, [result]);

  useEffect(() => {
    if (resultWithMetadata) {
      setFilteredAuctions(
        showOnlyActive
          ? resultWithMetadata?.auctions.filter((auction) => !auction.isSettled)
          : (resultWithMetadata?.auctions ?? result.auctions),
      );
      setFilteredBids(
        showOnlyActive
          ? resultWithMetadata?.bids!.bids.filter((bid) => bid.isActive)
          : (resultWithMetadata?.bids!.bids ?? result?.bids?.bids ?? []),
      );
    }
  }, [showOnlyActive, resultWithMetadata]);

  useEffect(() => {
    // console.dir(resultWithMetadata);
  }, [resultWithMetadata?.fetchMetadata1]);

  return (
    <div className="flex w-full flex-col gap-12">
      {/* Metadata Loading Indicator */}
      {metadataLoading && (
        <div className="rounded-lg border border-blue-600 bg-blue-900/20 p-4">
          <div className="flex items-center gap-2 text-blue-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
            <span>Loading NFT metadata...</span>
          </div>
        </div>
      )}

      {/* Metadata Error Indicator */}
      {metadataError && (
        <div className="rounded-lg border border-red-600 bg-red-900/20 p-4">
          <div className="text-red-400">
            <strong>Metadata Error:</strong> {metadataError}
          </div>
          <div className="mt-1 text-sm text-red-300">
            Displaying results without enhanced metadata.
          </div>
        </div>
      )}

      {/* BREAKDOWN */}
      <div className="flex w-full flex-col gap-6">
        {/* Breakdown Header */}
        <div className="flex w-full items-center justify-center gap-3">
          <HiArrowTurnLeftDown
            color="white"
            className="translate-y-1.5"
            size={24}
          />
          <div className="text-2xl text-white">Breakdown</div>
          <HiArrowTurnRightDown
            color="white"
            className="translate-y-1.5"
            size={24}
          />
        </div>
        <div className="flex w-full gap-4">
          {/* ActiveBids breakdown */}
          <div className="mb-4 flex-1 rounded-lg border border-neutral-600 bg-neutral-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">
              Found {result.bids?.bidsCount ?? 0} bid
              {(result.bids?.bidsCount ?? 0) !== 1 ? "s" : ""} for{" "}
              <AddressDisplay address={result.address} />
            </h2>

            {/* Active Bids */}
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-medium text-green-400">
                Active Bids
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-green-400">
                    As Token Owner
                  </div>
                  <div className="text-lg text-neutral-200">
                    {result.bids?.breakdown?.active?.asTokenOwner ?? 0}
                  </div>
                </div>
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-purple-400">As Bidder</div>
                  <div className="text-lg text-neutral-200">
                    {result.bids?.breakdown?.active?.asBidder ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Settled Bids */}
            <div>
              <h3 className="mb-2 text-lg font-medium text-neutral-300">
                Settled Bids
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-green-400">
                    As Token Owner
                  </div>
                  <div className="text-lg text-neutral-200">
                    {result.bids?.breakdown?.settled?.asTokenOwner ?? 0}
                  </div>
                </div>
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-purple-400">As Bidder</div>
                  <div className="text-lg text-neutral-200">
                    {result.bids?.breakdown?.settled?.asBidder ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Auctions breakdown */}
          <div className="mb-4 flex-1 rounded-lg border border-neutral-600 bg-neutral-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">
              Found {result.auctionCount} auction
              {result.auctionCount !== 1 ? "s" : ""} for{" "}
              <AddressDisplay address={result.address} />
            </h2>

            {/* Active Auctions */}
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-medium text-green-400">
                Active Auctions
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-green-400">
                    As Token Owner
                  </div>
                  <div className="text-lg text-neutral-200">
                    {result.breakdown?.active?.asTokenOwner ?? 0}
                  </div>
                </div>
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-blue-400">As Curator</div>
                  <div className="text-lg text-neutral-200">
                    {result.breakdown?.active?.asCurator ?? 0}
                  </div>
                </div>
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-purple-400">As Bidder</div>
                  <div className="text-lg text-neutral-200">
                    {result.breakdown?.active?.asBidder ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Settled Auctions */}
            <div>
              <h3 className="mb-2 text-lg font-medium text-neutral-300">
                Settled Auctions
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-green-400">
                    As Token Owner
                  </div>
                  <div className="text-lg text-neutral-200">
                    {result.breakdown?.settled?.asTokenOwner ?? 0}
                  </div>
                </div>
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-blue-400">As Curator</div>
                  <div className="text-lg text-neutral-200">
                    {result.breakdown?.settled?.asCurator ?? 0}
                  </div>
                </div>
                <div className="rounded bg-neutral-700 p-3">
                  <div className="font-semibold text-purple-400">As Bidder</div>
                  <div className="text-lg text-neutral-200">
                    {result.breakdown?.settled?.asBidder ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="">
        <div className="mb-3 grid grid-cols-3 gap-3 text-2xl text-neutral-200">
          <div className="flex items-center gap-2">
            <h2>Bids</h2>
            <HiArrowTurnRightDown className="translate-y-1.5 text-neutral-200" />
          </div>
          <div className="flex items-end justify-center text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                className="custom-checkbox h-3 w-3 rounded border-neutral-400 bg-neutral-700"
              />
              <span className="text-neutral-200">Show only active</span>
            </label>
          </div>
          <div className="flex w-full items-center justify-end gap-2 text-right">
            <HiArrowTurnLeftDown className="translate-y-1.5 text-neutral-200" />
            <h2>Auctions</h2>
          </div>
        </div>
        <div className="grid min-h-0 grid-cols-2 gap-6">
          {/* Left Column - Active Bids */}
          <div className="w-full">
            {filteredBids && filteredBids.length === 0 ? (
              <div className="rounded-lg border border-neutral-600 bg-neutral-800 p-6">
                <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                  {showOnlyActive ? "No active bids found" : "No bids found"}{" "}
                  for <AddressDisplay address={result.address} />
                </h2>
                <p className="whitespace-pre-line text-neutral-400">
                  {showOnlyActive
                    ? "This address has no active bids. Try unchecking 'Show only active' to see all bids."
                    : "This address has no bids as token owner or bidder."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {resultWithMetadata
                  ? filteredBids?.map((bid) => (
                      <BidCard
                        key={bid.transactionHash || bid.id}
                        bid={bid}
                        inputAddress={result.address}
                      />
                    ))
                  : "Fetching metadata..."}
              </div>
            )}
          </div>

          {/* Right Column - Auctions */}
          <div className="w-full">
            {filteredAuctions.length === 0 ? (
              <div className="rounded-lg border border-neutral-600 bg-neutral-800 p-6">
                <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                  {showOnlyActive
                    ? "No active auctions found"
                    : "No auctions found"}{" "}
                  for <AddressDisplay address={result.address} />
                </h2>
                <p className="whitespace-pre-line text-neutral-400">
                  {showOnlyActive
                    ? "This address has no active auctions. Try unchecking 'Show only active' to see all auctions."
                    : "This address has no auctions as token owner, curator, or bidder."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {resultWithMetadata
                  ? filteredAuctions.map((auction) => (
                      <AuctionCard
                        key={auction.auctionId}
                        auction={auction}
                        inputAddress={result.address}
                      />
                    ))
                  : "Fetching metadata..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
