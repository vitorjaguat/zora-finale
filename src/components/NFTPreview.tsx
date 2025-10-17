import NFTPreviewMedia from "./NFTPreviewMedia";
import { AddressDisplay } from "./AddressDisplay";
import {
  useNFTMetadata,
  type AlchemyNFTResponse,
} from "@/hooks/useNFTMetadata";

interface NFTPreviewProps {
  id: string;
  contract: string;
  className?: string;
  tokenData: AlchemyNFTResponse;
}

export function NFTPreview({
  id,
  contract,
  tokenData,
  className = "",
}: NFTPreviewProps) {
  const { nftData, loading, error } = useNFTMetadata({
    contractAddress: contract,
    tokenId: id,
    tokenData,
  });

  // if (nftData?.tokenId == "315" || nftData?.tokenId == "32")
  //   console.dir(nftData);
  // console.dir(nftData);

  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  const nftTitle =
    nftData?.metadataUri?.title ||
    nftData?.metadataUri?.name ||
    nftData?.name ||
    false;
  /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

  return (
    <div className="flex gap-3 max-sm:gap-2 bg-white/5 max-sm:flex-col max-sm:items-center">
      <NFTPreviewMedia
        nftData={nftData}
        id={id}
        loading={loading}
        className={
          className + " max-sm:w-full max-sm:aspect-square max-sm:flex-1"
        }
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
        <div className="flex flex-col justify-end gap-2 pt-3 pr-3 pb-3 text-xs max-sm:px-2 max-sm:w-full overflow-hidden">
          {nftTitle && (
            <div className="font-semibold text-neutral-200">
              {nftTitle as React.ReactNode}
            </div>
          )}
          {(nftData?.metadataUri?.description ?? nftData?.description) && (
            <div className="text-neutral-400 whitespace-pre-line break-words overflow-hidden">
              {nftData?.metadataUri?.description ?? nftData?.description}
            </div>
          )}
          <div className="text-neutral-400">Token ID: {nftData?.tokenId}</div>
          <div className="text-neutral-400 ">
            Token Contract:{" "}
            <AddressDisplay
              className="inline items-end! text-xs"
              address={nftData?.contract?.address ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
