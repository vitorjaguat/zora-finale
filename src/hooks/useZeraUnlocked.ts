import { useState, useEffect } from "react";
import type { ZeraUnlockedData } from "@/app/api/zera/unlocked/route";

interface UseZeraUnlockedReturn {
  data: ZeraUnlockedData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZeraUnlocked(): UseZeraUnlockedReturn {
  const [data, setData] = useState<ZeraUnlockedData>({
    market: {
      reclaimedBids: 0,
      reclaimedWETH: 0,
      reclaimedDAI: 0,
      reclaimedUSDC: 0,
    },
    auctionHouse: {
      settledAuctions: 0,
      reclaimedWETH: 0,
    },
    nfts: {
      reclaimed: 0,
      uniqueOwners: 0,
    },
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
      // console.log("🔓 Zera Unlocked Assets Data:", result);
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
    data,
    loading,
    error,
    refetch: () => void fetchData(),
  };
}
