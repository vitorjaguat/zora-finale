import Link from "next/link";
import { AddressDisplay } from "./AddressDisplay";

export default function Donate() {
  return (
    <div
      id="donate"
      className="mt-[250px] flex h-screen max-w-1/2 flex-col gap-6 px-6 pt-40 text-neutral-200"
    >
      {/* Intro text */}
      <div className="text-2xl">Donate</div>
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
        Zora Auction House smart contracts, please consider making a donation to
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
  );
}
