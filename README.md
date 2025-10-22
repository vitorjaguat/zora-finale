# ZERA - Reclaim What's Yours, Truly

## Overview

Zora deprecated its user interface for NFT auctioning and trading on Ethereum mainnet, leaving users' assets trapped. **Get them back now.**

Web3 doesn't stand still: it evolves, it mutates, it leaves fossils behind. Nonetheless, blockchains are immutable state-recording memory machines.

## The Story

Zora emerged on the New Year's Eve of 2020 as a new place for collective value capture on the Internet. Beyond just another media platform, it became one of the great places for NFT creation and circulation. The tide was high: [people begging for invites](https://x.com/search?q=zora%20invite%20until%3A2021-02-28%20since%3A2020-12-31&src=typed_query&f=live), [5-figure sales](https://etherscan.io/tx/0xc7baf98ff04caf0b59b340062704cda7c61daedae7dea182d05ba1842d9a647f), [memetic bid wars](https://www.nbcnews.com/pop-culture/pop-culture-news/iconic-doge-meme-nft-breaks-records-selling-roughly-4-million-n1270161). Some tokens from this (now clearly) mania phase even crossed the trad-art border into [Christie's](https://onlineonly.christies.com/s/andy-warhol-machine-made/andy-warhol-1928-1987-1/117669) and [Sotheby's](https://www.sothebys.com/en/buy/auction/2021/natively-digital-a-curated-nft-sale-2/self-portrait-2?locale=zh-Hans) auctions.

But evolution is relentless. As Zora shifted its orbit (now focused on ~~shitcoins~~ ~~memecoins~~ ~~contentcoins~~ creatorcoins) the contracts that once carried this golden age were abandoned, after their UI was taken down. WETH, stables, ERC-20's from past bids; and thousands of NFTs are currently escrowed inside those contracts. A buried layer of fungies and non-fungies sealed inside fossilized chests - waiting to be unearthed. **Until now.**

## How It Works

### For Market Contract Bids

Input a valid address or ENS below and submit. If escrowed assets are found, you'll see a list.

On the left side, you'll find active bids within the [Zora Media contract](https://etherscan.io/address/0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7) (prior to Auction House implementation).

There are two possible outcomes for these cases:

- **If you are the bidder**: You can connect your wallet, withdraw the bid and get your WETH (or other ERC-20's) back
- **If you are the NFT owner**: You can connect your wallet and accept the bid. You'll receive the value of the bid, the bidder will receive their NFT
- **First come, first served**: Whoever arrives first will have the opportunity to finalize the deal

### For Auction House

On the right side you'll find unsettled auctions made within the [Zora Auction House smart contract](https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673), for which there are also two possible outcomes:

- **No bids received**: If an NFT was put for auction and didn't receive any bids, only the NFT owner can cancel the auction, and the NFT will return to their wallet
- **Bids received**: If the NFT received bids, and the last bid has not been settled, anyone willing to pay for the gas fee can click "End Auction". This will send the NFT to the last bidder, and the original owner of the NFT will receive the bidded amount in WETH (or other ERC-20's). Bids on finalized auctions cannot be canceled

## Smart Contracts

### Market Contract

- **Address**: [0xE5BFAB544ecA83849c53464F85B7164375Bdaac1](https://etherscan.io/address/0xE5BFAB544ecA83849c53464F85B7164375Bdaac1)
- **Purpose**: Original Zora Market contract for NFT bidding and trading

### Auction House Contract

- **Address**: [0xe468ce99444174bd3bbbed09209577d25d1ad673](https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673)
- **Purpose**: Zora Auction House for NFT auctions
- **Escrowed NFTs**: [View on Etherscan](https://etherscan.io/address/0xe468ce99444174bd3bbbed09209577d25d1ad673#asset-nfts)

## Funds Are SAFU 🙏

Was this a web2 startup, these funds would have been long gone. But thanks to the beauty of decentralization, and some sleuthing, digging, and testing, we were able to create this alternative UI, enabling you to recover your assets.

## Get Your Assets Back!

As artists and developers ourselves, we think that it's important that people regain access over these assets. There's no charge (other than gas fees) to reclaim **WHAT'S ALREADY YOURS!**

But we happily accept donations on **zerazora.eth**

## About

This alternate UI was made with love by [uint.studio](https://uint.studio), as an act of protocolized care towards a beautiful community of artists, collectors, and developers that helped to shape an early cryptomedia scene.

If you managed to reclaim assets that were trapped into Zora, please consider making a donation to **zerazora.eth**

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

This project is open-source and verifiable. Contributions are welcome.

## Support

After receiving your assets back, consider making a donation to **zerazora.eth**

---

Created with ❤︎ by [uint.studio](https://uint.studio)
