"use client";

import { useState } from "react";
import Player from "@/components/player";
import { FloatingNav } from "@/components/FloatingNav";
import { NavThemeProvider } from "@/components/theme/NavThemeContext";
import { matchesSeasonShellPath } from "@/lib/season-shell-paths";
import { usePathname } from "next/navigation";

const LEGACY_EXCLUDED_PATHS = ["/admin", "/s2", "/tools"] as const;

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bgImage, setBgImage] = useState<string>("");

  // SEASON_SHELL_PATHS(/blog, /s4, /privacy, ...) + admin/s2/tools는
  // 배경이미지도, 기존 Player도 안 보여줌 (그 경로들엔 자기만의 레이아웃이 따로 있음)
  const isExcluded =
    matchesSeasonShellPath(pathname) ||
    LEGACY_EXCLUDED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // FloatingNav(+플레이어)는 SEASON_SHELL_PATHS에서만 노출. s2/s3/admin/tools는 제외.
  const showFloatingNav = matchesSeasonShellPath(pathname);

  const content = showFloatingNav ? (
    <NavThemeProvider>
      {children}
      <FloatingNav />
    </NavThemeProvider>
  ) : (
    children
  );

  if (!isExcluded) {
    return (
      <>
        <div
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            overflow: "auto",
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {content}
        </div>

        <Player onBgImageChange={setBgImage} />
      </>
    );
  }

  return <>{content}</>;
}
