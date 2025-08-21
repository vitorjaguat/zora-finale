"use client";

import { useState, useEffect } from "react";

interface EthPriceData {
  usd: number;
  loading: boolean;
  error: string | null;
}

interface EthPriceResponse {
  ethusd: string;
}

export function useEthPrice(): EthPriceData {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);

        // Using Etherscan API to get ETH price
        const response = await fetch("/api/eth-price");

        if (!response.ok) {
          throw new Error("Failed to fetch ETH price");
        }

        const data = (await response.json()) as EthPriceResponse;
        setPrice(parseFloat(data.ethusd));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void fetchPrice();

    // Commented out Update: price is now fetched just once
    // Update price every 60 seconds (Etherscan has rate limits)
    // const interval = setInterval(() => {
    //   void fetchPrice();
    // }, 60000);

    // return () => clearInterval(interval);
  }, []);

  return { usd: price, loading, error };
}
