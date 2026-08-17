import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./brand-overrides.css";
import { StructuredData } from "./components/StructuredData";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

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

const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
const tawkSrc = tawkPropertyId && tawkWidgetId
  ? `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`
  : null;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={playfair.variable}>
      <body>
        <StructuredData />
        {children}
        {tawkSrc ? (
          <Script
            src={tawkSrc}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
