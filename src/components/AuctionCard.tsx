import type { AuctionData } from "@/hooks/useAddressLookup";
import { formatEther, zeroAddress } from "viem";
import { AddressDisplay } from "./AddressDisplay";
import { cn } from "@/lib/utils";
import { NFTPreview } from "./NFTPreview";
import { FaEthereum } from "react-icons/fa";
import { PiImageFill } from "react-icons/pi";
import { useSettleAuction } from "@/hooks/useSettleAuction";
import { useState, useEffect } from "react";
import { ConnectButtonCustom } from "@/components/ConnectButton";
import { useAccount } from "wagmi";
// import type { AuctionDataWithMetadata } from "@/app/api/nft/firstMetadataBatch/route";

interface AuctionCardProps {
  auction: AuctionData;
  inputAddress: string;
  onAuctionSettled?: (auctionId: string, transactionHash: string) => void;
}

export function AuctionCard({
  auction,
  onAuctionSettled,
  inputAddress: _inputAddress, // Keep for potential future use, but unused in current logic
}: AuctionCardProps) {
  const { isConnected, address } = useAccount();
  const { settleAuction, loading, error, success, transactionHash, reset } =
    useSettleAuction();
  const [isSettled, setIsSettled] = useState(auction.isSettled || false);

  // Clear errors when connected address changes
  useEffect(() => {
    reset();
  }, [address, reset]);

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

    const role = getRelationshipToUser();
    const hasBid = auction.bidder !== zeroAddress;

    if (role === "Token Owner") {
      if (hasBid) {
        return "End Auction";
      } else {
        return "Cancel Auction";
      }
    }

    if (role === "Bidder") {
      return "End Auction";
    }

    if (role === "Curator") {
      if (hasBid) {
        return "Settle Auction";
      } else {
        return "Only owner can cancel the auction.";
      }
    }

    // Just looking, former Observer
    if (hasBid) {
      return "Settle Auction";
    } else {
      return "Only owner can cancel the auction.";
    }
  };

  const getButtonColor = () => {
    if (!isConnected)
      return " bg-gradient-to-r from-green-400 hover:from-purple-400 via-blue-400 hover:via-green-400 to-purple-400 hover:to-blue-400";
    if (isSettled) return "bg-neutral-400 cursor-default";
    if (loading) return "bg-purple-500 cursor-not-allowed";

    return "bg-neutral-500 hover:bg-neutral-600";

    // const role = getRelationshipToUser();
    // if (role === "Observer") return "bg-neutral-500 hover:bg-neutral-600";
    // if (auction.bidder === zeroAddress)
    //   return "bg-green-400 hover:bg-green-600";
    // return "bg-purple-400 hover:bg-purple-600";
  };

  const getColorBarColor = () => {
    if (!isConnected || !address) return "bg-neutral-500";
    const role = getRelationshipToUser();
    if (role === "Just looking") return "bg-neutral-500";
    if (role === "Bidder") return "bg-purple-500";
    if (role === "Curator") return "bg-blue-500";
    if (role === "Token Owner") return "bg-green-500";
  };

  const getRelationshipToUser = () => {
    if (!isConnected || !address) return "Just looking";
    if (auction.tokenOwner.toLowerCase() === address.toLowerCase())
      return "Token Owner";
    if (auction.bidder.toLowerCase() === address.toLowerCase()) return "Bidder";
    if (
      auction.curator.toLowerCase() === auction.tokenOwner.toLowerCase() &&
      auction.curator.toLowerCase() === address.toLowerCase()
    )
      return "Curator";
    return "Just looking";
  };

  const formatDateTime = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) * 1000); // Convert from Unix timestamp
      return date.toLocaleString(); // This will show date and time in local format
    } catch {
      return "Unknown date";
    }
  };

  const getAuctionEndTime = () => {
    try {
      const startTime = parseInt(auction.firstBidTime);
      const duration = parseInt(auction.duration);
      const endTime = new Date((startTime + duration) * 1000);
      return endTime.toLocaleString();
    } catch {
      return "Unknown date";
    }
  };

  const getStatusText = () => {
    const role = getRelationshipToUser();
    const hasBid = auction.bidder !== zeroAddress;
    const isSettled = auction.isSettled;

    // Settled auctions
    if (isSettled) {
      if (role === "Token Owner") {
        return hasBid
          ? "Auction completed. The NFT was transferred to the winning bidder and you received your payment."
          : "Auction was cancelled and your NFT was returned.";
      }
      if (role === "Bidder") {
        return "Congratulations! You won this auction and the NFT has been transferred to you.";
      }
      if (role === "Curator") {
        return "This auction has been settled and curator fees have been distributed.";
      }
      return "This auction has been completed and settled.";
    }

    // Unsettled auctions
    if (!isSettled) {
      if (role === "Token Owner") {
        if (hasBid) {
          return "You can settle this auction and receive your payment.";
        } else {
          return "You can cancel this auction and reclaim your NFT.";
        }
      }

      if (role === "Bidder") {
        return "You can settle this auction and receive your NFT.";
      }

      if (role === "Curator") {
        if (hasBid) {
          return "This auction has an active bid and can be settled by anyone.";
        } else {
          return "This auction has no bids. The token owner can cancel it and reclaim their NFT.";
        }
      }

      // Just looking (previously Observer)
      if (hasBid) {
        return "This auction has an active bid and you can help settle it. Token owner will receive their payment, bidder will receive their NFT.";
      } else {
        return "This auction has no bids. The token owner can cancel it and reclaim their NFT.";
      }
    }

    return "";
  };

  // if (auction.tokenId === "5628") console.dir(auction);

  return (
    <div className="flex justify-stretch gap-3 overflow-hidden rounded bg-neutral-700/90 duration-200 hover:bg-neutral-700/100 max-sm:bg-neutral-700 max-sm:border max-sm:border-neutral-500">
      {/* COLOR BAR */}
      <div
        className={cn(
          "h-full max-w-2 min-w-2 max-sm:hidden",
          getColorBarColor(),
        )}
      />

      <div className="flex w-full flex-col gap-3 p-3 pl-0 max-sm:p-2">
        {/* NFT PREVIEW */}
        <NFTPreview
          id={auction.tokenId}
          contract={auction.tokenContract}
          tokenData={auction.metadata}
        />

        <div className="flex h-full min-h-[100px] items-stretch">
          {/* COL 1 - Auction Content */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="pb-5 max-sm:pb-2 max-sm:pt-2 font-semibold text-neutral-200">
              Auction #{auction.auctionId}
            </div>
            <div className="space-y-1 space-x-3 pr-10 text-sm text-neutral-400">
              {isConnected && (
                <div className="flex items-center gap-2">
                  <span>Connected Wallet Role:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      getRelationshipToUser() === "Token Owner" &&
                        "text-green-400",
                      getRelationshipToUser() === "Bidder" && "text-purple-400",
                      getRelationshipToUser() === "Just looking" &&
                        "text-neutral-400",
                    )}
                  >
                    {getRelationshipToUser()}
                  </span>
                </div>
              )}

              <div>Token ID: {auction.tokenId}</div>
              {(!isConnected ||
                !address ||
                auction.tokenOwner.toLowerCase() !== address.toLowerCase()) && (
                <div className="flex items-center gap-2">
                  <span>Token Owner:</span>
                  <AddressDisplay address={auction.tokenOwner} showENS={true} />
                </div>
              )}
              <div>
                Reserve Price:{" "}
                <span className="text-green-600">
                  {formatEther(BigInt(auction.reservePrice))}{" "}
                  {auction.currencySymbol}
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
              {auction.bidder != zeroAddress && (
                <div>
                  Latest Bid:{" "}
                  <span className="text-green-600">
                    {auction.amountFormatted ||
                      formatEther(BigInt(auction.amount))}{" "}
                    {auction.currencySymbol}
                  </span>
                </div>
              )}

              {auction?.bidder != zeroAddress && (
                <div className="flex items-center">
                  <span className="mr-3">Bidder:</span>
                  <AddressDisplay
                    className="items-center"
                    address={auction.bidder}
                    showENS={true}
                  />
                </div>
              )}

              {/* Auction Timing - only show if there's a bidder */}
              {auction?.bidder != zeroAddress &&
                auction.firstBidTime !== "0" && (
                  <div className="space-y-1 pt-0">
                    <div>
                      <span className="text-neutral-400">Auction Start:</span>{" "}
                      <span className="text-neutral-300">
                        {formatDateTime(auction.firstBidTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Auction End:</span>{" "}
                      <span className="text-neutral-300">
                        {getAuctionEndTime()}
                      </span>
                    </div>
                  </div>
                )}

              {/* FEES distribution */}
              {(auction.bidder !== zeroAddress ||
                (auction?.curator.toLowerCase() !==
                  auction?.tokenOwner.toLowerCase() &&
                  auction?.curator !== zeroAddress)) && (
                <div className="mt-2 space-y-1 space-x-3 border-t border-neutral-600 pt-2">
                  {auction?.curator.toLowerCase() !==
                    auction?.tokenOwner.toLowerCase() &&
                    auction?.curator !== zeroAddress && (
                      <>
                        <div className="flex items-center">
                          <span className="mr-2">Curator:</span>
                          <AddressDisplay
                            address={auction.curator}
                            showENS={true}
                          />
                        </div>
                        <div>Curator Fee: {auction.curatorFeePercentage}%</div>
                      </>
                    )}
                  {auction.bidder !== zeroAddress && (
                    <div className="">
                      Secondary sales royalties may apply when settling a closed
                      auction.
                    </div>
                  )}
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

        {/* Status Bar */}
        <div className="w-full rounded bg-neutral-600 p-3 text-center text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300">Status:</span>
            <span
              className={cn(
                "font-semibold",
                !auction.isSettled && "text-yellow-400",
                auction.isSettled && "text-green-400",
              )}
            >
              {!auction.isSettled && "🟡 Unsettled Auction"}
              {auction.isSettled && "🟢 Settled Auction"}
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-400">{getStatusText()}</div>
        </div>

        {/* Action buttons */}
        <div
          className={cn(
            "w-full space-y-0 transition-all duration-200",
            getButtonColor(),
          )}
        >
          {!isConnected ? (
            <div className="flex h-full w-full justify-center">
              <ConnectButtonCustom
                text="Connect Wallet to Proceed"
                className="w-full rounded py-3 font-semibold text-white"
              />
            </div>
          ) : (
            <button
              onClick={handleSettleAuction}
              disabled={
                loading ||
                isSettled ||
                (getRelationshipToUser() === "Just looking" &&
                  auction.bidder === zeroAddress) ||
                (getRelationshipToUser() === "Curator" &&
                  auction.bidder === zeroAddress)
              }
              className={cn(
                "w-full cursor-pointer rounded py-3 text-center text-white transition-colors duration-200 disabled:cursor-not-allowed",
                getButtonColor(),
              )}
            >
              {getButtonText()}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 p-2 text-xs text-red-200">
              <strong>Error:</strong> {error}
              {/* <button
                onClick={reset}
                className="ml-2 cursor-pointer underline hover:no-underline"
              >
                Retry
              </button> */}
            </div>
          )}

          {/* Success Display */}
          {success && transactionHash && (
            <div className="bg-green-900/50 p-2 text-xs text-green-200">
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
    </div>
  );
}
