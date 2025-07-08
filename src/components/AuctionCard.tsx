import type { AuctionData } from "@/scripts/generateJSON";
import { formatEther, zeroAddress } from "viem";
import { AddressDisplay } from "./AddressDisplay";
import { cn } from "@/lib/utils";
import { NFTPreview } from "./NFTPreview";
import { FaEthereum } from "react-icons/fa";
import { PiImageFill } from "react-icons/pi";
import { useSettleAuction } from "@/hooks/useSettleAuction";
import { useState } from "react";
import { ConnectButtonCustom } from "@/components/ConnectButton";

interface AuctionCardProps {
  auction: AuctionData;
  isSelected?: boolean;
  onSelectionChange?: (auction: AuctionData, selected: boolean) => void;
  onAuctionSettled?: (auctionId: string, transactionHash: string) => void;
}

export function AuctionCard({
  auction,
  isSelected = false,
  onSelectionChange,
  onAuctionSettled,
}: AuctionCardProps) {
  const {
    settleAuction,
    loading,
    error,
    success,
    transactionHash,
    reset,
    isConnected,
  } = useSettleAuction();
  const [isSettled, setIsSettled] = useState(false);

  //   const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     onSelectionChange?.(auction, e.target.checked);
  //   };

  const handleSettleAuction = async () => {
    if (loading || isSettled) return;

    if (!isConnected) {
      // Wallet connection will be handled by the ConnectButton
      return;
    }

    try {
      const result = await settleAuction(auction.auctionId, auction.bidder);

      if (result?.success && result.transactionHash) {
        setIsSettled(true);
        onAuctionSettled?.(auction.auctionId, result.transactionHash);
      }
    } catch (err) {
      console.error("Settlement failed:", err);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isSettled) return "✅ Settled";
    if (loading) return "Settling...";
    if (auction.bidder === zeroAddress) return "Cancel Auction";
    return "End Auction";
  };

  const getButtonColor = () => {
    if (!isConnected) return "bg-blue-600 hover:bg-blue-500";
    if (isSettled) return "bg-green-600 hover:bg-green-600 cursor-default";
    if (loading) return "bg-purple-500 cursor-not-allowed";
    if (auction.bidder === zeroAddress) return "bg-red-600 hover:bg-red-500";
    return "bg-purple-700 hover:bg-purple-600";
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
                  "ml-3",
                  auction.bidder != zeroAddress
                    ? "text-green-600"
                    : "text-red-400",
                )}
              >
                {auction.bidder != zeroAddress ? "Yes" : "No"}
              </span>
            </div>
            <div>
              Latest Bid:{" "}
              <span className="text-green-600">
                {formatEther(BigInt(auction.amount))} ETH
              </span>
            </div>

            {auction?.bidder != zeroAddress && (
              <div className="flex items-center">
                <span className="mr-3">Bidder:</span>
                <AddressDisplay
                  className="items-center"
                  address={auction.bidder}
                />
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
      <div className="w-full space-y-2">
        {!isConnected ? (
          <div className="flex justify-center">
            <ConnectButtonCustom className="" />
          </div>
        ) : (
          <button
            onClick={handleSettleAuction}
            disabled={loading || isSettled}
            className={cn(
              "w-full cursor-pointer rounded py-3 text-center text-neutral-200 transition-colors duration-200",
              getButtonColor(),
            )}
          >
            {getButtonText()}
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded bg-red-900/50 p-2 text-xs text-red-200">
            <strong>Error:</strong> {error}
            <button
              onClick={reset}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success Display */}
        {success && transactionHash && (
          <div className="rounded bg-green-900/50 p-2 text-xs text-green-200">
            <strong>Success!</strong>{" "}
            <a
              href={`https://etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
