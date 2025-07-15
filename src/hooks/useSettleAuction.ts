import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { CONTRACT } from "@/config/contract";
import { zeroAddress } from "viem";

interface SettleResponse {
  success: boolean;
  transactionHash?: string;
}

export function useSettleAuction() {
  const { address, isConnected } = useAccount();
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract();
  const [isSettling, setIsSettling] = useState(false);
  const [auctionIdToUpdate, setAuctionIdToUpdate] = useState<string | null>(
    null,
  );

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update database when transaction is confirmed
  useEffect(() => {
    if (isSuccess && auctionIdToUpdate) {
      void updateAuctionInDatabase(auctionIdToUpdate);
      setAuctionIdToUpdate(null);
    }
  }, [isSuccess, auctionIdToUpdate]);

  const updateAuctionInDatabase = async (auctionId: string) => {
    try {
      // Call API to update auction settlement status
      const response = await fetch(`/api/auctions/${auctionId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSettled: true }),
      });

      if (!response.ok) {
        console.error("Failed to update auction in database");
      }
    } catch (error) {
      console.error("Error updating auction database:", error);
    }
  };

  const settleAuction = async (
    auctionId: string,
    bidder: string,
  ): Promise<SettleResponse | null> => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet first");
    }

    setIsSettling(true);
    setAuctionIdToUpdate(auctionId); // Store for later database update

    try {
      // Determine which function to call
      const functionName =
        bidder === zeroAddress ? "cancelAuction" : "endAuction";

      console.log(
        `Settling auction ${auctionId} with function: ${functionName}`,
      );

      // Call the contract function
      writeContract({
        address: CONTRACT.address,
        abi: CONTRACT.abi,
        functionName,
        args: [BigInt(auctionId)],
      });

      return { success: true, transactionHash: hash };
    } catch (error) {
      console.error("Error settling auction:", error);
      setAuctionIdToUpdate(null); // Clear on error
      throw error;
    } finally {
      setIsSettling(false);
    }
  };

  const reset = () => {
    setIsSettling(false);
  };

  return {
    settleAuction,
    loading: isPending || isConfirming || isSettling,
    error: writeError?.message ?? null, // Fixed: Use nullish coalescing
    success: isSuccess,
    transactionHash: hash,
    reset,
    isConnected,
  };
}
