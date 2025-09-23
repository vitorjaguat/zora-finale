import CheckAddressWrapper from "@/components/CheckAddressWrapper";
// import CheckAddress from "@/components/CheckAddress";
import { ConnectButtonCustom } from "@/components/ConnectButton";
import Donate from "@/components/Donate";
import HowTo from "@/components/HowTo";
import Hero from "@/components/ui/Hero";
import Menu from "@/components/ui/Menu";
import Sphere from "@/components/ui/Sphere";
import ThePlan from "@/components/ui/ThePlan";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative bg-gradient-to-b from-[#000000] to-[#555555] transition-all">
      <Hero />
      <Menu />
      <ThePlan />
      <HowTo />
      <Sphere />

      <div className="z-1 mx-auto flex w-full max-w-5xl flex-col items-center">
        <CheckAddressWrapper />
      </div>

      {/* <Connect /> */}
      <div className="fixed top-0 left-0 z-50 w-full mix-blend-difference">
        <div className="flex justify-between px-6 pt-6">
          <Link
            href="/"
            className="w-fit text-3xl tracking-wide text-neutral-200"
          >
            ZERA
          </Link>
          <ConnectButtonCustom
            text="CONNECT"
            className="z-50! translate-x-1 -translate-y-1 rounded-lg border-[2px] border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-300 transition-colors duration-200 hover:bg-neutral-600"
          />
        </div>
      </div>
      <Donate />
    </main>
  );
}
