import CheckAddressWrapper from "@/components/CheckAddressWrapper";
import Connect from "@/components/connect";
import { ConnectButtonCustom } from "@/components/ConnectButton";

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#000000] to-[#333333] p-6">
      {/* <Connect /> */}
      <div className="flex w-full justify-end">
        <ConnectButtonCustom
          text="Connect"
          className="rounded-lg bg-green-400 px-4 py-2 font-mono font-semibold text-neutral-900 transition-colors duration-200 hover:bg-green-600"
        />
      </div>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-7xl font-extrabold tracking-wide text-neutral-200">
          Zora Finale
        </h1>

        <div className="mx-auto max-w-5xl">
          <CheckAddressWrapper />
        </div>
      </div>
    </main>
  );
}
