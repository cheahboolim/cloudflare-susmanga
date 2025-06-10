"use client";

import { useEffect, useState } from "react";
import BannerAd from "@/components/adsterra/bannerads";
import BlueBallsAd from "@/components/ownads/blueballsads";

export default function RandomAd() {
  const [adChoice, setAdChoice] = useState<null | "banner" | "blueballs">(null);

  useEffect(() => {
    const random = Math.random();
    setAdChoice(random < 0.5 ? "banner" : "blueballs");
  }, []);

  if (!adChoice) return null; // Prevents mismatch on hydration

  return adChoice === "banner" ? <BannerAd /> : <BlueBallsAd />;
}
