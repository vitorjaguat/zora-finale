import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Nft } from "alchemy-sdk";

interface TokenRequest {
  contractAddress: string;
  tokenId: string;
}

interface BatchResult {
  contractAddress: string;
  tokenId: string;
  metadata: Nft | null;
  success: boolean;
  error?: string;
}

interface BatchResponse {
  results: BatchResult[];
  total: number;
  successful: number;
}

interface UseNFTMetadataBatchProps {
  tokens: TokenRequest[];
  enabled?: boolean; // Allow conditional fetching
}

interface UseNFTMetadataBatchReturn {
  metadataMap: Map<string, Nft>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getMetadata: (contractAddress: string, tokenId: string) => Nft | null;
}

// Helper function to create a unique key for a token
const createTokenKey = (contractAddress: string, tokenId: string): string => {
  return `${contractAddress.toLowerCase()}-${tokenId}`;
};

export function useNFTMetadataBatch({
  tokens,
  enabled = true,
}: UseNFTMetadataBatchProps): UseNFTMetadataBatchReturn {
  const [metadataMap, setMetadataMap] = useState<Map<string, Nft>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track the last fetched tokens to prevent infinite loops
  const lastFetchedTokensRef = useRef<string>("");

  // Create a stable reference for tokens by stringifying them
  const tokensKey = useMemo(() => {
    if (!enabled || tokens.length === 0) return "";
    return JSON.stringify(
      tokens
        .map((t) => `${t.contractAddress.toLowerCase()}-${t.tokenId}`)
        .sort(),
    );
  }, [tokens, enabled]);

  const fetchBatchMetadata = useCallback(async () => {
    if (
      !enabled ||
      tokens.length === 0 ||
      tokensKey === lastFetchedTokensRef.current
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Update the ref to prevent refetching the same tokens
      lastFetchedTokensRef.current = tokensKey;

      // Split tokens into chunks of 100 (Alchemy's batch limit)
      const chunks: TokenRequest[][] = [];
      for (let i = 0; i < tokens.length; i += 100) {
        chunks.push(tokens.slice(i, i + 100));
      }

      const allResults: BatchResult[] = [];

      // Process each chunk
      for (const chunk of chunks) {
        const response = await fetch("/api/nft/metadata/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tokens: chunk }),
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }

        const batchResponse: BatchResponse =
          (await response.json()) as BatchResponse;
        allResults.push(...batchResponse.results);
      }

      // Create a new map with all results
      const newMetadataMap = new Map<string, Nft>();
      for (const result of allResults) {
        if (result.success && result.metadata) {
          const key = createTokenKey(result.contractAddress, result.tokenId);
          newMetadataMap.set(key, result.metadata);
        }
      }

      setMetadataMap(newMetadataMap);

      // Log batch results
      const successful = allResults.filter((r) => r.success).length;
      console.log(
        `Batch NFT metadata fetch completed: ${successful}/${allResults.length} successful`,
      );
    } catch (err) {
      // Reset the ref on error to allow retry
      lastFetchedTokensRef.current = "";
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch batch NFT metadata";
      console.error("Error fetching batch NFT metadata:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [enabled, tokens, tokensKey]);

  useEffect(() => {
    if (tokensKey && tokensKey !== lastFetchedTokensRef.current) {
      void fetchBatchMetadata();
    }
  }, [tokensKey, fetchBatchMetadata]);

  // Helper function to get metadata for a specific token
  const getMetadata = useCallback(
    (contractAddress: string, tokenId: string): Nft | null => {
      const key = createTokenKey(contractAddress, tokenId);
      return metadataMap.get(key) ?? null;
    },
    [metadataMap],
  );

  const refetch = useCallback(() => {
    lastFetchedTokensRef.current = "";
    void fetchBatchMetadata();
  }, [fetchBatchMetadata]);

  return {
    metadataMap,
    loading,
    error,
    refetch,
    getMetadata,
  };
}

// Hook for getting metadata for all tokens from bids and auctions
export function useNFTMetadataForResults(
  bids: Array<{ tokenContract: string; tokenId: string }> = [],
  auctions: Array<{ tokenContract: string; tokenId: string }> = [],
  enabled = true,
) {
  // Combine bids and auctions into a single tokens array, removing duplicates
  const tokens: TokenRequest[] = useMemo(() => {
    const tokensArray: TokenRequest[] = [];
    const seen = new Set<string>();

    // Add bid tokens
    for (const bid of bids) {
      const key = createTokenKey(bid.tokenContract, bid.tokenId);
      if (!seen.has(key)) {
        seen.add(key);
        tokensArray.push({
          contractAddress: bid.tokenContract,
          tokenId: bid.tokenId,
        });
      }
    }

    // Add auction tokens
    for (const auction of auctions) {
      const key = createTokenKey(auction.tokenContract, auction.tokenId);
      if (!seen.has(key)) {
        seen.add(key);
        tokensArray.push({
          contractAddress: auction.tokenContract,
          tokenId: auction.tokenId,
        });
      }
    }

    return tokensArray;
  }, [bids, auctions]);

  return useNFTMetadataBatch({ tokens, enabled });
}
