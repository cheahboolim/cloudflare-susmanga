"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function VideoSliderAd() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [html, setHtml] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const isPremium = user?.isPremium;

  useEffect(() => {
    const isExcluded =
      typeof window !== "undefined" &&
      (window.location.pathname.includes("/sign-in") ||
        window.location.pathname.includes("/sign-up") ||
        window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/manage-ads"));

    if (isPremium || isExcluded) return;

    const fetchAd = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ads")
        .select("html, enabled")
        .eq("position", "videoslider")
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.html) return;

      setHtml(data.html);
      setTimeout(() => setVisible(true), 2000); // show after short delay
    };

    fetchAd();
    return () => setVisible(false);
  }, [isPremium]);

  if (!visible || !html) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-0 right-0 z-50 p-4 transition-transform transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
    >
      <div className="relative bg-background rounded-lg border shadow-lg overflow-hidden">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setVisible(false)}
          className="absolute top-1 right-1 z-10 h-6 w-6 bg-background/80"
        >
          <X className="h-4 w-4" />
        </Button>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="absolute top-0 left-0 px-1 text-[10px] bg-background/80 text-muted-foreground">
          Advertisement
        </div>
      </div>
    </div>
  );
}
