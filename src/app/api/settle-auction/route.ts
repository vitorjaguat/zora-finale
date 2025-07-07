import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !ALCHEMY_API_KEY) {
  throw new Error("Missing required environment variables");
}

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

// Simplified ABI for the auction functions
const auctionAbi = parseAbi([
  "function endAuction(uint256 auctionId) external",
  "function cancelAuction(uint256 auctionId) external",
  "function auctions(uint256) external view returns (address tokenContract, uint256 tokenId, address tokenOwner, address bidder, address curator, address auctionCurrency, uint256 amount, uint256 duration, uint256 firstBidTime, uint256 reservePrice, uint8 curatorFeePercentage, bool approved)"
]);

export async function POST(request: NextRequest) {
  try {
    const { auctionId, bidder } = await request.json();

    if (!auctionId) {
      return NextResponse.json(
        { error: "Auction ID is required" },
        { status: 400 }
      );
    }

    // Determine which function to call based on bidder
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const functionName = bidder === zeroAddress ? "cancelAuction" : "endAuction";

    console.log(`Settling auction ${auctionId} with function: ${functionName}`);

    // Simulate the transaction first
    const { request: simulationRequest } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: auctionAbi,
      functionName,
      args: [BigInt(auctionId)],
      account,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(simulationRequest);

    console.log(`Transaction submitted: ${hash}`);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60_000, // 60 seconds timeout
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    });

  } catch (error) {
    console.error("Error settling auction:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to settle auction",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}