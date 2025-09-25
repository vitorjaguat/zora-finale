import { AuctionCard } from "./AuctionCard";
import { AddressDisplay } from "./AddressDisplay";
import BidCard from "./BidCard";
import { HiArrowTurnRightDown, HiArrowTurnLeftDown } from "react-icons/hi2";
import { useState } from "react";
import type { Bid, BidsResult } from "@/app/api/bids/address-lookup/route";

import type { Result } from "@/hooks/useAddressLookup";

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

  // Filter auctions and bids based on checkbox state
  const filteredAuctions = showOnlyActive
    ? result.auctions.filter((auction) => !auction.isSettled)
    : result.auctions;

  const filteredBids = showOnlyActive
    ? (result?.bids?.bids.filter((bid) => bid.isActive) ?? [])
    : (result?.bids?.bids ?? []);
  return (
    <div className="flex w-full flex-col gap-12">
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
              Found {result.bids?.bidsCount} bid
              {result.bids?.bidsCount !== 1 ? "s" : ""} for{" "}
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
            {filteredBids.length === 0 ? (
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
                {filteredBids.map((bid: Bid) => (
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
                {filteredAuctions.map((auction) => (
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
    </div>
  );
}
