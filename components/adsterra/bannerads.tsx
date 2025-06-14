"use client";

import { useEffect, useRef } from "react";

export default function BannerAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptConfig = document.createElement("script");
    scriptConfig.type = "text/javascript";
    scriptConfig.innerHTML = `
      atOptions = {
        'key' : '10a74cde0d7fb9b8aadb4042bc6d9ce8',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    const scriptSrc = document.createElement("script");
    scriptSrc.type = "text/javascript";
    scriptSrc.src =
      "//www.highperformanceformat.com/10a74cde0d7fb9b8aadb4042bc6d9ce8/invoke.js";
    scriptSrc.async = true;

    if (adRef.current) {
      adRef.current.appendChild(scriptConfig);
      adRef.current.appendChild(scriptSrc);
    }

    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={adRef} className="adsterra-banner" />;
}
