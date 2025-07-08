import { useState, useEffect } from "react";
// import type { AlchemyNFTResponse } from "@/components/NFTPreview";

export interface AlchemyNFTResponse {
  contract: {
    address: string;
  };
  tokenId: string;
  tokenType: string;
  name?: string;
  description?: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    contentType?: string;
    size?: number;
    originalUrl?: string;
  };
  raw?: {
    metadata?: {
      image?: string;
      animation_url?: string;
    };
  };
  tokenUri?: {
    gateway?: string;
    raw?: string;
  };
  media?: Array<{
    gateway?: string;
    thumbnail?: string;
    raw?: string;
    format?: string;
    bytes?: number;
  }>;
}

interface UseNFTMetadataProps {
  contractAddress: string;
  tokenId: string;
}

export function useNFTMetadata({
  contractAddress,
  tokenId,
}: UseNFTMetadataProps) {
  const [nftData, setNftData] = useState<AlchemyNFTResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/nft/metadata?contractAddress=${encodeURIComponent(contractAddress)}&tokenId=${encodeURIComponent(tokenId)}`,
        );

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }

        const rawData: unknown = await response.json();

        if (rawData && typeof rawData === "object" && rawData !== null) {
          const data = rawData as AlchemyNFTResponse;
          setNftData(data);
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch NFT metadata";
        console.error("Error fetching NFT metadata:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchNFTMetadata();
  }, [contractAddress, tokenId]);

  return { nftData, loading, error };
}
