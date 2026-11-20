import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cinzel } from "next/font/google";
import localFont from "next/font/local";
import { event } from "@/lib/event";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const display = Cinzel({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display", display: "swap" });
const names = localFont({ src: "../assets/fonts/AgetyaButterfly-Regular.ttf", variable: "--font-names", display: "swap", weight: "400", style: "normal" });
const title = "Agar & Renas — Engagement Invitation";
const description = "Together with their families, Agar & Renas joyfully invite you to celebrate their engagement on December 2, 2026.";
export const metadata: Metadata = {
  metadataBase: new URL(event.siteUrl), title, description,
  openGraph: { title, description, type: "website", url: event.siteUrl, locale: "en_US", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Agar & Renas · December 2, 2026 · Lavender floral engagement invitation" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
  icons: { icon: "/icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#EDE3F5" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${serif.variable} ${display.variable} ${names.variable}`}>{children}</body></html>;
}
