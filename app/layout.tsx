import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0E14",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://match-buddy-ruby.vercel.app"),
  title: "Match Buddy | AI Live Sports Companion",
  description:
    "Your intelligent companion for live Cricket, Football, and Basketball matches. Instant, friendly explanations in English and Hinglish.",
  alternates: {
    canonical: "https://match-buddy-ruby.vercel.app",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏆</text></svg>",
  },
  openGraph: {
    title: "Match Buddy — Live Sports AI Companion",
    description:
      "Instant, friendly explanations for Cricket, Football, and Basketball in English and Hinglish. Tap any player or match event to break down what just happened.",
    url: "https://match-buddy-ruby.vercel.app",
    siteName: "Match Buddy",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Match Buddy — Live Sports AI Companion for Cricket, Football, and Basketball",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Match Buddy — Live Sports AI Companion",
    description:
      "Your intelligent sports companion for live Cricket, Football, and Basketball matches. Instant, friendly explanations in English and Hinglish.",
    images: ["/og-image.png"],
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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("match-buddy-theme")||"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col items-center justify-start"
      >
        {children}
      </body>
    </html>
  );
}

