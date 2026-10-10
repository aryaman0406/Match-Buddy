import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Match Buddy | AI Live Sports Companion",
  description:
    "Your intelligent companion for live sports — Cricket, Football, Basketball, Tennis, F1, Kabaddi, and custom matches. Instant, friendly explanations in English and Hinglish.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏆</text></svg>",
  },
  openGraph: {
    title: "Match Buddy — Live Sports AI Companion",
    description:
      "Tired of feeling clueless during matches? Tap any player, event, or rule to get instant explanations in English or Hinglish across any sport.",
    url: "https://match-buddy.vercel.app",
    siteName: "Match Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Match Buddy — Live Sports AI Companion",
    description:
      "Your intelligent sports companion for live matches. Instant, friendly explanations in English and Hinglish.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0B0E14" />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("match-buddy-theme")||"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col items-center justify-start">
        {children}
      </body>
    </html>
  );
}

