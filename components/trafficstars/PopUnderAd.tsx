"use client";

import { useEffect } from "react";

export default function PopUnderAd() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//cdn.tsyndicate.com/sdk/v1/p.js";
    script.setAttribute("data-ts-spot", "396fdd7913db41adb7ccb8ded33c351b");
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
