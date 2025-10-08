export default function Hero() {
  return (
    <section
      id="hero"
      className="z-1 flex h-[calc(100dvh-80px)] w-full flex-col justify-between pt-6 pl-6 text-neutral-200"
    >
      <div className=""></div>
      <div className=""></div>

      <div className="">
        {/* <div className="mb-0 text-base text-neutral-300">Reclaim what’s</div> */}
        <div className="mb-16 text-6xl">
          <div className="">Reclaim what’s</div>
          <div className="">yours, truly.</div>
        </div>
        <p className="w-1/2 text-xl font-light">
          Zora deprecated its user interface for NFT auctioning and trading on
          Ethereum mainnet, leaving users’ assets trapped.{" "}
          <span className="font-bold">Get them back now.</span>
        </p>
        {/* <p className="w-1/2 text-xl font-light tracking-wider">
          Here you can get them back.
        </p> */}
      </div>

      <nav className="flex w-full justify-between pb-6"></nav>
    </section>
  );
}
