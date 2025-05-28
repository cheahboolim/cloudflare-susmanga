"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

interface AdBannerProps {
  position: "top" | "bottom" | "sidebar" | "reader";
  className?: string;
  index?: number; // For reader ads to track position
}

export function AdBanner({ position, className, index }: AdBannerProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isMobile = useMobile();
  const [adHtml, setAdHtml] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Skip rendering if user is premium
  const isPremium = user?.isPremium || false;

  // Don't show ads on admin pages, login/register pages
  const isAdminPage = pathname?.startsWith("/admin");
  const isExcludedPage =
    typeof window !== "undefined" &&
    (pathname?.includes("/sign-in") ||
      pathname?.includes("/sign-up") ||
      isAdminPage);

  useEffect(() => {
    if (isPremium || isExcludedPage) {
      setIsLoading(false);
      return;
    }

    // In a real implementation, fetch ad code from API
    const fetchAdCode = async () => {
      try {
        // Simulate API call to get ad code and enabled status
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data - in a real app, this would come from your backend
        const mockAdData = {
          enabled: true,
          html: getMockAdHtml(position, isMobile),
        };

        setAdHtml(mockAdData.html);
        setIsEnabled(mockAdData.enabled);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load ad:", error);
        setIsLoading(false);
        setIsEnabled(false);
      }
    };

    fetchAdCode();
  }, [position, isMobile, isPremium, isExcludedPage, index]);

  if (isPremium || isExcludedPage || !isEnabled || isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "ad-container relative overflow-hidden text-center bg-muted/30 border border-dashed border-muted-foreground/20",
        getAdSizeClass(position, isMobile),
        className
      )}
    >
      {/* Ad content */}
      <div
        className="ad-content w-full h-full flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: adHtml }}
      />

      {/* Ad label */}
      <div className="absolute top-0 right-0 bg-background/80 px-1 text-[10px] text-muted-foreground">
        Advertisement
      </div>
    </div>
  );
}

// Helper function to get appropriate size class based on position and device
function getAdSizeClass(position: string, isMobile: boolean): string {
  switch (position) {
    case "top":
    case "bottom":
      return isMobile
        ? "h-[300px] w-[300px] mx-auto"
        : "h-[90px] w-[720px] mx-auto";
    case "sidebar":
      return "h-[300px] w-[300px]";
    case "reader":
      return isMobile
        ? "h-[300px] w-[300px] mx-auto"
        : "h-[90px] w-[720px] mx-auto";
    default:
      return "";
  }
}

// Mock function to generate placeholder ad HTML
function getMockAdHtml(position: string, isMobile: boolean): string {
  const width = position === "sidebar" || isMobile ? 300 : 720;
  const height = position === "sidebar" || isMobile ? 300 : 90;

  return `
    <div style="width:${width}px;height:${height}px;background:linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;font-weight:bold;">
      ${position.toUpperCase()} AD SPACE (${width}x${height})
    </div>
  `;
}
