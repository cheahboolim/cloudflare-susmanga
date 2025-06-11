import type React from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import BannerAd from "@/components/adsterra/bannerads";
import BlueBallsAd from "@/components/ownads/blueballsads";

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
      <head />
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
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
                <BannerAd />
              </div>

              <main className="flex-1">{children}</main>

              {/* Bottom Ad — Randomized */}
              <div className="container mx-auto px-4 py-2">
                <BlueBallsAd />
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
