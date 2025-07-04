import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import Providers from "../components/provider/rainbow-provider";

export const metadata: Metadata = {
  title: "Zora Finale",
  description:
    "Check if your Ethereum address owns any tokens (or ETH) on the Zora protocol",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
