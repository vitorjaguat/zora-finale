import { AuctionCard } from "./AuctionCard";
import { AddressDisplay } from "./AddressDisplay";
import BidCard from "./BidCard";
import { HiArrowTurnRightDown, HiArrowTurnLeftDown } from "react-icons/hi2";

import type { Result, ActiveBid } from "@/hooks/useAddressLookup";

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
  return (
    <div className="w-full">
      {/* Header with breakdown */}

      {/* ActiveBids breakdown */}
      <div className="mb-4 rounded-lg border border-neutral-600 bg-neutral-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">
          Found {result.activeBids?.bidsCount} active bid
          {result.activeBids?.bidsCount !== 1 ? "s" : ""} for{" "}
          <AddressDisplay address={result.address} />
        </h2>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="rounded bg-neutral-700 p-3">
            <div className="font-semibold text-green-400">As Token Owner</div>
            <div className="text-lg text-neutral-200">
              {result.activeBids ? result.activeBids.breakdown.asTokenOwner : 0}
            </div>
          </div>
          {/* <div className="rounded bg-neutral-700 p-3">
            <div className="font-semibold text-blue-400">As Curator</div>
            <div className="text-lg text-neutral-200">
              {result.activeBids ? result.activeBids.breakdown.asCurator : 0}
            </div>
          </div> */}
          <div className="rounded bg-neutral-700 p-3">
            <div className="font-semibold text-purple-400">As Bidder</div>
            <div className="text-lg text-neutral-200">
              {result.activeBids ? result.activeBids.breakdown.asBidder : 0}
            </div>
          </div>
        </div>
      </div>
      {/* Auctions breakdown */}
      <div className="mb-4 rounded-lg border border-neutral-600 bg-neutral-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">
          Found {result.auctionCount} auction
          {result.auctionCount !== 1 ? "s" : ""} for{" "}
          <AddressDisplay address={result.address} />
        </h2>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="rounded bg-neutral-700 p-3">
            <div className="font-semibold text-green-400">As Token Owner</div>
            <div className="text-lg text-neutral-200">
              {result.breakdown.asTokenOwner}
            </div>
          </div>
          <div className="rounded bg-neutral-700 p-3">
            <div className="font-semibold text-blue-400">As Curator</div>
            <div className="text-lg text-neutral-200">
              {result.breakdown.asCurator}
            </div>
          </div>
          <div className="rounded bg-neutral-700 p-3">
            <div className="font-semibold text-purple-400">As Bidder</div>
            <div className="text-lg text-neutral-200">
              {result.breakdown.asBidder}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-2 grid grid-cols-3 gap-3 text-2xl text-neutral-200">
        <div className="flex items-center gap-2">
          <h2>Active Bids</h2>
          <HiArrowTurnRightDown className="translate-y-1.5 text-neutral-200" />
        </div>
        <div className=""></div>
        <div className="flex w-full items-center justify-end gap-2 text-right">
          <HiArrowTurnLeftDown className="translate-y-1.5 text-neutral-200" />
          <h2>Auctions</h2>
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-2 gap-6">
        {/* Left Column - Active Bids */}
        <div className="w-full">
          {!result.activeBids || result.activeBids.bids.length === 0 ? (
            <div className="rounded-lg border border-neutral-600 bg-neutral-800 p-6">
              <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                No active bids found for{" "}
                <AddressDisplay address={result.address} />
              </h2>
              <p className="whitespace-pre-line text-neutral-400">
                This address has no active bids as token owner or bidder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {result.activeBids.bids.map((bid: ActiveBid) => (
                <BidCard
                  key={bid.transactionHash}
                  bid={bid}
                  inputAddress={result.address}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Auctions */}
        <div className="w-full">
          {!result.hasAuctions ? (
            <div className="rounded-lg border border-neutral-600 bg-neutral-800 p-6">
              <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                No auctions found for{" "}
                <AddressDisplay address={result.address} />
              </h2>
              <p className="whitespace-pre-line text-neutral-400">
                This address has no auctions as token owner, curator, or bidder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {result.auctions.map((auction) => (
                <AuctionCard
                  key={auction.auctionId}
                  auction={auction}
                  inputAddress={result.address}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
