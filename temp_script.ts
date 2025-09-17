/**
 * Bid Verification Script for Existing JSON Data
 *
 * This script verifies bids from an existing JSON file (bids_table_20250915_original.json)
 * by checking their current status on the Market contract using bidForTokenBidder.
 *
 * A bid is considered ACTIVE if:
 * 1. result.amount > 0 (bid exists on contract)
 * 2. result.amount === bid.amount (amounts match exactly)
 *
 * Duplicate Handling:
 * - If multiple active bids have the same bidder AND same tokenId, only the most recent bid is kept
 * - Most recent is determined by block_number (descending), then log_index (descending)
 *
 * Currency Symbol Updates:
 * - For active bids with currency_symbol of "UNKNOWN" or "UNK", fetches real symbol from blockchain
 * - Updates currency_symbol in the final output with the correct value
 *
 * Outputs:
 * - NEW3_active_bids_verified_{timestamp}.json - A    // Remove duplicates (same bidder + tokenId), keeping only most recent
    const { filteredResults, duplicatesFound, duplicatesRemoved } =
      verificationService.removeDuplicates(results);

      // Step 4: Update currency symbols for UNKNOWN/UNK tokens
  console.log("🔄 Updating currency symbols for UNKNOWN/UNK tokens...");
  
  const { bids: updatedBids, symbolsUpdated } = await verificationService.updateCurrencySymbols(deduplicatedResults);
  
  console.log(`✅ Currency symbol update complete! Updated ${symbolsUpdated} symbols`);

  // Generate final report
  const report = await generateReport(updatedBids, {
    totalBids,
    startTime,
    endTime,
    batchSize,
    duplicatesFound: totalDuplicatesRemoved,
    duplicatesRemoved: totalDuplicatesRemoved,
    currencySymbolsUpdated: symbolsUpdated
  });

  // Save files with NEW3 prefix
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = `public/data/NEW3_active_bids_verified_${timestamp}.json`;
  const reportPath = `public/data/NEW3_verification_report_${timestamp}.json`;

  // Save results
  await fs.writeFile(outputPath, JSON.stringify(updatedBids, null, 2));
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Save results
    const savedFiles = await verificationService.saveResults(updatedResults, report);assed verification with updated symbols
 * - NEW3_verification_report_{timestamp}.json - Summary report with statistics including duplicates and symbol updates
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import type { Address, PublicClient } from "viem";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });

// Configuration
const MARKET_CONTRACT = "0xE5BFAB544ecA83849c53464F85B7164375Bdaac1" as Address;

// Contract ABI for bidForTokenBidder function
const MARKET_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "bidder", type: "address" },
    ],
    name: "bidForTokenBidder",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "address", name: "currency", type: "address" },
          { internalType: "address", name: "bidder", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "sellOnShare", type: "uint256" },
        ],
        internalType: "struct IMarket.Bid",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC20 ABI for fetching token metadata
const ERC20_METADATA_ABI = [
  {
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Known token registry for common currencies (avoids blockchain calls)
const KNOWN_TOKENS = {
  "0x0000000000000000000000000000000000000000": {
    symbol: "ETH",
    decimals: 18,
    name: "Ethereum",
  },
  "0x6b175474e89094c44da98b954eedeac495271d0f": {
    symbol: "DAI",
    decimals: 18,
    name: "Dai Stablecoin",
  },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  },
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
    symbol: "WETH",
    decimals: 18,
    name: "Wrapped Ether",
  },
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": {
    symbol: "WBTC",
    decimals: 8,
    name: "Wrapped Bitcoin",
  },
} as const;

// Cache for dynamically fetched tokens to avoid repeated calls
const dynamicTokenCache = new Map<
  string,
  {
    symbol: string;
    decimals: number;
    name: string;
  }
>();

/**
 * Fetch token metadata from blockchain contract
 */
async function fetchTokenMetadata(
  client: PublicClient,
  tokenAddress: string,
): Promise<{
  symbol: string;
  decimals: number;
  name: string;
}> {
  const address = tokenAddress.toLowerCase();

  // Check cache first
  if (dynamicTokenCache.has(address)) {
    return dynamicTokenCache.get(address)!;
  }

  try {
    console.log(`🔍 Fetching token metadata for ${tokenAddress}...`);

    // Fetch all metadata in parallel
    const [symbol, decimals, name] = await Promise.all([
      client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_METADATA_ABI,
        functionName: "symbol",
      }) as Promise<string>,

      client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_METADATA_ABI,
        functionName: "decimals",
      }) as Promise<number>,

      client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_METADATA_ABI,
        functionName: "name",
      }) as Promise<string>,
    ]);

    const tokenInfo = {
      symbol: symbol || "UNKNOWN",
      decimals: decimals || 18,
      name: name || "Unknown Token",
    };

    // Cache the result
    dynamicTokenCache.set(address, tokenInfo);

    console.log(
      `✅ Fetched: ${tokenInfo.name} (${tokenInfo.symbol}, ${tokenInfo.decimals} decimals)`,
    );

    return tokenInfo;
  } catch (error) {
    console.warn(
      `⚠️ Failed to fetch token metadata for ${tokenAddress}:`,
      error,
    );

    // Fallback to unknown values
    const fallback = {
      symbol: "UNKNOWN",
      decimals: 18,
      name: "Unknown Token",
    };

    // Cache the fallback to avoid repeated failed calls
    dynamicTokenCache.set(address, fallback);

    return fallback;
  }
}

/**
 * Get token info with dynamic fetching for unknown tokens
 */
async function getTokenInfo(
  client: PublicClient,
  currencyAddress: string,
): Promise<{
  symbol: string;
  decimals: number;
  name: string;
}> {
  const address = currencyAddress.toLowerCase();

  // Check if it's a known token first
  if (address in KNOWN_TOKENS) {
    return KNOWN_TOKENS[address as keyof typeof KNOWN_TOKENS];
  }

  // Fetch from blockchain for unknown tokens
  return await fetchTokenMetadata(client, address);
}

// Types based on the original JSON structure
interface OriginalBidData {
  id: string;
  transaction_hash: string;
  log_index: number;
  token_id: string;
  token_contract: string;
  amount: string;
  amount_formatted: string;
  currency: string;
  currency_symbol: string;
  currency_decimals: number;
  bidder: string;
  recipient: string;
  token_owner: string;
  timestamp: string;
  block_number: number;
  is_active: string;
  is_withdrawn: string;
  is_accepted: string;
  data: string;
}

interface ContractBidResult {
  amount: bigint;
  currency: Address;
  bidder: Address;
  recipient: Address;
  sellOnShare: bigint;
}

interface VerificationResult {
  bid: OriginalBidData;
  isActive: boolean;
  contractAmount: string | null;
  amountMatches: boolean;
  error?: string;
}

interface VerificationReport {
  metadata: {
    createdAt: string;
    sourceFile: string;
    verificationMethod: string;
    contractAddress: string;
    totalBidsChecked: number;
    processingTime: string;
  };
  summary: {
    totalBids: number;
    activeBids: number;
    inactiveBids: number;
    errorBids: number;
    duplicatesFound: number;
    duplicatesRemoved: number;
    finalActiveBids: number;
    currencySymbolsUpdated: number;
    successRate: string;
  };
  currencyBreakdown: {
    [currency: string]: {
      total: number;
      active: number;
      totalAmount: string;
      activeAmount: string;
    };
  };
  wethSummary: {
    totalWethBids: number;
    activeWethBids: number;
    totalWethAmount: string;
    activeWethAmount: string;
  };
}

/**
 * Contract Verification Service
 */
class BidVerificationService {
  private client: PublicClient;

  constructor() {
    // Validate required environment variables
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL environment variable is required");
    }

    this.client = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl),
    });
  }

  /**
   * Check if a bid is still active on the contract with exact amount matching
   */
  async verifyBidOnContract(
    tokenId: string,
    bidder: string,
    expectedAmount: string,
  ): Promise<{
    isActive: boolean;
    contractAmount: string | null;
    amountMatches: boolean;
    error?: string;
  }> {
    try {
      const result = (await this.client.readContract({
        address: MARKET_CONTRACT,
        abi: MARKET_ABI,
        functionName: "bidForTokenBidder",
        args: [BigInt(tokenId), bidder as Address],
      })) as ContractBidResult;

      const contractAmount = result?.amount?.toString() || "0";
      const amountMatches = contractAmount === expectedAmount;
      const isActive = result?.amount > 0n && amountMatches;

      return {
        isActive,
        contractAmount: contractAmount !== "0" ? contractAmount : null,
        amountMatches,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.debug(
        `Error checking bid for token ${tokenId}, bidder ${bidder}: ${errorMessage}`,
      );
      return {
        isActive: false,
        contractAmount: null,
        amountMatches: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Load bids from the original JSON file
   */
  loadBidsFromFile(filePath: string): OriginalBidData[] {
    if (!existsSync(filePath)) {
      throw new Error(`Bids file not found: ${filePath}`);
    }

    console.log(`📂 Loading bids from ${filePath.split("/").pop()}...`);
    const fileContent = readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent) as OriginalBidData[];

    if (!Array.isArray(data)) {
      throw new Error("Invalid bids file format - expected array");
    }

    console.log(`✅ Loaded ${data.length} bids from file`);
    return data;
  }

  /**
   * Verify all bids from the JSON file
   */
  async verifyAllBids(
    bids: OriginalBidData[],
    batchSize = 20,
  ): Promise<VerificationResult[]> {
    console.log("🔍 Starting bid verification process...");
    console.log(`📊 Processing ${bids.length} bids in batches of ${batchSize}`);
    console.log("⚠️  This may take a while due to RPC rate limits...");

    const results: VerificationResult[] = [];
    let checkedCount = 0;
    let activeCount = 0;
    let errorCount = 0;

    const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds between batches
    const totalBatches = Math.ceil(bids.length / batchSize);

    // Time tracking variables
    const startTime = Date.now();
    let batchStartTime = Date.now();
    const batchTimes: number[] = [];

    // Process in batches to manage rate limits
    for (let i = 0; i < bids.length; i += batchSize) {
      const batch = bids.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;

      batchStartTime = Date.now();

      console.log(
        `📦 Processing batch ${currentBatch}/${totalBatches} (bids ${i + 1}-${Math.min(i + batchSize, bids.length)})`,
      );

      // Process batch in parallel
      const batchPromises = batch.map(async (bid) => {
        const verification = await this.verifyBidOnContract(
          bid.token_id,
          bid.bidder,
          bid.amount,
        );

        checkedCount++;

        if (verification.error) {
          errorCount++;
        } else if (verification.isActive) {
          activeCount++;
        }

        const result: VerificationResult = {
          bid,
          isActive: verification.isActive,
          contractAmount: verification.contractAmount,
          amountMatches: verification.amountMatches,
          error: verification.error,
        };

        return result;
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Calculate timing and progress
      const batchEndTime = Date.now();
      const batchDuration = batchEndTime - batchStartTime;
      batchTimes.push(batchDuration);

      // Calculate progress and ETA
      const progressPercent = ((currentBatch / totalBatches) * 100).toFixed(1);
      const avgBatchTime =
        batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length;
      const remainingBatches = totalBatches - currentBatch;
      const estimatedRemainingTime =
        (remainingBatches * (avgBatchTime + DELAY_BETWEEN_BATCHES)) / 1000;

      console.log(
        `✅ Batch ${currentBatch}/${totalBatches} complete: ${activeCount} active bids found so far (${checkedCount}/${bids.length} checked)`,
      );
      console.log(
        `📈 Progress: ${progressPercent}% | Batch took: ${(batchDuration / 1000).toFixed(1)}s | Avg: ${(avgBatchTime / 1000).toFixed(1)}s`,
      );

      if (remainingBatches > 0) {
        console.log(
          `⏰ ETA: ${Math.ceil(estimatedRemainingTime / 60)}m ${Math.ceil(estimatedRemainingTime % 60)}s remaining`,
        );
      }

      // Rate limiting delay between batches
      if (i + batchSize < bids.length) {
        console.log(
          `⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES),
        );
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(
      `\n⏱️  Total verification time: ${Math.ceil(totalTime / 60)}m ${Math.ceil(totalTime % 60)}s`,
    );

    console.log(`\n📊 Verification Results:`);
    console.log(`• Total bids processed: ${checkedCount}`);
    console.log(`• Active bids found: ${activeCount}`);
    console.log(`• Errors encountered: ${errorCount}`);
    if (checkedCount > 0) {
      console.log(
        `• Success rate: ${((activeCount / checkedCount) * 100).toFixed(2)}%`,
      );
    }

    return results;
  }

  /**
   * Remove duplicate bids (same bidder and tokenId), keeping only the most recent one
   */
  removeDuplicates(results: VerificationResult[]): {
    filteredResults: VerificationResult[];
    duplicatesFound: number;
    duplicatesRemoved: number;
  } {
    console.log("\n🔍 Checking for duplicate bids (same bidder + tokenId)...");

    const activeBids = results.filter((r) => r.isActive);
    console.log(
      `📊 Checking ${activeBids.length} active bids for duplicates...`,
    );

    // Group by bidder + tokenId combination
    const bidGroups = new Map<string, VerificationResult[]>();

    for (const result of activeBids) {
      const key = `${result.bid.bidder.toLowerCase()}-${result.bid.token_id}`;
      const existing = bidGroups.get(key) || [];
      existing.push(result);
      bidGroups.set(key, existing);
    }

    // Find groups with duplicates and keep only the most recent
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;
    const keptBids = new Set<string>();

    for (const [key, group] of bidGroups) {
      if (group.length > 1) {
        duplicatesFound += group.length;
        console.log(
          `🔄 Found ${group.length} duplicate bids for bidder-token: ${key}`,
        );

        // Sort by block number (descending) to get the most recent first
        // If block numbers are the same, sort by log_index (descending)
        group.sort((a, b) => {
          if (a.bid.block_number !== b.bid.block_number) {
            return b.bid.block_number - a.bid.block_number;
          }
          return b.bid.log_index - a.bid.log_index;
        });

        // Keep the most recent (first after sorting)
        const mostRecent = group[0];
        if (mostRecent) {
          keptBids.add(mostRecent.bid.id);
          console.log(
            `✅ Keeping most recent bid: ${mostRecent.bid.id} (block: ${mostRecent.bid.block_number}, log: ${mostRecent.bid.log_index})`,
          );
        }

        duplicatesRemoved += group.length - 1;

        // Log the removed duplicates
        for (let i = 1; i < group.length; i++) {
          const removed = group[i];
          if (removed) {
            console.log(
              `❌ Removing duplicate bid: ${removed.bid.id} (block: ${removed.bid.block_number}, log: ${removed.bid.log_index})`,
            );
          }
        }
      } else {
        // No duplicates, keep the single bid
        const single = group[0];
        if (single) {
          keptBids.add(single.bid.id);
        }
      }
    }

    // Filter results to include only non-duplicate active bids and all inactive bids
    const filteredResults = results.filter((result) => {
      if (!result.isActive) {
        // Keep all inactive bids as-is
        return true;
      }
      // For active bids, only keep non-duplicates
      return keptBids.has(result.bid.id);
    });

    console.log(`\n📋 Duplicate Detection Summary:`);
    console.log(`• Total duplicate bids found: ${duplicatesFound}`);
    console.log(`• Duplicate bids removed: ${duplicatesRemoved}`);
    console.log(`• Final active bids after deduplication: ${keptBids.size}`);

    return {
      filteredResults,
      duplicatesFound,
      duplicatesRemoved,
    };
  }

  /**
   * Update currency symbols for active bids with UNKNOWN or UNK symbols
   */
  async updateCurrencySymbols(results: VerificationResult[]): Promise<{
    updatedResults: VerificationResult[];
    symbolsUpdated: number;
  }> {
    console.log("\n🔍 Checking for currency symbols that need updating...");

    const activeBids = results.filter((r) => r.isActive);
    const unknownSymbolBids = activeBids.filter(
      (r) => r.bid.currency_symbol === "UNKNOWN" || r.bid.currency_symbol === "UNK"
    );

    console.log(
      `📊 Found ${unknownSymbolBids.length} active bids with UNKNOWN/UNK symbols to update...`
    );

    if (unknownSymbolBids.length === 0) {
      console.log("✅ No currency symbols need updating");
      return {
        updatedResults: results,
        symbolsUpdated: 0,
      };
    }

    let symbolsUpdated = 0;
    const updatedResults = [...results];

    // Process in smaller batches to manage rate limits
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches
    const totalBatches = Math.ceil(unknownSymbolBids.length / BATCH_SIZE);

    console.log(`🔄 Processing ${unknownSymbolBids.length} currency lookups in ${totalBatches} batches...`);

    for (let i = 0; i < unknownSymbolBids.length; i += BATCH_SIZE) {
      const batch = unknownSymbolBids.slice(i, i + BATCH_SIZE);
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

      console.log(
        `📦 Processing currency batch ${currentBatch}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, unknownSymbolBids.length)})`,
      );

      // Process batch in parallel
      const batchPromises = batch.map(async (result) => {
        try {
          const tokenInfo = await getTokenInfo(this.client, result.bid.currency);
          
          if (tokenInfo.symbol !== "UNKNOWN" && tokenInfo.symbol !== result.bid.currency_symbol) {
            // Find the result in updatedResults and update it
            const resultIndex = updatedResults.findIndex(r => r.bid.id === result.bid.id);
            if (resultIndex !== -1) {
              // Create a copy of the bid with updated currency symbol
              const updatedBid = {
                ...updatedResults[resultIndex]!.bid,
                currency_symbol: tokenInfo.symbol,
              };
              
              // Update the result
              updatedResults[resultIndex] = {
                ...updatedResults[resultIndex]!,
                bid: updatedBid,
              };

              symbolsUpdated++;
              console.log(
                `✅ Updated currency symbol for ${result.bid.currency}: ${result.bid.currency_symbol} → ${tokenInfo.symbol}`,
              );
            }
          }
        } catch (error) {
          console.warn(
            `⚠️ Failed to update currency symbol for ${result.bid.currency}:`,
            error,
          );
        }
      });

      await Promise.all(batchPromises);

      console.log(
        `✅ Currency batch ${currentBatch}/${totalBatches} complete: ${symbolsUpdated} symbols updated so far`,
      );

      // Rate limiting delay between batches
      if (i + BATCH_SIZE < unknownSymbolBids.length) {
        console.log(
          `⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES),
        );
      }
    }

    console.log(`\n📋 Currency Symbol Update Summary:`);
    console.log(`• Symbols checked: ${unknownSymbolBids.length}`);
    console.log(`• Symbols successfully updated: ${symbolsUpdated}`);

    return {
      updatedResults,
      symbolsUpdated,
    };
  }

  /**
   * Generate verification report with statistics
   */
  generateReport(
    results: VerificationResult[],
    duplicateInfo: { duplicatesFound: number; duplicatesRemoved: number },
    currencySymbolsUpdated: number,
    sourceFile: string,
    processingTime: string,
  ): VerificationReport {
    const activeBids = results.filter((r) => r.isActive);
    const inactiveBids = results.filter((r) => !r.isActive && !r.error);
    const errorBids = results.filter((r) => r.error);

    // Currency breakdown
    const currencyBreakdown: { [currency: string]: any } = {};
    const allBids = results.map((r) => r.bid);

    for (const bid of allBids) {
      const currency = bid.currency_symbol;
      if (!currencyBreakdown[currency]) {
        currencyBreakdown[currency] = {
          total: 0,
          active: 0,
          totalAmount: 0,
          activeAmount: 0,
        };
      }

      currencyBreakdown[currency].total++;
      currencyBreakdown[currency].totalAmount += parseFloat(
        bid.amount_formatted,
      );

      // Check if this bid is active
      const isActive = results.find((r) => r.bid.id === bid.id)?.isActive;
      if (isActive) {
        currencyBreakdown[currency].active++;
        currencyBreakdown[currency].activeAmount += parseFloat(
          bid.amount_formatted,
        );
      }
    }

    // Convert amounts to strings for JSON serialization
    Object.keys(currencyBreakdown).forEach((currency) => {
      currencyBreakdown[currency].totalAmount =
        currencyBreakdown[currency].totalAmount.toString();
      currencyBreakdown[currency].activeAmount =
        currencyBreakdown[currency].activeAmount.toString();
    });

    // WETH specific summary
    const wethData = currencyBreakdown["WETH"] || {
      total: 0,
      active: 0,
      totalAmount: "0",
      activeAmount: "0",
    };

    return {
      metadata: {
        createdAt: new Date().toISOString(),
        sourceFile,
        verificationMethod: "bidForTokenBidder with exact amount matching",
        contractAddress: MARKET_CONTRACT,
        totalBidsChecked: results.length,
        processingTime,
      },
      summary: {
        totalBids: results.length,
        activeBids: activeBids.length,
        inactiveBids: inactiveBids.length,
        errorBids: errorBids.length,
        duplicatesFound: duplicateInfo.duplicatesFound,
        duplicatesRemoved: duplicateInfo.duplicatesRemoved,
        finalActiveBids: activeBids.length,
        currencySymbolsUpdated,
        successRate:
          ((activeBids.length / results.length) * 100).toFixed(2) + "%",
      },
      currencyBreakdown,
      wethSummary: {
        totalWethBids: wethData.total,
        activeWethBids: wethData.active,
        totalWethAmount: wethData.totalAmount,
        activeWethAmount: wethData.activeAmount,
      },
    };
  }

  /**
   * Save results to JSON files
   */
  async saveResults(
    results: VerificationResult[],
    report: VerificationReport,
  ): Promise<{ activeBidsFile: string; reportFile: string }> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);

    // Save active bids (keeping original structure)
    const activeBids = results.filter((r) => r.isActive).map((r) => r.bid);

    const activeBidsFile = resolve(
      process.cwd(),
      `public/data/NEW3_active_bids_verified_${timestamp}.json`,
    );

    writeFileSync(activeBidsFile, JSON.stringify(activeBids, null, 2), "utf8");

    console.log(
      `💾 Saved ${activeBids.length} active bids to ${activeBidsFile.split("/").pop()}`,
    );

    // Save verification report
    const reportFile = resolve(
      process.cwd(),
      `public/data/NEW3_verification_report_${timestamp}.json`,
    );

    writeFileSync(reportFile, JSON.stringify(report, null, 2), "utf8");

    console.log(
      `📊 Saved verification report to ${reportFile.split("/").pop()}`,
    );

    return {
      activeBidsFile: activeBidsFile.split("/").pop() || "",
      reportFile: reportFile.split("/").pop() || "",
    };
