"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useMobile } from "@/hooks/use-mobile";
import { createClient } from "@/utils/supabase/client";

interface AdBannerProps {
  position: "top" | "bottom" | "sidebar" | "reader";
  className?: string;
}

export function AdBanner({ position, className }: AdBannerProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isMobile = useMobile();

  const [adHtml, setAdHtml] = useState<string | null>(null);

  const isPremium = user?.isPremium;
  const isExcluded =
    pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manage-ads");

  useEffect(() => {
    if (isPremium || isExcluded) return;

    const fetchAd = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ads")
        .select("html")
        .eq("position", position)
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.html) {
        console.warn("Ad not found or disabled:", error);
        return;
      }

      setAdHtml(data.html);
    };

    fetchAd();
  }, [position, isMobile, isPremium, isExcluded]);

  if (!adHtml) return null;

  return (
    <div
      className={cn(
        "relative text-center overflow-hidden border border-dashed border-muted/30 bg-muted/20",
        getAdSizeClass(position, isMobile),
        className
      )}
    >
      <div
        className="flex items-center justify-center w-full h-full"
        dangerouslySetInnerHTML={{ __html: adHtml }}
      />
      <div className="absolute top-0 right-0 text-[10px] px-1 bg-background/80 text-muted-foreground">
        Advertisement
      </div>
    </div>
  );
}

function getAdSizeClass(position: string, isMobile: boolean): string {
  switch (position) {
    case "top":
    case "bottom":
    case "reader":
      return isMobile
        ? "w-[300px] h-[250px] mx-auto"
        : "w-[728px] h-[90px] mx-auto";
    case "sidebar":
      return "w-[300px] h-[600px]";
    default:
      return "";
  }
}
