/**
 * Zora Marketplace BidCreated Event Integra      // Read        try {
          const fileContent = readFileSync(marketFilePath, "utf-8");
          const parsed = JSON.parse(fileContent) as NormalizedBidEvent[];
          existingData = Array.isArray(parsed) ? parsed : [];
          console.log(`📖 Loaded ${existingData.length} existing bid events`);
        } catch {
          console.warn("⚠️  Could not parse existing market.json, starting fresh");
          existingData = [];
        }g data if file exists
      let existingData: NormalizedBidEvent[] = [];
      if (existsSync(marketFilePath)) {
        try {
          const fileContent = readFileSync(marketFilePath, "utf-8");
          const parsed = JSON.parse(fileContent) as NormalizedBidEvent[];
          existingData = Array.isArray(parsed) ? parsed : [];
          console.log(`📖 Loaded ${existingData.length} existing bid events`);
        } catch {
          console.warn("⚠️  Could not parse existing market.json, starting fresh");
          existingData = [];
        }
      }his module provides utilities for integrating the BidCreated event aggregator
 * with the main application and database.
 */

import {
  BidCreatedAggregator,
  type NormalizedBidEvent,
} from "../scripts/production-bid-aggregator.js";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Service class for integrating bid events with the application
 */
export class BidEventService {
  private aggregator: BidCreatedAggregator;

  constructor(contractAddress?: string, apiKey?: string) {
    this.aggregator = new BidCreatedAggregator(contractAddress, apiKey);
  }

  /**
   * Fetch and normalize bid events for a specific block range
   */
  async fetchEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<NormalizedBidEvent[]> {
    return this.aggregator.fetchBidCreatedEventsWithPagination(
      fromBlock,
      toBlock,
    );
  }

  /**
   * Get statistics for a set of bid events
   */
  getStatistics(events: NormalizedBidEvent[]) {
    return this.aggregator.getEventStatistics(events);
  }

  /**
   * Store bid events in a JSON file for analysis
   */
  async storeBidEvents(events: NormalizedBidEvent[]): Promise<void> {
    try {
      const marketFilePath = resolve(process.cwd(), "public/data/market.json");

      // Read existing data if file exists
      let existingData: NormalizedBidEvent[] = [];
      if (existsSync(marketFilePath)) {
        try {
          const fileContent = readFileSync(marketFilePath, "utf-8");
          const parsed = JSON.parse(fileContent) as NormalizedBidEvent[];
          existingData = Array.isArray(parsed) ? parsed : [];
          console.log(`� Loaded ${existingData.length} existing bid events`);
        } catch {
          console.warn(
            "⚠️  Could not parse existing market.json, starting fresh",
          );
          existingData = [];
        }
      }

      // Merge new events with existing ones, avoiding duplicates
      const existingHashes = new Set(
        existingData.map((e) => e.transactionHash),
      );
      const newEvents = events.filter(
        (e) => !existingHashes.has(e.transactionHash),
      );

      const allEvents = [...existingData, ...newEvents];

      // Sort by block number and log index for chronological order
      allEvents.sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) {
          return a.blockNumber - b.blockNumber;
        }
        return a.logIndex - b.logIndex;
      });

      // Write to file
      writeFileSync(
        marketFilePath,
        JSON.stringify(allEvents, null, 2),
        "utf-8",
      );

      console.log(
        `📝 Stored ${newEvents.length} new bid events to market.json`,
      );
      console.log(`📊 Total events in market.json: ${allEvents.length}`);

      // Log summary of what was stored
      if (newEvents.length > 0) {
        console.log(`💰 New events by currency:`);
        const currencyGroups = new Map<
          string,
          { count: number; totalFormatted: number }
        >();

        for (const event of newEvents) {
          const current = currencyGroups.get(event.currencySymbol) ?? {
            count: 0,
            totalFormatted: 0,
          };
          currencyGroups.set(event.currencySymbol, {
            count: current.count + 1,
            totalFormatted:
              current.totalFormatted + parseFloat(event.amountFormatted),
          });
        }

        for (const [symbol, data] of currencyGroups) {
          console.log(
            `   • ${data.count} bids totaling ${data.totalFormatted.toFixed(6)} ${symbol}`,
          );
        }
      }
    } catch (error) {
      console.error("❌ Error storing bid events to market.json:", error);
      throw error;
    }
  }

  /**
   * Fetch bid events and automatically store them to market.json
   */
  async fetchAndStoreBidEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<NormalizedBidEvent[]> {
    console.log(
      `🔄 Fetching and storing bid events from blocks ${fromBlock} to ${toBlock}...`,
    );

    const events = await this.fetchEvents(fromBlock, toBlock);

    if (events.length > 0) {
      await this.storeBidEvents(events);
    } else {
      console.log("ℹ️  No events found to store");
    }

    return events;
  }

  /**
   * Analyze bidding patterns for a given time period
   */
  async analyzeBiddingPatterns(fromBlock: number, toBlock: number) {
    const events = await this.fetchEvents(fromBlock, toBlock);
    const stats = this.getStatistics(events);

    return {
      summary: {
        totalEvents: events.length,
        totalVolume: Array.from(stats.volumeByCurrency.values()).reduce(
          (sum, v) => sum + v.total,
          0,
        ),
        averageAmount:
          stats.volumeByCurrency.size > 0
            ? Array.from(stats.volumeByCurrency.values()).reduce(
                (sum, v) => sum + v.total,
                0,
              ) /
              Array.from(stats.volumeByCurrency.values()).reduce(
                (sum, v) => sum + v.count,
                0,
              )
            : 0,
        uniqueBidders: stats.uniqueBidders,
        timeRange: stats.dateRange,
      },
      breakdown: {
        legacy: events.filter((e) => e.implementation === "legacy").length,
        current: events.filter((e) => e.implementation === "current").length,
      },
      topBidders: this.getTopBidders(events),
      volumeByToken: this.getVolumeByToken(events),
    };
  }

  /**
   * Get top bidders by volume
   */
  private getTopBidders(events: NormalizedBidEvent[]) {
    const bidderVolume = new Map<string, bigint>();

    for (const event of events) {
      const current = bidderVolume.get(event.bidder) ?? BigInt(0);
      bidderVolume.set(event.bidder, current + BigInt(event.amount));
    }

    return Array.from(bidderVolume.entries())
      .map(([bidder, volume]) => ({ bidder, volume: volume.toString() }))
      .sort((a, b) => Number(BigInt(b.volume) - BigInt(a.volume)))
      .slice(0, 10);
  }

  /**
   * Get volume by token
   */
  private getVolumeByToken(events: NormalizedBidEvent[]) {
    const tokenVolume = new Map<string, bigint>();

    for (const event of events) {
      const current = tokenVolume.get(event.tokenId) ?? BigInt(0);
      tokenVolume.set(event.tokenId, current + BigInt(event.amount));
    }

    return Array.from(tokenVolume.entries())
      .map(([tokenId, volume]) => ({ tokenId, volume: volume.toString() }))
      .sort((a, b) => Number(BigInt(b.volume) - BigInt(a.volume)))
      .slice(0, 10);
  }

  /**
   * Find bid events for a specific token
   */
  async getBidsForToken(
    tokenId: string,
    fromBlock: number,
    toBlock: number,
  ): Promise<NormalizedBidEvent[]> {
    const allEvents = await this.fetchEvents(fromBlock, toBlock);
    return allEvents.filter((event) => event.tokenId === tokenId);
  }

  /**
   * Find bid events from a specific bidder
   */
  async getBidsFromBidder(
    bidderAddress: string,
    fromBlock: number,
    toBlock: number,
  ): Promise<NormalizedBidEvent[]> {
    const allEvents = await this.fetchEvents(fromBlock, toBlock);
    return allEvents.filter(
      (event) => event.bidder.toLowerCase() === bidderAddress.toLowerCase(),
    );
  }
}

// Export the aggregator class for direct use
export {
  BidCreatedAggregator,
  type NormalizedBidEvent,
} from "../scripts/production-bid-aggregator.js";

// Create a default service instance
export const bidEventService = new BidEventService();

/**
 * Utility functions for common bid event operations
 */
export const BidEventUtils = {
  /**
   * Convert wei amount to ETH string (legacy function - use amountFormatted instead)
   * @deprecated Use event.amountFormatted and event.currencySymbol instead
   */
  weiToEth: (weiAmount: string): string => {
    const wei = BigInt(weiAmount);
    const eth = wei / BigInt(1e18);
    const remainder = wei % BigInt(1e18);
    return (
      eth.toString() +
      "." +
      (remainder / BigInt(1e12)).toString().padStart(6, "0")
    );
  },

  /**
   * Format amount with proper currency symbol
   */
  formatAmount: (event: NormalizedBidEvent): string => {
    return `${event.amountFormatted} ${event.currencySymbol}`;
  },

  /**
   * Get total volume by currency from a set of events
   */
  getVolumeByCurrency: (
    events: NormalizedBidEvent[],
  ): Record<string, { total: string; count: number }> => {
    const volumes: Record<string, { total: bigint; count: number }> = {};

    for (const event of events) {
      const symbol = event.currencySymbol;
      volumes[symbol] ??= { total: BigInt(0), count: 0 };
      volumes[symbol].total += BigInt(event.amount);
      volumes[symbol].count += 1;
    }

    // Convert to formatted amounts
    const result: Record<string, { total: string; count: number }> = {};
    for (const [symbol, data] of Object.entries(volumes)) {
      // Find the first event with this currency to get decimals
      const sampleEvent = events.find((e) => e.currencySymbol === symbol);
      const decimals = sampleEvent?.currencyDecimals ?? 18;

      const divisor = BigInt(10 ** decimals);
      const wholePart = data.total / divisor;
      const fractionalPart = data.total % divisor;
      const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
      const trimmedFractional = fractionalStr.replace(/0+$/, "") || "0";
      const formatted =
        trimmedFractional === "0"
          ? wholePart.toString()
          : `${wholePart.toString()}.${trimmedFractional}`;

      result[symbol] = {
        total: formatted,
        count: data.count,
      };
    }

    return result;
  },

  /**
   * Format timestamp for display
   */
  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Check if address is ETH (zero address)
   */
  isETH: (currencyAddress: string): boolean => {
    return currencyAddress === "0x0000000000000000000000000000000000000000";
  },

  /**
   * Generate a summary report of bid events with proper currency handling
   */
  generateReport: (events: NormalizedBidEvent[]): string => {
    if (events.length === 0) return "No bid events found.";

    const stats = new BidCreatedAggregator().getEventStatistics(events);
    const volumeByCurrency = BidEventUtils.getVolumeByCurrency(events);

    let volumeText = "• Volume by Currency:\n";
    for (const [symbol, data] of Object.entries(volumeByCurrency)) {
      volumeText += `    - ${data.total} ${symbol} (${data.count} bids)\n`;
    }

    return `
📊 Bid Events Report
==================
• Total Events: ${stats.total}
${volumeText}• Unique Bidders: ${
      typeof stats.uniqueBidders === "number"
        ? stats.uniqueBidders
        : stats.uniqueBidders &&
            typeof stats.uniqueBidders === "object" &&
            "size" in stats.uniqueBidders
          ? (stats.uniqueBidders as Set<string>).size
          : 0
    }
• Unique Currencies: ${
      typeof stats.currencies === "number"
        ? stats.currencies
        : stats.currencies &&
            typeof stats.currencies === "object" &&
            "size" in stats.currencies
          ? (stats.currencies as Set<string>).size
          : 0
    }
• Date Range: ${BidEventUtils.formatTimestamp(stats.dateRange.earliest)} to ${BidEventUtils.formatTimestamp(stats.dateRange.latest)}
• Implementation Mix: ${stats.legacy} legacy, ${stats.current} current
    `.trim();
  },
};
