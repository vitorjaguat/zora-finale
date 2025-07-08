import type { AuctionData } from "@/scripts/generateJSON";
import { AuctionCard } from "./AuctionCard";

interface CheckResult {
  address: string;
  hasAuctions: boolean;
  auctionCount: number;
  auctions: AuctionData[];
}

interface ResultsDisplayProps {
  result: CheckResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  return (
    <>
      <div className="mb-24 w-full rounded-lg border border-neutral-600 bg-neutral-800 p-6">
        <h3 className="mb-4 text-xl text-neutral-200">
          Results for {result.address}
        </h3>

        {result.hasAuctions ? (
          <div className="space-y-4">
            <div className="font-semibold text-green-400">
              ✅ This address has {result.auctionCount} locked token
              {result.auctionCount !== 1 ? "s" : ""}
            </div>

            <div className="space-y-2">
              {result.auctions.map((auction) => (
                <AuctionCard key={auction.auctionId} auction={auction} />
              ))}
            </div>
          </div>
        ) : (
          <div className="font-semibold text-red-400">
            ❌ This address does not have any locked tokens.
          </div>
        )}
      </div>

      {/* {result.hasAuctions && (
        <div className="fixed bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center rounded-lg bg-neutral-200/10 p-4 shadow-lg backdrop-blur-lg">
          <div className="text-center text-xs text-neutral-50">
            <div className="">Select the auctions you want to settle,</div>
            <div className="">
              then click the &quot;Settle Auctions&quot; button.
            </div>
          </div>
          <button
            className="mt-2 cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSettleAuctions}
          >
            Settle Auctions
          </button>
        </div>
      )} */}
    </>
  );
}
