"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { VisitorData } from "@/types/Analytics";

const VisitorTrackerContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackVisit = async (): Promise<void> => {
      try {
        const shouldSkipTracking = (path: string): boolean => {
          if (path.startsWith("/api")) return true;
          if (path.startsWith("/admin")) return true;
          if (path.startsWith("/_next")) return true;
          return false;
        };

        if (shouldSkipTracking(pathname)) {
          if (process.env.NODE_ENV === "development") {
            console.log("⏭️ Tracking skipped:", pathname);
          }
          return;
        }

        let visitorId = localStorage.getItem("visitor_id");
        if (!visitorId) {
          visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("visitor_id", visitorId);
        }

        let sessionId = sessionStorage.getItem("session_id");
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem("session_id", sessionId);
        }

        const getDeviceType = (): string => {
          const ua = navigator.userAgent;
          if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
          if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
          return "Desktop";
        };

        const getBrowser = (): string => {
          const ua = navigator.userAgent;
          if (ua.includes("Firefox")) return "Firefox";
          if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
          if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
          if (ua.includes("Edg")) return "Edge";
          if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
          return "Unknown";
        };

        const getOS = (): string => {
          const ua = navigator.userAgent;
          if (ua.includes("Win")) return "Windows";
          if (ua.includes("Mac")) return "MacOS";
          if (ua.includes("Linux")) return "Linux";
          if (ua.includes("Android")) return "Android";
          if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
          return "Unknown";
        };

        const data: VisitorData = {
          visitor_id: visitorId,
          session_id: sessionId,
          page_path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
          referrer: document.referrer || "Direct",
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
        };

        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Tracked:", pathname);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Tracking error:", error);
        }
      }
    };

    trackVisit();
  }, [pathname, searchParams]);

  return null;
};

// Suspense로 감싸서 export
const VisitorTracker = () => {
  return (
    <Suspense fallback={null}>
      <VisitorTrackerContent />
    </Suspense>
  );
};

export default VisitorTracker;
