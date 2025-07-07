import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { CONTRACT } from "@/config/contract";
import { zeroAddress } from "viem";

interface SettleResponse {
  success: boolean;
  transactionHash?: string;
}

export function useSettleAuction() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const [isSettling, setIsSettling] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const settleAuction = async (auctionId: string, bidder: string): Promise<SettleResponse | null> => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet first");
    }

    setIsSettling(true);

    try {
      // Determine which function to call
      const functionName = bidder === zeroAddress ? "cancelAuction" : "endAuction";
      
      console.log(`Settling auction ${auctionId} with function: ${functionName}`);

      // Call the contract function
      await writeContract({
        address: CONTRACT.address,
        abi: CONTRACT.abi,
        functionName,
        args: [BigInt(auctionId)],
      });

      return { success: true, transactionHash: hash };
    } catch (error) {
      console.error("Error settling auction:", error);
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
    error: writeError?.message || null,
    success: isSuccess,
    transactionHash: hash,
    reset,
    isConnected,
  };
}