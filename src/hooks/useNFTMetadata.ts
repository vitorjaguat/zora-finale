import { useState, useEffect } from "react";
// import type { AlchemyNFTResponse } from "@/components/NFTPreview";
import type { Nft } from "alchemy-sdk";
import { MEDIA_CONTRACT } from "@/config/contract";
import type { TokenMetadataUri } from "@/app/api/nft/metadata/route";

export interface AlchemyNFTResponse extends Nft {
  metadataUri?: TokenMetadataUri;
}

// export interface AlchemyNFTResponse {
//   contract: {
//     address: string;
//   };
//   tokenId: string;
//   tokenType: string;
//   name?: string;
//   description?: string;
//   image?: {
//     cachedUrl?: string;
//     thumbnailUrl?: string;
//     pngUrl?: string;
//     contentType?: string;
//     size?: number;
//     originalUrl?: string;
//   };
//   raw?: {
//     metadata?: {
//       image?: string;
//       animation_url?: string;
//     };
//   };
//   tokenUri?: {
//     gateway?: string;
//     raw?: string;
//   };
//   media?: Array<{
//     gateway?: string;
//     thumbnail?: string;
//     raw?: string;
//     format?: string;
//     bytes?: number;
//   }>;
// }

interface UseNFTMetadataProps {
  contractAddress: string;
  tokenId: string;
  tokenData: AlchemyNFTResponse;
}

export function useNFTMetadata({
  contractAddress,
  tokenId,
  tokenData,
}: UseNFTMetadataProps) {
  const [nftData, setNftData] = useState<AlchemyNFTResponse | null>(tokenData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNftData(tokenData);
  }, [tokenData]);

  // useEffect(() => {
  //   if (tokenId === "2142") console.dir(nftData);
  // }, [nftData]);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      if (contractAddress !== MEDIA_CONTRACT.address) {
        setLoading(false);
        return;
      } else {
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
            const data = {
              ...tokenData,
              metadataUri: { ...(rawData as TokenMetadataUri) },
            };
            if (!data.metadataUri.description) {
              const bodyData = rawData as {
                body?: { artist?: string; title?: string; notes?: string };
              };
              if (bodyData?.body?.artist) {
                data.metadataUri.description = "By " + bodyData.body.artist;
              }
              if (bodyData?.body?.title) {
                data.metadataUri.title = bodyData.body.title;
                data.name = bodyData.body.title;
              }
              if (bodyData?.body?.notes) {
                data.metadataUri.description =
                  data.metadataUri.description + "\n" + bodyData.body.notes;
              }
            }
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
      }
    };

    void fetchNFTMetadata();
  }, [contractAddress, tokenId, tokenData]);

  return { nftData, loading, error };
}
