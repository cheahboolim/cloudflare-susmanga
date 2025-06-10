"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";

export function PopUnderAd() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;

  useEffect(() => {
    if (isPremium) return;

    const isExcluded =
      typeof window !== "undefined" &&
      (window.location.pathname.includes("/sign-in") ||
        window.location.pathname.includes("/sign-up") ||
        window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/manage-ads"));

    if (isExcluded) return;

    const hasRun = sessionStorage.getItem("popUnderShown");
    if (hasRun) return;

    sessionStorage.setItem("popUnderShown", "true");

    const loadPopUnder = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ads")
        .select("html, enabled")
        .eq("position", "popunder")
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.html) {
        console.warn("No enabled popunder ad found.");
        return;
      }

      // Create and inject script or HTML
      const container = document.createElement("div");
      container.innerHTML = data.html;
      document.body.appendChild(container);
    };

    setTimeout(loadPopUnder, 3000); // slight delay after page load
  }, [user]);

  return null;
}
