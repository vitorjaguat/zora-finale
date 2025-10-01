import NFTPreviewMedia from "./NFTPreviewMedia";
import { AddressDisplay } from "./AddressDisplay";
import { useNFTMetadata } from "@/hooks/useNFTMetadata";

interface NFTPreviewProps {
  id: string;
  contract: string;
  className?: string;
}

export function NFTPreview({ id, contract, className = "" }: NFTPreviewProps) {
  const { nftData, loading, error } = useNFTMetadata({
    contractAddress: contract,
    tokenId: id,
  });

  // if (nftData?.tokenId == "315" || nftData?.tokenId == "32")
  //   console.dir(nftData);
  // // console.dir(nftData);

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
      ) : error ? (
        <div className="flex justify-center p-4">
          <span className="text-red-400">Error: {error}</span>
        </div>
      ) : (
        <div className="flex flex-col justify-end gap-2 pr-3 pb-3 text-xs">
          {(nftData?.metadataUri?.title ?? nftData?.name) && (
            <div className="font-semibold text-neutral-200">
              {nftData?.metadataUri?.title ?? nftData?.name}
            </div>
          )}
          {(nftData?.metadataUri?.description ?? nftData?.description) && (
            <div className="text-neutral-400">
              {nftData?.metadataUri?.description ?? nftData?.description}
            </div>
          )}
          <div className="text-neutral-400">Token ID: {nftData?.tokenId}</div>
          <div className="text-neutral-400">
            Token Contract:{" "}
            <AddressDisplay
              className="inline items-end! text-xs"
              address={nftData?.contract.address ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
