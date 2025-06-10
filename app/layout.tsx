import type React from "react";
import Script from "next/script";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Notifications } from "@/components/notifications";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";

import VideoSliderAd from "@/components/trafficstars/VideoSliderAd";
import PopUnderAd from "@/components/trafficstars/PopUnderAd";
import InterstitialAd from "@/components/trafficstars/InterstitialAd";
import RandomAd from "@/components/ads/RandomAd";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const runtime = "edge";

export const metadata = {
  title: "SusManga - Share Your Dreams",
  description: "SusManga.com - Share Your Dreams, Live Your Fantasy",
  generator: "susmanga.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager Script */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MT3LL937');`,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MT3LL937"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {/* TrafficStars Ads */}
        <VideoSliderAd />
        <PopUnderAd />
        <InterstitialAd />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <MainNav />

              {/* Top Ad — Randomized */}
              <div className="container mx-auto px-4 py-2">
                <RandomAd />
              </div>

              <main className="flex-1">{children}</main>

              {/* Bottom Ad — Randomized */}
              <div className="container mx-auto px-4 py-2">
                <RandomAd />
              </div>

              <Footer />
            </div>

            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
