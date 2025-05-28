"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export function PopUnderAd() {
  const { user } = useAuth();

  // Skip rendering if user is premium
  const isPremium = user?.isPremium || false;

  // Don't show ads on login/register pages
  const isExcludedPage =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/sign-in") ||
      window.location.pathname.includes("/sign-up"));

  useEffect(() => {
    if (isPremium || isExcludedPage) return;

    // In a real implementation, fetch ad code from API and execute it
    const fetchAndExecuteAdCode = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Mock data
        const mockAdData = {
          enabled: true,
          script: `
            // This would be the third-party pop-under ad code
            // For safety in this demo, we're just logging instead of executing
            console.log('Pop-under ad would execute here');
          `,
        };

        if (mockAdData.enabled) {
          // In a real implementation, you would execute the script
          // For safety, we're just logging
          console.log("Pop-under ad would be triggered here");

          // IMPORTANT: In a real implementation, you would need to:
          // 1. Create a script element
          // 2. Set its content to the ad code
          // 3. Append it to the document
          // This is commented out for safety
          /*
          const script = document.createElement('script');
          script.text = mockAdData.script;
          document.body.appendChild(script);
          */
        }
      } catch (error) {
        console.error("Failed to load pop-under ad:", error);
      }
    };

    // Only execute once per session
    const hasExecuted = sessionStorage.getItem("popUnderExecuted");
    if (!hasExecuted) {
      fetchAndExecuteAdCode();
      sessionStorage.setItem("popUnderExecuted", "true");
    }
  }, [isPremium, isExcludedPage]);

  // This component doesn't render anything visible
  return null;
}
