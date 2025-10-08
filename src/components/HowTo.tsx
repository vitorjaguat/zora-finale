"use client";

import { AddressDisplay } from "./AddressDisplay";
import Link from "next/link";
import { RiArrowDownSFill } from "react-icons/ri";
import { useState } from "react";

export default function HowTo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mt-20 flex max-w-1/2 flex-col gap-6 px-6 pt-32 text-neutral-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-end gap-5 text-4xl transition-colors duration-200 hover:text-neutral-100"
      >
        <span>How To</span>
        <RiArrowDownSFill
          className={`transform transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          size={32}
        />
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ol className="ml-4 flex list-decimal flex-col gap-2 font-light">
          <li className="">
            Input a valid address or ENS below and submit. If escrowed assets
            are found, you&apos;ll see a list.
          </li>
          <li className="">
            On the left side, you&apos;ll find active bids within the{" "}
            <Link
              className="underline"
              href="https://etherscan.io/address/0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zora Media contract
            </Link>{" "}
            (prior to Auction House implementation).
            <span className="block">
              There are two possible outcomes for these cases:
            </span>
            <ol className="mt-2 ml-4 list-disc">
              <li>
                If you are the bidder, you can connect your wallet, withdraw the
                bid and get your WETH (or other ERC-20&apos;s) back;
              </li>
              <li>
                If you are the NFT owner, you can connect your wallet and accept
                the bid. You&apos;ll receive the value of the bid, the bidder
                will receive their NFT.{" "}
              </li>
              <li>
                Whoever arrives first will have the opportunity to finalize the
                deal.
              </li>
            </ol>
          </li>
          <li>
            On the right side you&apos;ll will find unsettled auctions made
            within the{" "}
            <Link
              className="underline"
              href="https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zora Auction House smart contract
            </Link>
            , for which there are also two possible outcomes:
            <ol className="mt-2 ml-4 list-disc">
              <li>
                If an NFT was put for auction and didn&apos;t receive any bids,
                only the NFT owner can cancel the auction, and the NFT will
                return to their wallet.
              </li>
              <li>
                If the NFT received bids, and the last bid has not been settled,
                anyone willing to pay for the gas fee can click “End Auction”.
                This will send the NFT to the last bidder, and the original
                owner of the NFT will receive the bidded amount in WETH (or
                other ERC-20&apos;s). Bids on finalized auctions cannot be
                canceled.
              </li>
            </ol>
          </li>
          <li>
            After receiving your assets back, consider make a donation to{" "}
            <AddressDisplay
              className="inline space-x-1! text-base! font-bold"
              address="zerazora.eth"
              showENS
            />
          </li>
        </ol>
      </div>
    </section>
  );
}
