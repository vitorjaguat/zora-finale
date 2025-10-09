export default function Hero() {
  return (
    <section
      id="hero"
      className="z-1 flex h-[calc(100dvh-80px)] w-full flex-col justify-between pt-6 pl-6 text-neutral-200 max-sm:pt-2 max-sm:pl-2"
    >
      <div className=""></div>
      <div className="max-sm:hidden"></div>

      <div className="">
        {/* <div className="mb-0 text-base text-neutral-300">Reclaim what’s</div> */}
        <div className="mb-16  text-6xl max-sm:text-center max-sm:text-3xl">
          <div className="">Reclaim what’s</div>
          <div className="">yours, truly.</div>
        </div>
        <p className="w-1/2 max-sm:w-full max-sm:text-center max-sm:text-lg text-xl font-light">
          Zora deprecated its user interface for NFT auctioning and trading on
          Ethereum mainnet, leaving users’ assets trapped.{" "}
          <span className="font-bold max-sm:block">Get them back now.</span>
        </p>
        {/* <p className="w-1/2 text-xl font-light tracking-wider">
          Here you can get them back.
        </p> */}
      </div>

      <nav className="flex w-full justify-between pb-6 max-sm:pb-20"></nav>
    </section>
  );
}
