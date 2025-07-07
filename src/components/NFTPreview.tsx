import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import NFTPreviewMedia from "./NFTPreviewMedia";
import { AddressDisplay } from "./AddressDisplay";

interface NFTPreviewProps {
  id: string;
  contract: string;
  className?: string;
}

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

export function NFTPreview({ id, contract, className = "" }: NFTPreviewProps) {
  const [nftData, setNftData] = useState<AlchemyNFTResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.dir(nftData, {
      depth: null,
      colors: true,
    });
  });

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
        if (!apiKey) {
          console.error("Alchemy API key not found");
          setLoading(false);
          return;
        }

        const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadata`;
        const params = new URLSearchParams({
          contractAddress: contract,
          tokenId: id,
          refreshCache: "false",
        });

        const response = await fetch(`${url}?${params}`, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Alchemy API error: ${response.status} ${response.statusText}`,
          );
        }

        const data: AlchemyNFTResponse = await response.json();
        setNftData(data);
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTMetadata();
  }, [id, contract]);

  return (
    <div className="flex gap-3 bg-white/5">
      <NFTPreviewMedia
        nftData={nftData}
        id={id}
        loading={loading}
        className={className}
      />

      {loading ? (
        <div className="flex justify-center p-4">
          <span className="text-neutral-400">Loading NFT data...</span>
        </div>
      ) : (
        <div className="flex flex-col justify-end gap-2 pr-3 pb-3 text-xs">
          {nftData?.name && (
            <div className="font-semibold text-neutral-200">
              {nftData?.name}
            </div>
          )}
          {nftData?.description && (
            <div className="text-neutral-400">{nftData?.description}</div>
          )}
          <div className="text-neutral-400">Token ID: {nftData?.tokenId}</div>
          <div className="text-neutral-400">
            Token Contract:{" "}
            <AddressDisplay
              className="inline items-end! text-xs"
              address={nftData?.contract.address!}
            />
          </div>
        </div>
      )}
    </div>
  );
}
