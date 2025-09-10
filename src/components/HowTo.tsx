export default function HowTo() {
  return (
    <div
      id="how-to"
      className="mt-32 flex max-w-1/2 flex-col gap-6 px-6 pt-32 pb-[500px] text-neutral-200"
    >
      {/* Intro text */}
      <div className="text-2xl">How To</div>
      <ol className="ml-4 flex list-decimal flex-col gap-2 font-light">
        <li className="">
          Input a valid address or ENS below and submit. If escrowed assets are
          found, you&apos;ll see a list.
        </li>
        <li className="">
          On the left side, you&apos;ll find active bids within the Zora Media
          contract (prior to Auction House implementation).
          <span className="block">
            There are two possible outcomes for these cases:
          </span>
          <ol className="mt-2 ml-4 list-disc">
            <li>
              If you are the bidder, you can connect your wallet, withdraw the
              bid and get your WETH (or other ERC-20&apos;s) back;
            </li>
            <li>
              If you are the NFT owner, you can connect your wallet and accept
              the bid. You&apos;ll receive the value of the bid, the bidder will
              receive their NFT.{" "}
            </li>
            <li>
              Whoever arrives first will have the opportunity to finalize the
              deal.
            </li>
          </ol>
        </li>
        <li>
          On the right side you&apos;ll will find unsettled auctions made with
          Zora Auction House, for which there are also two possible outcomes:
          <ol className="mt-2 ml-4 list-disc">
            <li>
              If an NFT was put for auction and didn&apos;t receive any bids,
              only the NFT owner can cancel the auction, and the NFT will return
              to their wallet.
            </li>
            <li>
              If the NFT received bids, and the last bid has not been settled,
              anyone willing to pay for the gasfee can click “End Auction”. This
              will send the NFT to the last bidder, and the original owner of
              the NFT will receive the bidded amount in WETH (or other
              ERC-20&apos;s).
            </li>
          </ol>
        </li>
        <li>
          After receiving your assets back, you can be nice and donate some
          funds to us at <span className="font-bold">zerazora.eth</span>.
        </li>
      </ol>
    </div>
  );
}
