import Link from "next/link";
import { useState } from "react";
import { useEthPrice } from "@/hooks/useEthPrice";
import { useZeraUnlocked } from "@/hooks/useZeraUnlocked";

export default function ThePlanGraphic() {
  const { usd: ethPrice, loading, error } = useEthPrice();
  const zeraData = useZeraUnlocked();
  const [hoveredCircle, setHoveredCircle] = useState<string | null>(null);

  const ethAmountMarket = 144.04976775;
  const daiAmountMarket = 17_942.16;
  const usdcAmountMarket = 8_554.59;
  const usdValueMarket =
    ethPrice * ethAmountMarket + daiAmountMarket + usdcAmountMarket;
  const ethAmountAuctionHouse = 13.52559704;
  const usdValueAuctionHouse = ethAmountAuctionHouse * ethPrice;
  const totalNFTs = 3061;

  // Detailed data for flip sides (using real data from the API)
  //   const detailedData = {
  //     market: {
  //       reclaimedBids: zeraData.data.market.reclaimedBids,
  //       reclaimedWETH: zeraData.data.market.reclaimedWETH.toFixed(4),
  //       reclaimedDAI: zeraData.data.market.reclaimedDAI.toFixed(4),
  //       reclaimedUSDC: zeraData.data.market.reclaimedUSDC.toFixed(4),
  //     },
  //     auctionHouse: {
  //       settledAuctions: zeraData.data.auctionHouse.settledAuctions,
  //       reclaimedWETH: zeraData.data.auctionHouse.reclaimedWETH.toFixed(4),
  //     },
  //     nfts: {
  //       reclaimed: zeraData.data.nfts.reclaimed,
  //       uniqueOwners: zeraData.data.nfts.uniqueOwners,
  //       rareItems: "12 rare", // placeholder
  //       avgValue: 2.3, // placeholder
  //     },
  //   };

  //   const zeraData = {
  //     unlockedEthMarket: 30,
  //     unlockedEthAuctionHouse: 5,
  //     unlockedNFTs: 20,
  //   };

  // Calculate percentages for progress rings
  const marketUnlockedPercentage = zeraData.loading
    ? 0
    : (zeraData.data.market.reclaimedWETH / ethAmountMarket) * 100;
  const auctionUnlockedPercentage = zeraData.loading
    ? 0
    : (zeraData.data.auctionHouse.reclaimedWETH / ethAmountAuctionHouse) * 100;
  const nftUnlockedPercentage = zeraData.loading
    ? 0
    : (zeraData.data.nfts.reclaimed / totalNFTs) * 100;

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
      <div className="flex justify-evenly gap-6">
        {/* Market contract */}
        <div
          className="perspective-1000 relative h-72 w-72 flex-shrink-0"
          onMouseEnter={() => setHoveredCircle("market")}
          onMouseLeave={() => setHoveredCircle(null)}
          style={{ perspective: "1000px" }}
        >
          {/* Fixed contract link */}
          <Link
            href="https://etherscan.io/address/0xE5BFAB544ecA83849c53464F85B7164375Bdaac1"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 bottom-4 z-10 font-light tracking-wider text-neutral-400"
          >
            Zora: Market
          </Link>

          <div
            className={`relative h-full w-full transition-transform duration-700 ease-in-out ${hoveredCircle === "market" || hoveredCircle === "all" ? "rotate-y-180" : ""} `}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front side (original content) */}
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
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
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-center text-xl font-bold">
                    758 UNSETTLED BIDS
                  </div>
                  {/* <div className="-translate-y-1 font-light">
                    {ethAmountMarket} ETH
                  </div> */}

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

            {/* Back side (detailed reclaimed data) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-green-400 bg-green-900/20 p-6">
                <div className="space-y-3 text-center">
                  <h3 className="text-lg font-bold text-green-400">
                    Settled Bids
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-200">
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.market.reclaimedBids}
                      </span>
                      <span className="ml-1.5">/ 758 bids settled</span>
                    </div>
                    <div className="flex justify-center text-center">
                      <span className="text-green-400">
                        {zeraData.data.market.reclaimedWETH}
                      </span>
                      <span className="ml-1.5">/ 144.0497 WETH reclaimed</span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.market.reclaimedDAI}
                      </span>
                      <span className="ml-1.5">
                        / {daiAmountMarket} DAI reclaimed
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.market.reclaimedUSDC}
                      </span>
                      <span className="ml-1.5">
                        / {usdcAmountMarket} USDC reclaimed
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-neutral-400">Last Activity:</span>
                      <span>{zeraData.data.market.lastActivity}</span>
                    </div> */}
                    <div className="mt-6">since 10.22.2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auction contract */}
        <div
          className="perspective-1000 relative h-72 w-72 flex-shrink-0"
          onMouseEnter={() => setHoveredCircle("auction")}
          onMouseLeave={() => setHoveredCircle(null)}
          style={{ perspective: "1000px" }}
        >
          {/* Fixed contract link */}
          <Link
            href="https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -right-4 bottom-4 z-10 font-light tracking-wider text-neutral-400"
          >
            Zora: Auction House
          </Link>

          <div
            className={`relative h-full w-full transition-transform duration-700 ease-in-out ${hoveredCircle === "auction" || hoveredCircle === "all" ? "rotate-y-180" : ""} `}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front side (original content) */}
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
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
                  strokeDasharray={getStrokeDasharray(
                    auctionUnlockedPercentage,
                  )}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inner circle content */}
              <div className="relative flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900/30 p-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-center text-xl font-bold">
                    158 UNSETTLED AUCTIONS
                  </div>
                  {/* <div className="-translate-y-1 font-light">
                    {ethAmountAuctionHouse} ETH
                  </div> */}
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

            {/* Back side (detailed reclaimed data) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-green-400 bg-green-900/20 p-6">
                <div className="space-y-3 text-center">
                  <h3 className="text-lg font-bold text-green-400">
                    Settled Auctions
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-200">
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.auctionHouse.settledAuctions}
                      </span>
                      <span className="ml-1.5">/ 158 auctions settled</span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.auctionHouse.reclaimedWETH}
                      </span>
                      <span className="ml-1.5">
                        / {ethAmountAuctionHouse} WETH reclaimed
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-neutral-400">Avg Time:</span>
                      <span>{zeraData.data.auction.avgTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Top Bid:</span>
                      <span className="text-green-400">
                        {zeraData.data.auction.topBid}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Success Rate:</span>
                      <span className="text-green-400">
                        {zeraData.data.auction.successRate}
                      </span>
                    </div> */}
                    <div className="mt-6">since 10.22.2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second row - 1 item centered */}
      <div className="flex flex-col items-center justify-center gap-6">
        {/* NFTs locked */}
        <div
          className="perspective-1000 relative h-72 w-72 flex-shrink-0"
          onMouseEnter={() => setHoveredCircle("nfts")}
          onMouseLeave={() => setHoveredCircle(null)}
          style={{ perspective: "1000px" }}
        >
          {/* Fixed contract link */}
          <Link
            href="https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673#asset-nfts"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -right-4 bottom-4 z-10 font-light tracking-wider text-neutral-400"
          >
            Escrowed NFTs
          </Link>

          <div
            className={`relative h-full w-full transition-transform duration-700 ease-in-out ${hoveredCircle === "nfts" || hoveredCircle === "all" ? "rotate-y-180" : ""} `}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front side (original content) */}
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
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
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-xl font-bold">
                    {totalNFTs} ESCROWED NFTs
                  </div>
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

            {/* Back side (detailed reclaimed data) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-green-400 bg-green-900/20 p-6">
                <div className="space-y-3 text-center">
                  <h3 className="text-lg font-bold text-green-400">
                    NFTs Reclaimed
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-200">
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.nfts.reclaimed}
                      </span>
                      <span className="ml-1.5">/ 3061 NFTs reclaimed</span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-green-400">
                        {zeraData.data.nfts.uniqueOwners}
                      </span>
                      <span className="ml-1.5">/ 2165 unique creators</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-neutral-400">Rare Items:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Collections:</span>
                      <span className="text-green-400">
                        {zeraData.data.nfts.collections}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Avg Value:</span>
                      <span>0.5 WETH</span>
                    </div> */}
                    <div className="mt-6">since 10.22.2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAPTION */}
      <div
        onMouseEnter={() => setHoveredCircle("all")}
        onMouseLeave={() => setHoveredCircle(null)}
        className="mt-6 flex cursor-help items-center gap-4"
      >
        <div className="h-[2px] w-8 bg-green-400"> </div>
        <div className="text-sm text-neutral-300">
          <div className="">Assets already reclaimed on ZERA</div>
          <div>(since 10.22.2025)</div>
        </div>
      </div>
    </div>
  );
}
