import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Match Buddy | AI Live Cricket Companion",
  description:
    "Your intelligent cricket companion for live matches. Instant, friendly 2-line explanations in simple English and Hinglish tailored for casual fans.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏏</text></svg>",
  },
  openGraph: {
    title: "Match Buddy — Live Cricket AI Companion",
    description:
      "Tired of feeling clueless during matches? Tap any player or rule to get instant 2-line explanations in English or Hinglish.",
    url: "https://match-buddy.vercel.app",
    siteName: "Match Buddy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Match Buddy — Live Cricket AI Companion",
    description:
      "Your intelligent cricket companion for live matches. Built for the Dream11 FDE Intern assignment.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0B0E14" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col items-center justify-start">
        {children}
      </body>
    </html>
  );
}
