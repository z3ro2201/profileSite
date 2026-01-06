"use client";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

const MarqueeTitle = ({ text, className }: { text: string; className?: string }) => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  // 길 때만 흐르게
  useEffect(() => {
    const check = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;
      setShouldScroll(inner.scrollWidth > outer.clientWidth + 2);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  return (
    <div ref={outerRef} className={cn("overflow-hidden whitespace-nowrap", className)}>
      {shouldScroll ? (
        <div className="marquee-track">
          <span ref={innerRef} className="marquee-item">
            {text}
          </span>
          {/* 끊김 방지용 복제 */}
          <span className="marquee-item" aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <div ref={innerRef} className="truncate">
          {text}
        </div>
      )}
    </div>
  );
};

export default MarqueeTitle;
