import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yunnanunfolded.com"),
  title: { default: "Yunnan Unfolded | Thoughtful Journeys Through Yunnan", template: "%s | Yunnan Unfolded" },
  description: "Boutique, locally rooted journeys through the mountains, cultures and hidden corners of Yunnan, China.",
  applicationName: "Yunnan Unfolded",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_US", siteName: "Yunnan Unfolded", title: "Yunnan, unfolded.", description: "Travel deeper into the mountains, cultures and hidden corners of southwest China.", url: "/" },
  twitter: { card: "summary_large_image", title: "Yunnan, unfolded.", description: "Thoughtful, locally rooted journeys through Yunnan, China." },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
