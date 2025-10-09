"use client";

import Link from "next/link";
import { AddressDisplay } from "../AddressDisplay";
import ThePlanGraphic from "./ThePlanGraphic";

export default function ThePlan() {
  return (
    <section
      id="the-plan"
      className="mt-20 flex max-w-1/2 flex-col gap-6 px-6 pt-32 max-sm:pt-8 text-neutral-200 max-sm:max-w-[100vw] max-sm:px-0"
    >
      {/* Intro text */}
      <div className="text-4xl  max-sm:px-2">The Plan</div>
      <div className="font-light max-sm:px-2">
        Web3 doesn’t stand still: it evolves, it mutates, it leaves fossils
        behind. Nonetheless, blockchains are immutable record-stating memory
        machines.{" "}
      </div>
      <div className="font-light max-sm:px-2">
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
        ,{" "}
        <Link
          className="underline"
          href="https://www.nbcnews.com/pop-culture/pop-culture-news/iconic-doge-meme-nft-breaks-records-selling-roughly-4-million-n1270161"
          target="_blank"
          rel="noopener noreferrer"
        >
          memetic bid wars
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
        auctions.{" "}
      </div>
      <div className="font-light max-sm:px-2">
        But evolution is relentless. As Zora shifted its orbit (now focused on
        <span className="ml-1 line-through decoration-2">shitcoins</span>
        <span className="ml-1 line-through decoration-2">memecoins</span>
        <span className="mx-1 line-through decoration-2">contentcoins</span>
        creatorcoins) the contracts that once carried this golden age were
        abandoned. Hundreds of WETH from past bids - and lots of NFTs - are
        currently escrowed inside those contracts. A buried layer of fungies and
        non-fungies sealed inside fossilized chests - waiting to be unearthed.
        Until now.
      </div>

      {/* Graphic */}
      <ThePlanGraphic />

      {/* 2 column text */}
      <div className="mt-12 grid w-[110%] max-sm:w-full flex-1 grid-cols-2 gap-16 pr-6 max-sm:px-2 max-sm:flex max-sm:flex-col">
        <div className="flex-1 space-y-2">
          <div className="text-lg">FUNDS ARE SAFU 🙏</div>
          <div className="text-sm font-light">
            Was this a web2 startup, these funds would have been long gone. But
            thanks to the beauty of decentralization, and some sleuthing,
            digging, and testing, we were able to create this alternative UI,
            enabling you to recover your assets.
          </div>
        </div>
        <div className="flex-1 space-y-2 max-sm:text-left text-right">
          <div className="text-lg">GET YOUR ASSETS BACK!</div>
          <div className="text-sm font-light">
            As artists and developers ourselves, we think that it’s important
            that people regain access over these assets. There’s no charge
            (other than gas fees) to reclaim{" "}
            <span className="font-bold">WHAT’S ALREADY YOURS!</span> But we
            happily accept donations on{" "}
            <AddressDisplay
              className="inline items-end space-x-1! font-bold"
              address="zerazora.eth"
              showENS
            />
          </div>
        </div>
      </div>
    </section>
  );
}
