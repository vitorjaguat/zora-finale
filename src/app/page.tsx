import CheckAddressWrapper from "@/components/CheckAddressWrapper";
import Connect from "@/components/connect";

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#000000] to-[#333333] p-6">
      <Connect />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-200 sm:text-[5rem]">
          Zora Finale
        </h1>

        <div className="mx-auto max-w-4xl">
          <CheckAddressWrapper />
        </div>
      </div>
    </main>
  );
}
