"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoSliderAd() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [adHtml, setAdHtml] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Skip rendering if user is premium
  const isPremium = user?.isPremium || false;

  // Don't show ads on login/register pages
  const isExcludedPage =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/sign-in") ||
      window.location.pathname.includes("/sign-up"));

  useEffect(() => {
    if (isPremium || isExcludedPage) return;

    // In a real implementation, fetch ad code from API
    const fetchAdCode = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock data
        const mockAdData = {
          enabled: true,
          html: `
            <div style="width:300px;height:200px;background:linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;font-weight:bold;">
              VIDEO AD CONTENT
            </div>
          `,
        };

        if (mockAdData.enabled) {
          setAdHtml(mockAdData.html);
          setIsEnabled(true);

          // Show ad after a delay
          setTimeout(() => {
            setIsVisible(true);
          }, 5000);
        }
      } catch (error) {
        console.error("Failed to load video ad:", error);
      }
    };

    fetchAdCode();

    // Cleanup
    return () => {
      setIsVisible(false);
    };
  }, [isPremium, isExcludedPage]);

  const closeAd = () => {
    setIsVisible(false);
  };

  if (isPremium || isExcludedPage || !isEnabled || !isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 right-0 z-50 p-4 transition-transform duration-300 transform"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <div className="relative bg-background border rounded-lg shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 z-10 h-6 w-6 bg-background/80 rounded-full"
          onClick={closeAd}
        >
          <X className="h-4 w-4" />
        </Button>

        <div
          className="ad-content"
          dangerouslySetInnerHTML={{ __html: adHtml }}
        />

        <div className="absolute top-0 left-0 bg-background/80 px-1 text-[10px] text-muted-foreground">
          Advertisement
        </div>
      </div>
    </div>
  );
}
