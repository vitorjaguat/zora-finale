export const CONTRACT = {
  address: "0xe468ce99444174bd3bbbed09209577d25d1ad673" as const,
  abi: [
    {
      inputs: [
        { internalType: "address", name: "_zora", type: "address" },
        { internalType: "address", name: "_weth", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "AuctionApprovalUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "firstBid",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "extended",
          type: "bool",
        },
      ],
      name: "AuctionBid",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
      ],
      name: "AuctionCanceled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "reservePrice",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "curator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "curatorFeePercentage",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "address",
          name: "auctionCurrency",
          type: "address",
        },
      ],
      name: "AuctionCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
      ],
      name: "AuctionDurationExtended",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "curator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "winner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "curatorFee",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "auctionCurrency",
          type: "address",
        },
      ],
      name: "AuctionEnded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "auctionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "reservePrice",
          type: "uint256",
        },
      ],
      name: "AuctionReservePriceUpdated",
      type: "event",
    },
    { stateMutability: "payable", type: "fallback" },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "auctions",
      outputs: [
        { internalType: "uint256", name: "tokenId", type: "uint256" },
        { internalType: "address", name: "tokenContract", type: "address" },
        { internalType: "bool", name: "approved", type: "bool" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "uint256", name: "duration", type: "uint256" },
        { internalType: "uint256", name: "firstBidTime", type: "uint256" },
        { internalType: "uint256", name: "reservePrice", type: "uint256" },
        { internalType: "uint8", name: "curatorFeePercentage", type: "uint8" },
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "address payable", name: "bidder", type: "address" },
        { internalType: "address payable", name: "curator", type: "address" },
        { internalType: "address", name: "auctionCurrency", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "auctionId", type: "uint256" }],
      name: "cancelAuction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "tokenId", type: "uint256" },
        { internalType: "address", name: "tokenContract", type: "address" },
        { internalType: "uint256", name: "duration", type: "uint256" },
        { internalType: "uint256", name: "reservePrice", type: "uint256" },
        { internalType: "address payable", name: "curator", type: "address" },
        { internalType: "uint8", name: "curatorFeePercentage", type: "uint8" },
        { internalType: "address", name: "auctionCurrency", type: "address" },
      ],
      name: "createAuction",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "auctionId", type: "uint256" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "createBid",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "auctionId", type: "uint256" }],
      name: "endAuction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "minBidIncrementPercentage",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "auctionId", type: "uint256" },
        { internalType: "bool", name: "approved", type: "bool" },
      ],
      name: "setAuctionApproval",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "auctionId", type: "uint256" },
        { internalType: "uint256", name: "reservePrice", type: "uint256" },
      ],
      name: "setAuctionReservePrice",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "timeBuffer",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "wethAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "zora",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ] as const,
} as const;
