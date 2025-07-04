import CheckAddress from "@/components/CheckAddress";
import Connect from "@/components/connect";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#333333]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-200 sm:text-[5rem]">
          Zora Finale
        </h1>

        <Connect />
        <CheckAddress />
      </div>
    </main>
  );
}
