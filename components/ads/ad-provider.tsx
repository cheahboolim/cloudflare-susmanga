"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { VideoSliderAd } from "./video-slider-ad";
import { PopUnderAd } from "./pop-under-ad";
import type { ReactNode } from "react";

interface AdProviderProps {
  children: ReactNode;
}

export function AdProvider({ children }: AdProviderProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isPremium = user?.isPremium;
  const isExcluded =
    pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.startsWith("/admin");

  const shouldShowAds = !isPremium && !isExcluded;

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
