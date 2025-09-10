import type { ActiveBid } from "@/hooks/useAddressLookup";
import { AddressDisplay } from "./AddressDisplay";
import { cn } from "@/lib/utils";
import { NFTPreview } from "./NFTPreview";
import { FaEthereum } from "react-icons/fa";
import { PiImageFill } from "react-icons/pi";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";
import { ConnectButtonCustom } from "@/components/ConnectButton";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MEDIA_CONTRACT } from "@/config/contract";

interface BidCardProps {
  bid: ActiveBid;
  inputAddress: string; // Keep for potential future use, but unused in current logic
}

export default function BidCard({
  bid,
  inputAddress: _inputAddress,
}: BidCardProps) {
  const { isConnected, address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle database state update after successful transaction
  useEffect(() => {
    const updateBidState = async () => {
      try {
        // Determine the action based on user's role
        const isBidder = address?.toLowerCase() === bid.bidder.toLowerCase();
        const isTokenOwner =
          address?.toLowerCase() === bid.tokenOwner.toLowerCase();

        const action = isBidder ? "withdraw" : isTokenOwner ? "accept" : null;

        if (!action) {
          console.error("Unable to determine action type for bid state update");
          return;
        }

        const response = await fetch(`/api/bids/update-bid-state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenId: bid.tokenId,
            bidder: bid.bidder,
            transactionHash: bid.transactionHash,
            action: action,
          }),
        });

        if (!response.ok) {
          console.error(
            "Failed to update bid state in database:",
            response.statusText,
          );
        } else {
          const result = (await response.json()) as {
            message: string;
            success: boolean;
            action: string;
          };
          console.log("Bid state successfully updated:", result.message);
        }
      } catch (error) {
        console.error("Error updating bid state in database:", error);
      }
    };

    if (isSuccess && hash && address) {
      void updateBidState();
    }
  }, [
    isSuccess,
    hash,
    bid.tokenId,
    bid.bidder,
    bid.transactionHash,
    address,
    bid.tokenOwner,
  ]);

  useEffect(() => {
    // Clear errors when the connected address changes
    setError(null);
  }, [address]);

  const formatAmount = () => {
    try {
      return formatUnits(BigInt(bid.amount), bid.currencyDecimals);
    } catch {
      return bid.amountFormatted || "0";
    }
  };

  if (bid.tokenId == "7") console.dir(bid);

  const handleSettleBid = async () => {
    if (isPending || isConfirming) return;

    if (!isConnected || !address) {
      // Wallet connection will be handled by the ConnectButton
      return;
    }

    const isBidder = address.toLowerCase() === bid.bidder.toLowerCase();
    const isTokenOwner = address.toLowerCase() === bid.tokenOwner.toLowerCase();

    // Check if connected address has permission to perform an action
    if (!isBidder && !isTokenOwner) {
      setError(
        "You can only interact with bids where you are the bidder or token owner",
      );
      return;
    }

    try {
      setError(null);

      if (isBidder) {
        // Bidder can withdraw their bid
        writeContract({
          address: MEDIA_CONTRACT.address,
          abi: MEDIA_CONTRACT.abi,
          functionName: "removeBid",
          args: [BigInt(bid.tokenId)],
        });
      } else if (isTokenOwner) {
        // Token owner can accept the bid
        const bidStruct = {
          amount: BigInt(bid.amount),
          currency: bid.currency as `0x${string}`,
          bidder: bid.bidder as `0x${string}`,
          recipient: bid.recipient as `0x${string}`,
          sellOnShare: {
            value: BigInt(bid.sellOnShareValue ?? "0"),
          },
        };

        writeContract({
          address: MEDIA_CONTRACT.address,
          abi: MEDIA_CONTRACT.abi,
          functionName: "acceptBid",
          args: [BigInt(bid.tokenId), bidStruct],
        });
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isPending) return "Confirming...";
    if (isConfirming) return "Processing...";
    if (isSuccess) return "✅ Completed";

    const role = getRelationshipToUser();
    if (role === "Token Owner") return "Accept Bid";
    if (role === "Bidder") return "Withdraw Bid";
    return "Only owner or bidder can interact.";
  };

  const getButtonColor = () => {
    if (!isConnected)
      return "bg-gradient-to-r from-green-400 hover:from-purple-400 via-blue-400 hover:via-green-400 to-purple-400 hover:to-blue-400";
    if (isSuccess) return "bg-neutral-400 cursor-default";
    if (isPending || isConfirming) return "bg-purple-500 cursor-not-allowed";

    return "bg-neutral-500";

    // const role = getRelationshipToUser();
    // if (role === "Token Owner") return "bg-green-400 hover:bg-green-600";
    // if (role === "Bidder") return "bg-purple-400 hover:bg-purple-600";
    // return "bg-neutral-500 hover:bg-neutral-600";
  };

  const reset = () => {
    setError(null);
  };

  const getColorBarColor = () => {
    if (!isConnected || !address) return "bg-neutral-500";
    if (bid.tokenOwner.toLowerCase() === address.toLowerCase())
      return "bg-green-500";
    if (bid.bidder.toLowerCase() === address.toLowerCase())
      return "bg-purple-500";
    return "bg-neutral-500";
  };

  const getRelationshipToUser = () => {
    if (!isConnected || !address) return "Just looking";
    if (bid.tokenOwner.toLowerCase() === address.toLowerCase())
      return "Token Owner";
    if (bid.bidder.toLowerCase() === address.toLowerCase()) return "Bidder";
    return "Just looking";
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="flex justify-stretch gap-3 overflow-hidden rounded bg-neutral-700/90 duration-200 hover:bg-neutral-700/100">
      <div className="flex w-full flex-col gap-3 p-3 pr-0">
        {/* NFT PREVIEW */}
        <NFTPreview
          id={bid.tokenId}
          contract={"0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7"}
        />{" "}
        {/* Contract address not available in bid data */}
        <div className="flex h-full min-h-[100px] items-stretch">
          {/* COL 1 - Bid Content */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="pb-5 font-semibold text-neutral-200">
              Token #{bid.tokenId}
            </div>
            <div className="space-y-1 space-x-3 pr-10 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <span>Your Role:</span>
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

              <div>
                Bid Amount:{" "}
                <span className="text-green-600">
                  {formatAmount()} {bid.currencySymbol || "UNKNOWN"}
                </span>
              </div>

              <div>
                Bid Date:{" "}
                <span className="text-neutral-300">
                  {formatDate(bid.timestamp)}
                </span>
              </div>

              {(!isConnected ||
                !address ||
                bid.bidder.toLowerCase() !== address.toLowerCase()) && (
                <div className="flex items-center gap-2">
                  <span>Bidder:</span>
                  <AddressDisplay address={bid.bidder} showENS={true} />
                </div>
              )}

              {(!isConnected ||
                !address ||
                bid.tokenOwner.toLowerCase() !== address.toLowerCase()) && (
                <div className="flex items-center gap-2">
                  <span>Token Owner:</span>
                  <AddressDisplay address={bid.tokenOwner} showENS={true} />
                </div>
              )}

              {bid.recipient !== bid.bidder && (
                <div className="flex items-center gap-2">
                  <span>Recipient:</span>
                  <AddressDisplay address={bid.recipient} showENS={true} />
                </div>
              )}

              {/* <div className="text-xs text-neutral-500">
                Implementation: {bid.implementation || "Unknown"}
              </div> */}

              {bid.transactionHash && (
                <div className="mt-2 text-xs">
                  <a
                    href={`https://etherscan.io/tx/${bid.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:no-underline"
                  >
                    View Transaction
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* COL 2 - Visual Indicators */}
          <div className="flex w-16 cursor-help flex-col gap-[1px] bg-neutral-600 p-[1px]">
            <div
              className="flex flex-1 cursor-help items-center justify-center bg-neutral-700"
              title={
                getRelationshipToUser() === "Bidder"
                  ? "You placed this bid and may receive the NFT if accepted."
                  : "Someone has placed a bid on this NFT."
              }
            >
              <FaEthereum className="h-6 w-6 text-blue-400" />
            </div>
            <div
              className="flex flex-1 items-center justify-center bg-neutral-700"
              title={
                getRelationshipToUser() === "Token Owner"
                  ? "You own this NFT and can accept or reject this bid."
                  : "This is an active bid on an NFT."
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
                bid.status === "active" && "text-yellow-400",
                bid.status === "withdrawn" && "text-red-400",
                bid.status === "accepted" && "text-green-400",
              )}
            >
              {bid.status === "active" && "🟡 Active Bid"}
              {bid.status === "withdrawn" && "🔴 Withdrawn Bid"}
              {bid.status === "accepted" && "🟢 Accepted Bid"}
            </span>
          </div>
          {getRelationshipToUser() === "Token Owner" &&
            bid.status === "active" && (
              <div className="mt-2 text-xs text-neutral-400">
                You can accept this bid and receive your payment.
              </div>
            )}
          {getRelationshipToUser() === "Bidder" && bid.status === "active" && (
            <div className="mt-3 flex flex-col gap-1 pl-6 text-left text-xs text-neutral-400">
              <p>Your bid is active and waiting for owner response.</p>
              <p>You can withdraw this bid if you want.</p>
            </div>
          )}
        </div>
        {/* Action buttons - only show for active bids */}
        {bid.status === "active" && (
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
                onClick={handleSettleBid}
                disabled={
                  isPending ||
                  isConfirming ||
                  isSuccess ||
                  getRelationshipToUser() == "Just looking"
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
            {(error ?? writeError) && (
              <div className="bg-red-900/50 p-2 text-xs text-red-200">
                <strong>Error:</strong>{" "}
                {error ?? writeError?.message ?? "An error occurred"}
                <button
                  onClick={reset}
                  className="ml-2 cursor-pointer underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Success Display */}
            {isSuccess && hash && (
              <div className="bg-green-900/50 p-2 text-xs text-green-200">
                <strong>Success!</strong>{" "}
                <a
                  href={`https://etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  View on Etherscan
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      {/* COLOR BAR */}
      <div className={cn("h-full max-w-2 min-w-2", getColorBarColor())} />
    </div>
  );
}
