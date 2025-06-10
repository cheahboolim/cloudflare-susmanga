"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    InterstitialTsAd?: (options: {
      spot: string;
      extid?: string;
      countClicks?: number;
    }) => void;
  }
}

export default function InterstitialAd() {
  useEffect(() => {
    // Load CSS
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "//cdn.tsyndicate.com/sdk/v1/interstitial.ts.css";
    document.head.appendChild(css);

    // Load JS
    const script = document.createElement("script");
    script.src = "//cdn.tsyndicate.com/sdk/v1/interstitial.ts.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.InterstitialTsAd) {
        window.InterstitialTsAd({
          spot: "9b612090edba4411bb22274d550c811a",
          extid: "your-extid", // Optional
          countClicks: 5,
        });
      }
    };

    return () => {
      document.head.removeChild(css);
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
