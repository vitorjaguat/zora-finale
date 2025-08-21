import CheckAddressWrapper from "@/components/CheckAddressWrapper";
import Connect from "@/components/connect";
import { ConnectButtonCustom } from "@/components/ConnectButton";
import Hero from "@/components/ui/Hero";
import Sphere from "@/components/ui/Sphere";
import ThePlan from "@/components/ui/ThePlan";

export default function HomePage() {
  return (
    <main className="relative bg-gradient-to-b from-[#000000] to-[#333333] p-6">
      {/* <Connect /> */}
      <div className="absolute top-6 right-6 flex w-full justify-end">
        <ConnectButtonCustom
          text="Connect"
          className="rounded-lg bg-neutral-400 px-4 py-2 text-neutral-900 transition-colors duration-200 hover:bg-green-600"
        />
      </div>
      <Hero />
      <ThePlan />
      <Sphere />
      {/* <div className="h-100"></div> */}

      <div className="z-1 mx-auto mt-32 flex w-full max-w-5xl flex-col items-center">
        <CheckAddressWrapper />
      </div>
    </main>
  );
}
