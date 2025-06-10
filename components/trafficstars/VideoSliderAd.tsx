"use client";

import { useEffect } from "react";

export default function VideoSliderAd() {
  useEffect(() => {
    // Load the external script dynamically
    const script = document.createElement("script");
    script.src = "//cdn.tsyndicate.com/sdk/v1/video.instant.message.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize the ad after script is loaded
      if (window.TSVideoInstantMessage) {
        window.TSVideoInstantMessage({
          spot: "8ca537e975ab403baa7e50216824ac83",
          extid: "your-user-or-page-id", // Optional: Replace or customize this
          width: "10%",
          mobileWidth: "25%",
          displayMode: "uncapped",
          showCTAButton: true,
          hideOnComplete: false,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
