import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "We Will Talk — 1 Year Promise c",
  description:
    "A personal countdown timer tracking the year-long promise to talk again on June 27, 2027.",
  openGraph: {
    title: "We Will Talk — 1 Year Promise Timer",
    description:
      "A personal countdown timer tracking the year-long promise to talk again on June 27, 2027.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Will Talk — 1 Year Promise Timer",
    description:
      "A personal countdown timer tracking the year-long promise to talk again on June 27, 2027.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
