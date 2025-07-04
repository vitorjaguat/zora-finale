import { useReadContract } from "wagmi";
import { CONTRACT } from "@/config/contract";

// Generic read hook
export function useContractRead(
  functionName:
    | "auctions"
    | "minBidIncrementPercentage"
    | "timeBuffer"
    | "wethAddress"
    | "zora",
  args?: readonly [] | readonly [bigint],
) {
  return useReadContract({
    address: CONTRACT.address,
    abi: CONTRACT.abi,
    functionName,
    args,
  });
}

// Example specific hooks (replace with actual function names from the contract)
export function useReadAuction(auctionId?: bigint) {
  return useContractRead("auctions", auctionId ? [auctionId] : undefined);
}
