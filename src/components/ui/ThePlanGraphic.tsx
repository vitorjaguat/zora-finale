import Link from "next/link";
import { useEthPrice } from "@/hooks/useEthPrice";
import { useZeraUnlocked } from "@/hooks/useZeraUnlocked";

export default function ThePlanGraphic() {
  const { usd: ethPrice, loading, error } = useEthPrice();
  const zeraData = useZeraUnlocked();
  const ethAmountMarket = 144.04976775;
  const usdValueMarket = ethPrice * ethAmountMarket;
  const ethAmountAuctionHouse = 13.52559704;
  const usdValueAuctionHouse = ethAmountAuctionHouse * ethPrice;
  const totalNFTs = 3061;

  //   const zeraData = {
  //     unlockedEthMarket: 30,
  //     unlockedEthAuctionHouse: 5,
  //     unlockedNFTs: 20,
  //   };

  // Calculate percentages for progress rings
  const marketUnlockedPercentage = zeraData.loading
    ? 0
    : (zeraData.unlockedEthMarket / ethAmountMarket) * 100;
  const auctionUnlockedPercentage = zeraData.loading
    ? 0
    : (zeraData.unlockedEthAuctionHouse / ethAmountAuctionHouse) * 100;
  const nftUnlockedPercentage = zeraData.loading
    ? 0
    : (zeraData.unlockedNFTs / totalNFTs) * 100;

  // SVG circle properties for progress rings
  const radius = 150; // Slightly larger than the circle (144px each = 288px diameter, so radius ~144)
  const circumference = 2 * Math.PI * radius;

  const getStrokeDasharray = (percentage: number) => {
    const progress = Math.min(Math.max(percentage, 0), 100);
    const dashLength = (progress / 100) * circumference;
    return `${dashLength} ${circumference}`;
  };

  return (
    <div className="mt-11 flex flex-col items-center gap-0">
      {/* First row - 2 items */}
      <div className="flex w-full justify-center gap-6">
        {/* Market contract */}
        <div className="relative flex h-72 w-72 flex-col items-center justify-center">
          {/* Progress ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 320 320"
          >
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgb(64 64 64)" // neutral-700
              strokeWidth="3"
              className="opacity-30"
            />
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgb(74 222 128)" // green-400
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={getStrokeDasharray(marketUnlockedPercentage)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Inner circle content */}
          <div className="relative flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900/30 p-6">
            <Link
              href="https://etherscan.io/address/0xE5BFAB544ecA83849c53464F85B7164375Bdaac1"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-0 bottom-4 font-light tracking-wider text-neutral-400"
            >
              Zora: Market
            </Link>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-xl font-bold">{ethAmountMarket} ETH</div>
              <div className="-translate-y-1 font-light">
                758 UNSETTLED BIDS
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="mb-1 h-6 w-48 rounded bg-neutral-700"></div>
                  <div className="h-4 w-32 rounded bg-neutral-700"></div>
                </div>
              ) : error ? (
                <div className="text-sm">Unable to load USD value</div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-red-500">
                    ≈ $
                    {usdValueMarket.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </div>
                  <div className="text-xs text-neutral-500">
                    ETH: $
                    {ethPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </div>
                </div>
              )}
              {!zeraData.loading && (
                <div className="mt-1 text-xs text-green-400">
                  {marketUnlockedPercentage.toFixed(1)}% reclaimed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auction contract */}
        <div className="relative flex h-72 w-72 flex-col items-center justify-center">
          {/* Progress ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 320 320"
          >
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgb(64 64 64)" // neutral-700
              strokeWidth="3"
              className="opacity-30"
            />
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgb(74 222 128)" // green-400
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={getStrokeDasharray(auctionUnlockedPercentage)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Inner circle content */}
          <div className="relative flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900/30 p-6">
            <Link
              href="https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -right-4 bottom-4 font-light tracking-wider text-neutral-400"
            >
              Zora: Auction House
            </Link>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-xl font-bold">
                {ethAmountAuctionHouse} ETH
              </div>
              <div className="-translate-y-1 font-light">
                158 UNSETTLED AUCTIONS
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="mb-1 h-6 w-48 rounded bg-neutral-700"></div>
                  <div className="h-4 w-32 rounded bg-neutral-700"></div>
                </div>
              ) : error ? (
                <div className="text-sm">Unable to load USD value</div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-red-500">
                    ≈ $
                    {usdValueAuctionHouse.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </div>
                  <div className="text-xs text-neutral-500">
                    ETH: $
                    {ethPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </div>
                </div>
              )}
              {!zeraData.loading && (
                <div className="mt-1 text-xs text-green-400">
                  {auctionUnlockedPercentage.toFixed(1)}% reclaimed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second row - 1 item centered */}
      <div className="flex flex-col items-center justify-center gap-6">
        {/* NFTs locked */}
        <div className="relative flex h-72 w-72 flex-col items-center justify-center">
          {/* Progress ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 320 320"
          >
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgb(64 64 64)" // neutral-700
              strokeWidth="3"
              className="opacity-30"
            />
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgb(74 222 128)" // green-400
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={getStrokeDasharray(nftUnlockedPercentage)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Inner circle content */}
          <div className="relative flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900/30 p-6">
            <Link
              href="https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -right-4 bottom-4 font-light tracking-wider text-neutral-400"
            >
              Zora: Auction House
            </Link>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-xl font-bold">{totalNFTs} ESCROWED NFTs</div>
              <div className="-translate-y-1 font-light">
                FROM 2165 CREATORS
              </div>
              {!zeraData.loading && (
                <div className="mt-1 text-xs text-green-400">
                  {nftUnlockedPercentage.toFixed(1)}% reclaimed
                </div>
              )}
            </div>
          </div>
        </div>
        {/* CAPTION */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-8 bg-green-400"> </div>
          <div className="text-sm text-neutral-300">
            Assets already reclaimed on ZERA (since 10.22.2025)
          </div>
        </div>
      </div>
    </div>
  );
}
