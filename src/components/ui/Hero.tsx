export default function Hero() {
  return (
    <div className="z-1 flex h-[calc(100dvh-80px)] w-full flex-col justify-between pt-6 pl-6 text-neutral-200">
      <div className=""></div>
      <div className=""></div>

      <div className="">
        <div className="mb-16 text-8xl">Yours truly,</div>
        <p className="w-1/2 text-xl font-light tracking-wider">
          Zora deprecated its UI for NFT auctioning and trading, leaving users’
          assets locked into two smart contracts. Here you can get them back.
        </p>
        {/* <p className="w-1/2 text-xl font-light tracking-wider">
          Here you can get them back.
        </p> */}
      </div>

      <nav className="flex w-full justify-between pb-6"></nav>
    </div>
  );
}
