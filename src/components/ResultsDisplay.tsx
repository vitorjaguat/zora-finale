import { AuctionCard } from "./AuctionCard";
import { AddressDisplay } from "./AddressDisplay";
import type { AuctionData } from "@/scripts/generateJSON";

interface CheckResult {
  address: string;
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[];
  breakdown: {
    asTokenOwner: number;
    asCurator: number;
    asBidder: number;
  };
}

interface ResultsDisplayProps {
  result: CheckResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  if (!result.hasAuctions) {
    return (
      <div className="w-full max-w-4xl rounded-lg border border-neutral-600 bg-neutral-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">
          No auctions found for <AddressDisplay address={result.address} />
        </h2>
        <p className="text-neutral-400">
          This address has no auctions as token owner, curator, or bidder.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with breakdown */}
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

      {/* Auctions grid */}
      <div className="grid grid-cols-1 gap-4">
        {result.auctions.map((auction) => (
          <AuctionCard key={auction.auctionId} auction={auction} />
        ))}
      </div>
    </div>
  );
}
