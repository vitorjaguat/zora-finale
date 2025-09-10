"use client";

import { useEthPrice } from "@/hooks/useEthPrice";
import Link from "next/link";

export default function ThePlan() {
  const { usd: ethPrice, loading, error } = useEthPrice();
  const ethAmountMarket = 144.04976775;
  const usdValueMarket = ethPrice * ethAmountMarket;
  const ethAmountAuctionHouse = 13.52559704;
  const usdValueAuctionHouse = ethAmountAuctionHouse * ethPrice;

  return (
    <div
      id="the-plan"
      className="mt-0 flex max-w-1/2 flex-col gap-6 px-6 pt-32 text-neutral-200"
    >
      {/* Intro text */}
      <div className="text-2xl">The Plan</div>
      <div className="font-light">
        Web3 doesn’t stand still: it evolves, it mutates, it leaves fossils
        behind. Nonetheless, blockchains are immutable record-stating memory
        machines.{" "}
      </div>
      <div className="font-light">
        Zora emerged on the New Year’s Eve of 2020 as a new place for collective
        value capture on the Internet. Beyond just another media platform, it
        became one of the great places for NFT creation and circulation. The
        tide was high:{" "}
        <Link
          className="underline"
          href="https://x.com/search?q=zora%20invite%20until%3A2021-02-28%20since%3A2020-12-31&src=typed_query&f=live"
          target="_blank"
          rel="noopener noreferrer"
        >
          people begging for invites
        </Link>
        ,{" "}
        <Link
          className="underline"
          href="https://etherscan.io/tx/0xc7baf98ff04caf0b59b340062704cda7c61daedae7dea182d05ba1842d9a647f"
          target="_blank"
          rel="noopener noreferrer"
        >
          5-figure sales
        </Link>
        . Some tokens from this (now clearly) mania phase even crossed the
        trad-art border into{" "}
        <Link
          className="underline"
          href="https://onlineonly.christies.com/s/andy-warhol-machine-made/andy-warhol-1928-1987-1/117669"
          target="_blank"
          rel="noopener noreferrer"
        >
          Christie’s
        </Link>{" "}
        and{" "}
        <Link
          className="underline"
          href="https://www.sothebys.com/en/buy/auction/2021/natively-digital-a-curated-nft-sale-2/self-portrait-2?locale=zh-Hans"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sotheby’s
        </Link>{" "}
        sales.{" "}
      </div>
      <div className="font-light">
        But evolution is relentless. As Zora shifted its orbit - now focused on
        <span className="ml-1 line-through decoration-2">shitcoins</span>
        <span className="ml-1 line-through decoration-2">memecoins</span>
        <span className="mx-1 line-through decoration-2">contentcoins</span>
        creatorcoins - the contracts that once carried this golden age were
        abandoned, their UI. Bags of WETH from past bids - and lots of NFTs -
        are currently escrowed inside those contracts. A buried layer of WETH
        and NFTs, sealed inside fossilized smart contracts — waiting to be
        unearthed. Until now.{" "}
      </div>
      {/* Graphic */}
      <div className="mt-11 flex justify-around gap-10">
        {/* Market contract */}
        <div className="relative flex aspect-square w-fit flex-1 flex-col items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900/30 p-6">
          <Link
            href="https://etherscan.io/address/0xE5BFAB544ecA83849c53464F85B7164375Bdaac1"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 bottom-4 font-light tracking-wider text-neutral-400"
          >
            Zora: Market
          </Link>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-xl font-bold">144.04976775 ETH</div>
            {loading ? (
              <div className="animate-pulse">
                <div className="mb-1 h-6 w-48 rounded bg-neutral-700"></div>
                <div className="h-4 w-32 rounded bg-neutral-700"></div>
              </div>
            ) : error ? (
              <div className="text-sm">Unable to load USD value</div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="">
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
          </div>
        </div>

        {/* Auction contract */}
        <div className="relative flex aspect-square w-fit flex-1 flex-col items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900/30 p-6">
          <Link
            href="https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -right-4 bottom-4 font-light tracking-wider text-neutral-400"
          >
            Zora: Auction House
          </Link>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-xl font-bold">13.52559704 ETH</div>
            {loading ? (
              <div className="animate-pulse">
                <div className="mb-1 h-6 w-48 rounded bg-neutral-700"></div>
                <div className="h-4 w-32 rounded bg-neutral-700"></div>
              </div>
            ) : error ? (
              <div className="text-sm">Unable to load USD value</div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="">
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
          </div>
        </div>
      </div>

      {/* 2 column text */}
      <div className="mt-12 grid w-[110%] grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-lg">FUNDS ARE SAFU 🙏</div>
          <div className="text-sm font-light">
            Was this a web2 startup, these funds would have been long gone. But
            thanks to the beauty of decentralization, and a lot of sleuthing,
            digging, and testing, we were able to create this alternative UI,
            enabling you to recover your assets.
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-lg">GET YOUR ASSETS BACK!</div>
          <div className="text-sm font-light">
            As artists and developers ourselves, we think that it’s important
            that people regain access over these assets. There’s no charge
            (other than gasfees) to reclaim{" "}
            <span className="font-bold">WHAT’S ALREADY YOURS!</span> But we
            happily accept donations on{" "}
            <span className="font-bold">zerazora.eth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
