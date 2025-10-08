import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";

import { type Metadata } from "next";

import Providers from "../components/provider/rainbow-provider";

export const metadata: Metadata = {
  title: "ZERA",
  description: "Reclaim your assets trapped inside old Zora smart contracts",
  icons: [{ rel: "icon", url: "/assets/zorb-monochrome.svg" }],
  openGraph: {
    title: "ZERA",
    description: "Reclaim your assets trapped inside old Zora smart contracts",
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
    description: "Reclaim your assets trapped inside old Zora smart contracts",
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
