import { NextResponse } from "next/server";

export async function GET() {
  try {
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

    if (!etherscanApiKey) {
      return NextResponse.json(
        { error: "Etherscan API key not configured" },
        { status: 500 },
      );
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

    return NextResponse.json(data.result);
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return NextResponse.json(
      { error: "Failed to fetch ETH price" },
      { status: 500 },
    );
  }
}
