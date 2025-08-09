/**
 * Zora Marketplace BidFinalized Event Integration
 *
 * This module provides utilities for integrating the BidFinalized event aggregator
 * with the main application and database.
 */

import {
  BidFinalizedAggregator,
  type NormalizedBidFinalizedEvent,
} from "../scripts/production-bid-finalized-aggregator.js";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Service class for integrating bid finalized events with the application
 */
export class BidFinalizedEventService {
  private aggregator: BidFinalizedAggregator;

  constructor(contractAddress?: string, apiKey?: string) {
    this.aggregator = new BidFinalizedAggregator(contractAddress, apiKey);
  }

  /**
   * Fetch and normalize bid finalized events for a specific block range
   */
  async fetchEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<NormalizedBidFinalizedEvent[]> {
    return this.aggregator.fetchBidFinalizedEventsWithPagination(
      fromBlock,
      toBlock,
    );
  }

  /**
   * Get statistics for a set of bid finalized events
   */
  getStatistics(events: NormalizedBidFinalizedEvent[]) {
    return this.aggregator.getEventStatistics(events);
  }

  /**
   * Store bid finalized events in a JSON file for analysis
   */
  async storeBidFinalizedEvents(
    events: NormalizedBidFinalizedEvent[],
  ): Promise<void> {
    try {
      const finalizedFilePath = resolve(
        process.cwd(),
        "public/data/finalized.json",
      );

      // Read existing data if file exists
      let existingData: NormalizedBidFinalizedEvent[] = [];
      if (existsSync(finalizedFilePath)) {
        try {
          const fileContent = readFileSync(finalizedFilePath, "utf-8");
          const parsed = JSON.parse(
            fileContent,
          ) as NormalizedBidFinalizedEvent[];
          existingData = Array.isArray(parsed) ? parsed : [];
          console.log(
            `📖 Loaded ${existingData.length} existing finalized events`,
          );
        } catch {
          console.warn(
            "⚠️  Could not parse existing finalized.json, starting fresh",
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
        finalizedFilePath,
        JSON.stringify(allEvents, null, 2),
        "utf-8",
      );

      console.log(
        `📝 Stored ${newEvents.length} new finalized events to finalized.json`,
      );
      console.log(
        `📊 Total finalized events in finalized.json: ${allEvents.length}`,
      );

      // Log summary of what was stored
      if (newEvents.length > 0) {
        console.log(`💰 New finalized events by currency:`);
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
            `   • ${data.count} finalized bids totaling ${data.totalFormatted.toFixed(6)} ${symbol}`,
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error storing finalized events to finalized.json:",
        error,
      );
      throw error;
    }
  }

  /**
   * Fetch events and store them in JSON file
   */
  async fetchAndStoreBidFinalizedEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<NormalizedBidFinalizedEvent[]> {
    console.log(
      `🔄 Fetching and storing finalized events from blocks ${fromBlock} to ${toBlock}...`,
    );

    const events = await this.fetchEvents(fromBlock, toBlock);
    await this.storeBidFinalizedEvents(events);

    return events;
  }

  /**
   * Generate analytics report for finalized events
   */
  generateReport(events: NormalizedBidFinalizedEvent[]): string {
    const stats = this.getStatistics(events);

    let report = `📊 BID FINALIZED EVENTS REPORT\n`;
    report += `${"=".repeat(50)}\n\n`;

    report += `📈 Summary Statistics:\n`;
    report += `• Total Finalized Events: ${stats.total}\n`;
    report += `• Implementation Mix: ${stats.legacy} legacy, ${stats.current} current\n`;
    report += `• Unique Bidders: ${stats.uniqueBidders}\n`;
    report += `• Currencies Used: ${stats.currencies}\n\n`;

    if (stats.volumeByCurrency.size > 0) {
      report += `💰 Volume by Currency:\n`;
      for (const [currency, data] of stats.volumeByCurrency) {
        report += `• ${currency}: ${data.count} finalized bids, ${data.total.toFixed(6)} total volume\n`;
      }
      report += `\n`;
    }

    if (stats.dateRange.earliest && stats.dateRange.latest) {
      report += `📅 Date Range:\n`;
      report += `• Earliest: ${new Date(stats.dateRange.earliest).toLocaleDateString()}\n`;
      report += `• Latest: ${new Date(stats.dateRange.latest).toLocaleDateString()}\n\n`;
    }

    // Top finalized bids by value
    const sortedEvents = events
      .sort(
        (a, b) => parseFloat(b.amountFormatted) - parseFloat(a.amountFormatted),
      )
      .slice(0, 5);

    if (sortedEvents.length > 0) {
      report += `🏆 Top 5 Finalized Bids by Value:\n`;
      sortedEvents.forEach((event, i) => {
        report += `${i + 1}. Token ${event.tokenId}: ${event.amountFormatted} ${event.currencySymbol}\n`;
        report += `   Bidder: ${event.bidder.slice(0, 10)}...\n`;
        report += `   Block: ${event.blockNumber}\n\n`;
      });
    }

    return report;
  }
}
