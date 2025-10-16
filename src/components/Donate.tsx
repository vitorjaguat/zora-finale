import Link from "next/link";
import { AddressDisplay } from "./AddressDisplay";
import { FaGithub } from "react-icons/fa";

export default function Donate() {
  return (
    <section
      id="donate"
      className="relative mt-20 h-screen w-full px-6 pt-32 max-sm:pt-36 text-neutral-200  max-sm:h-auto max-sm:px-0"
    >
      <div className="flex max-w-1/2 flex-col gap-6 max-sm:max-w-full max-sm:gap-6 max-sm:pb-40 max-sm:px-2">
        {/* Intro text */}
        <div className="text-4xl max-sm:text-4xl max-sm:text-center">
          Donate
        </div>
        <div className="font-light max-sm:text-sm max-sm:text-center">
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
        <div className="font-light max-sm:text-sm max-sm:text-center">
          If you managed to reclaim assets that were trapped into Zora, please
          consider making a donation to
        </div>
        <div className="max-sm:flex max-sm:justify-center">
          <AddressDisplay
            address="zerazora.eth"
            showENS
            className="items-center text-8xl! max-sm:text-4xl!"
            iconSize={40}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute right-0 bottom-0 left-0 flex w-full justify-between bg-neutral-900 px-6 py-6 mix-blend-difference max-sm:static max-sm:flex-col max-sm:gap-2 max-sm:px-2 max-sm:py-3">
        <div className="flex w-full justify-between max-sm:flex-col max-sm:gap-2">
          <div className="max-sm:text-xs max-sm:text-center">
            Open-source and verifiable at{" "}
            <Link
              className="underline"
              href="https://github.com/vitorjaguat/zora-finale"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={20} className="ml-1 inline max-sm:align-middle" />
            </Link>
          </div>
          <div className="max-sm:text-xs max-sm:text-center">
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
