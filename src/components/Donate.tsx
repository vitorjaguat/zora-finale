import Link from "next/link";
import { AddressDisplay } from "./AddressDisplay";
import { FaGithub } from "react-icons/fa";

export default function Donate() {
  return (
    <section
      id="donate"
      className="relative mt-20 h-screen w-full px-6 pt-32 text-neutral-200"
    >
      <div className="flex max-w-1/2 flex-col gap-6">
        {/* Intro text */}
        <div className="text-4xl">Donate</div>
        <div className="font-light">
          This alternate UI was made with love by{" "}
          <Link
            className="underline"
            href="https://uint.studio"
            target="_blank"
            rel="noopener noreferrer"
          >
            uint.studio
          </Link>
          , as an act of protocolized care towards a beautiful community of
          artists, collectors, and developers that helped to shape an early
          cryptomedia scene.
        </div>
        <div className="font-light">
          If you managed to reclaim your funds that were stuck at Zora Media and
          Zora Auction House smart contracts, please consider making a donation
          to
        </div>
        <div className="">
          <AddressDisplay
            address="zerazora.eth"
            showENS
            className="items-center text-8xl!"
            iconSize={60}
          />
        </div>
      </div>
      <div className="absolute right-0 bottom-0 left-0 flex w-full justify-between bg-neutral-900 px-6 py-6 mix-blend-difference">
        <div className="flex w-full justify-between">
          <div className="">
            Open-source and verifiable at{" "}
            <Link
              className="underline"
              href="https://github.com/vitorjaguat/zora-finale"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={24} className="ml-1 inline" />
            </Link>
          </div>
          <div className="">
            Created with ❤︎ by{" "}
            <Link
              className="underline"
              href="https://uint.studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              uint.studio
            </Link>
          </div>
        </div>
        {/* <div className="h-2 w-[580px] bg-pink-300"></div> */}
      </div>
    </section>
  );
}
