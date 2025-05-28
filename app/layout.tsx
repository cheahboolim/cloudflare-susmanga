import type React from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Notifications } from "@/components/notifications";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { AdProvider } from "@/components/ads/ad-provider";
import { AdBanner } from "@/components/ads/ad-banner";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SusManga - Share Your Dreams",
  description: "SusManga.com - Share Your Dreams, Live Your fantasy",
  generator: "susmanga.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
            <AdProvider>
              <div className="relative flex min-h-screen flex-col">
                <MainNav />
                <div className="container mx-auto px-4 py-2">
                  <AdBanner position="top" />
                </div>
                <div className="flex-1">{children}</div>
                <div className="container mx-auto px-4 py-2">
                  <AdBanner position="bottom" />
                </div>
                <Footer />
              </div>
              <Notifications />
              <Toaster />
            </AdProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
