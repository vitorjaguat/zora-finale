import { useState, useEffect } from "react";
import type { ZeraUnlockedData } from "@/app/api/zera/unlocked/route";

interface UseZeraUnlockedReturn {
  unlockedEthMarket: number;
  unlockedEthAuctionHouse: number;
  unlockedNFTs: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZeraUnlocked(): UseZeraUnlockedReturn {
  const [data, setData] = useState<ZeraUnlockedData>({
    unlockedEthMarket: 0,
    unlockedEthAuctionHouse: 0,
    unlockedNFTs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/zera/unlocked");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as ZeraUnlockedData;
      setData(result);

      // Console log the data for debugging
      console.log("🔓 Zera Unlocked Assets Data:", result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching Zera unlocked data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return {
    unlockedEthMarket: data.unlockedEthMarket,
    unlockedEthAuctionHouse: data.unlockedEthAuctionHouse,
    unlockedNFTs: data.unlockedNFTs,
    loading,
    error,
    refetch: () => void fetchData(),
  };
}
