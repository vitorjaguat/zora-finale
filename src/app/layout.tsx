import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";

import { type Metadata } from "next";

import Providers from "../components/provider/rainbow-provider";

export const metadata: Metadata = {
  title: "ZERA",
  description:
    "Check if your Ethereum address owns any tokens (or WETH) on the Zora protocol",
  icons: [{ rel: "icon", url: "/assets/zorb-monochrome.svg" }],
  openGraph: {
    title: "ZERA",
    description:
      "Check if your Ethereum address owns any tokens (or WETH) on the Zora protocol",
    url: "https://zera.uint.studio",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZERA",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZERA",
    description:
      "Check if your Ethereum address owns any tokens (or WETH) on the Zora protocol",
    images: ["/assets/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
