import type { AuctionData } from "@/scripts/generateJSON";
import { formatEther, zeroAddress } from "viem";
import { AddressDisplay } from "./AddressDisplay";
import { cn } from "@/lib/utils";

interface AuctionCardProps {
  auction: AuctionData;
  isSelected?: boolean;
  onSelectionChange?: (auction: AuctionData, selected: boolean) => void;
}

export function AuctionCard({
  auction,
  isSelected = false,
  onSelectionChange,
}: AuctionCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange?.(auction, e.target.checked);
  };

  return (
    <div className="flex h-full min-h-[100px] items-stretch rounded bg-neutral-700 p-3 font-mono transition-colors duration-200 hover:bg-neutral-600">
      {/* COL 1 - Checkbox */}
      <div className="flex w-10 items-center justify-center pr-3">
        <input
          name={`check-${auction.auctionId}`}
          id={`check-${auction.auctionId}`}
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 cursor-pointer appearance-none rounded border-2 border-neutral-500 bg-neutral-700 outline-0 transition-colors duration-200 checked:border-green-600 checked:bg-green-600 focus:ring-1 focus:ring-neutral-500 focus:ring-offset-0 focus:ring-offset-neutral-800"
        />
      </div>

      {/* COL 2 - Content */}
      <label
        htmlFor={`check-${auction.auctionId}`}
        className="flex flex-1 flex-col justify-center"
      >
        <div className="pb-5 font-semibold text-neutral-200">
          Auction #{auction.auctionId}
        </div>
        <div className="space-y-1 space-x-3 pr-10 text-sm text-neutral-400">
          <div>Token ID: {auction.tokenId}</div>
          <div>
            Reserve Price:{" "}
            <span className="text-green-600">
              {formatEther(BigInt(auction.reservePrice))} ETH
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Token Contract:</span>
            <AddressDisplay address={auction.tokenContract} />
          </div>

          {auction?.bidder != zeroAddress && (
            <div className="flex items-center justify-between">
              <span>Bidder:</span>
              <AddressDisplay address={auction.bidder} />
            </div>
          )}

          {auction?.curator !== auction?.tokenOwner &&
            auction?.curator !== zeroAddress && (
              <div className="mt-2 space-y-1 space-x-3 border-t border-neutral-600 pt-2">
                <div className="flex items-center justify-between">
                  <span>Curator:</span>
                  <AddressDisplay address={auction.curator} />
                </div>
                <div>Curator Fee: {auction.curatorFeePercentage}%</div>
              </div>
            )}
        </div>
      </label>

      {/* COL 3 - Actions Helper */}
      <div className="flex w-16 cursor-help flex-col gap-[1px] bg-neutral-600 p-[1px]">
        <div
          className={cn(
            "flex flex-1 cursor-help items-center justify-center bg-neutral-700",
            auction?.bidder == zeroAddress && "opacity-40 saturate-0",
          )}
          title={
            auction.bidder != zeroAddress
              ? "You have a bid, so you'll receive ETH, and the bidder will receive the NFT."
              : "This auction did not receive any bids."
          }
        >
          💰
        </div>
        <div
          className="flex flex-1 items-center justify-center bg-neutral-700"
          title={
            auction.bidder != zeroAddress
              ? "Once you settle this auction, the NFT will be transferred to the bidder - and you'll receive your ETH."
              : "You can settle this auction to reclaim your NFT."
          }
        >
          🖼
        </div>
      </div>
    </div>
  );
}
