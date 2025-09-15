import CheckAddressWrapper from "@/components/CheckAddressWrapper";
// import CheckAddress from "@/components/CheckAddress";
import { ConnectButtonCustom } from "@/components/ConnectButton";
import Donate from "@/components/Donate";
import HowTo from "@/components/HowTo";
import Hero from "@/components/ui/Hero";
import Menu from "@/components/ui/Menu";
import Sphere from "@/components/ui/Sphere";
import ThePlan from "@/components/ui/ThePlan";

export default function HomePage() {
  return (
    <main className="relative bg-gradient-to-b from-[#000000] to-[#555555] transition-all">
      <Hero />
      <Menu />
      <ThePlan />
      <HowTo />
      <Sphere />
      {/* <div className="h-100"></div> */}

      <div className="z-1 mx-auto mt-32 flex w-full max-w-5xl flex-col items-center">
        <CheckAddressWrapper />
      </div>
      <Donate />
      {/* <Connect /> */}
      <div className="fixed top-0 left-0 z-50 w-full mix-blend-difference">
        <div className="flex justify-between px-6 pt-6">
          <h1 className="w-fit text-3xl tracking-wide text-neutral-200">
            ZERA
          </h1>
          <ConnectButtonCustom
            text="Connect"
            className="z-50! rounded-lg border-[2px] border-neutral-600 px-4 py-2 text-neutral-300 transition-colors duration-200 hover:bg-neutral-600"
          />
        </div>
      </div>
    </main>
  );
}
