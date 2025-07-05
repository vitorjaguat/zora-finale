import type { AuctionData } from "@/scripts/generateJSON";
import { formatEther, zeroAddress } from "viem";
import { AddressDisplay } from "./AddressDisplay";
import { cn } from "@/lib/utils";
import { NFTPreview } from "./NFTPreview";
import { FaEthereum } from "react-icons/fa";
import { PiImageFill } from "react-icons/pi";

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
    <div className="flex flex-col gap-3 rounded bg-neutral-700 p-3 font-mono opacity-80 transition-opacity duration-200 hover:opacity-100">
      {/* NFT PREVIEW */}
      <NFTPreview id={auction.tokenId} contract={auction.tokenContract} />
      <div className="flex h-full min-h-[100px] items-stretch">
        {/* COL 1 - Auction Content */}
        <div className="flex flex-1 flex-col justify-center">
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
            <div className="flex items-center">
              <span>Has Bid:</span>
              <span
                className={cn(
                  "ml-3 font-semibold",
                  auction.bidder != zeroAddress
                    ? "text-green-400"
                    : "text-red-400",
                )}
              >
                {auction.bidder != zeroAddress ? "Yes" : "No"}
              </span>
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
        </div>

        {/* COL 2 - Actions Helper */}
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
            <FaEthereum className="h-6 w-6 text-blue-400" />
          </div>
          <div
            className="flex flex-1 items-center justify-center bg-neutral-700"
            title={
              auction.bidder != zeroAddress
                ? "Once you settle this auction, the NFT will be transferred to the bidder - and you'll receive your ETH."
                : "You can settle this auction to reclaim your NFT."
            }
          >
            <PiImageFill className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="w-full">
        <button className="w-full cursor-pointer rounded bg-purple-700 py-3 text-center text-neutral-300">
          Settle Auction
        </button>
      </div>
    </div>
  );
}
