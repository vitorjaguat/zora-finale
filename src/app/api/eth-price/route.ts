import { NextResponse } from "next/server";
import { Alchemy, Network } from "alchemy-sdk";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is not set in environment variables");
}

const alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

export async function GET() {
  try {
    // Fetch ETH price in USD using Alchemy SDK
    const ethPriceResponse = await alchemy.prices.getTokenPriceBySymbol([
      "WETH",
    ]);

    if (!ethPriceResponse?.data[0]?.prices[0]?.value) {
      throw new Error("Unable to load ETH price");
    }

    // Return in the same format as Etherscan for compatibility
    const result = {
      ethusd: ethPriceResponse?.data[0]?.prices[0]?.value.toString(),
      ethusd_timestamp: Math.floor(Date.now() / 1000).toString(), // Current timestamp
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching ETH price from Alchemy:", error);

    // Fallback to Etherscan if Alchemy fails
    try {
      console.log("Falling back to Etherscan API...");

      const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

      if (!etherscanApiKey) {
        throw new Error("Etherscan API key not configured");
      }

      const response = await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanApiKey}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from Etherscan");
      }

      const data = (await response.json()) as {
        status: string;
        message: string;
        result: {
          ethbtc: string;
          ethbtc_timestamp: string;
          ethusd: string;
          ethusd_timestamp: string;
        };
      };

      if (data.status !== "1") {
        throw new Error("Etherscan API error");
      }

      return NextResponse.json({
        ethusd: data.result.ethusd,
        ethusd_timestamp: data.result.ethusd_timestamp,
      });
    } catch (fallbackError) {
      console.error("Etherscan fallback also failed:", fallbackError);
      return NextResponse.json(
        { error: "Failed to fetch ETH price from both Alchemy and Etherscan" },
        { status: 500 },
      );
    }
  }
}
