import type { CSSProperties } from "react";

// ── shared style tokens (season4) ─────────────────────────────────
// TEAL/mono는 FloatingNav(s4+blog 공용)와 같이 쓰는 값이라 lib/nav-shared에서 가져옴.
export { TEAL, mono } from "@/lib/nav-shared";

export const BG = "var(--background)";

export const serif = { fontFamily: "'Fraunces', serif", fontOpticalSizing: "auto" } as CSSProperties;
export const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" } as CSSProperties;

// ── tile helpers ──────────────────────────────────────────────────────────
// border-[rgba(26,26,22,0.08)]처럼 색을 고정하면 다크모드에서 배경과 거의 같은 색이 돼서
// 경계가 안 보임. border-border(=var(--border), 라이트/다크 각각 정의됨)로 통일.
export const tile = "rounded-2xl border border-border bg-[var(--card)] p-5 flex flex-col overflow-hidden";
export const tileTeal = "rounded-2xl border border-[rgba(35,198,169,0.25)] p-5 flex flex-col overflow-hidden";
export const tileDark = "rounded-2xl p-5 flex flex-col overflow-hidden";

// ── detail types ──────────────────────────────────────────────────────────
export interface DetailItem {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: string;
  color: string;
  period: string;
  contribution: string;
  url?: string;
  github?: string;
  body: string;
  stack: { label: string; items: string[] }[];
  year?: number;
  tags?: string[];
}

// ── home page data ────────────────────────────────────────────────────────
export const TECH_STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "PWA",
  "MySQL",
  "MariaDB",
  "Tailwind",
  "PHP",
  "tailwindcss",
  "claude",
  "Git",
];

export type FilterKey = "전체" | "웹" | "앱" | "도구" | "게임";
export const FILTERS: FilterKey[] = ["전체", "웹", "앱", "도구", "게임"];
export const FILTER_ICON: Record<Exclude<FilterKey, "전체">, string> = { 웹: "🌐", 앱: "📱", 도구: "🔧", 게임: "🎮" };

// ── nav ───────────────────────────────────────────────────────────────────
export type S4NavKey = "home" | "profile" | "project" | "ui";
