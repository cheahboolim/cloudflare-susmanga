"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { VideoSliderAd } from "@/components/ads/video-slider-ad";
import { PopUnderAd } from "@/components/ads/pop-under-ad";
import { useAuth } from "@/components/auth-provider";

interface AdProviderProps {
  children: ReactNode;
}

export function AdProvider({ children }: AdProviderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show ads on admin pages, sign-in, or sign-up pages
  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage =
    pathname?.includes("/sign-in") || pathname?.includes("/sign-up");
  const isPremium = user?.isPremium || false;

  // Skip ads if user is premium, on admin pages, or auth pages
  const shouldShowAds = !isPremium && !isAdminPage && !isAuthPage;

  return (
    <>
      {children}
      {shouldShowAds && (
        <>
          <VideoSliderAd />
          <PopUnderAd />
        </>
      )}
    </>
  );
}
