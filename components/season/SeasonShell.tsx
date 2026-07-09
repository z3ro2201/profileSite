"use client";

import { Github, Mail, Sun, Moon } from "lucide-react";
import { BG, mono, serif, sans, TEAL } from "@/app/s4/_lib/theme";
import { PROFILE } from "@/lib/profile";
import { useNavTheme } from "@/components/theme/NavThemeContext";
import "@/app/s4/_lib/s4-theme.css";

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-black/6 dark:hover:bg-white/8 transition-colors"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

// season5가 오면: 이 컴포넌트 내부(색/폰트/헤더 마크업)만 새 시즌 것으로 바꾸면 됨.
// /blog, /privacy처럼 이 셸을 쓰는 페이지들은 코드 수정 없이 자동으로 새 시즌 룩을 따라감.
export function SeasonShell({ children }: { children: React.ReactNode }) {
  // 다크모드 상태는 NavThemeContext(ClientShell에서 제공)를 공유해서 씀.
  // 다른 페이지의 FloatingNav도 같은 상태를 보기 때문에, 여기서 토글하면 그쪽에도 그대로 반영됨.
  const { isDark, toggle } = useNavTheme();

  return (
    <div className={`s4-root s4-page min-h-screen${isDark ? " dark" : ""}`} style={{ background: BG, ...sans }}>
      {/* ── skip nav ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium focus:text-white"
        style={{ background: TEAL }}
      >
        본문으로 바로가기
      </a>

      {/* ── header ── */}
      <header
        role="banner"
        className="fixed top-0 inset-x-0 z-40 px-5 sm:px-8 h-14 flex items-center justify-between"
        style={
          {
            background: isDark ? "rgba(17,17,16,0.85)" : "rgba(250,250,248,0.7)",
            backdropFilter: "blur(16px) saturate(160%)",
            WebkitBackdropFilter: "blur(16px) saturate(160%)",
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(26,26,22,0.07)",
          } as React.CSSProperties
        }
      >
        {/* name + tagline */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base font-medium text-foreground flex-shrink-0" style={serif}>
            {PROFILE.name}
            <span style={{ color: TEAL }}>.</span>
          </span>
          <span className="hidden sm:block w-px h-3.5 bg-black/12 flex-shrink-0" />
          <span className="hidden sm:block text-xs text-muted-foreground truncate" style={mono}>
            {PROFILE.shortTagline}
          </span>
        </div>

        {/* links + dark mode toggle */}
        <div className="flex items-center gap-1">
          <ThemeToggle isDark={isDark} onToggle={toggle} />
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all duration-150"
            style={mono}
          >
            <Github size={13} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href={`mailto:${PROFILE.email}`}
            aria-label="Email"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all duration-150"
            style={mono}
          >
            <Mail size={13} />
            <span className="hidden sm:inline">{PROFILE.email}</span>
          </a>
        </div>
      </header>

      {/* ── bottom blur mask ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
        style={
          {
            height: "140px",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            maskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          } as React.CSSProperties
        }
      />
      {/* subtle colour tint on top of blur */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
        style={{
          height: "140px",
          background: isDark
            ? "linear-gradient(to top, rgba(17,17,16,0.95) 0%, rgba(17,17,16,0.6) 45%, transparent 100%)"
            : "linear-gradient(to top, rgba(250,250,248,0.95) 0%, rgba(250,250,248,0.6) 45%, transparent 100%)",
        }}
      />

      {/* ── page content ── */}
      {/* 하단 플로팅 네비/플레이어는 ClientShell에서 SEASON_SHELL_PATHS 경로들에 공용으로 렌더링됨 */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 pb-36">
        {children}
      </main>

      {/* ── reduce motion ── */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
