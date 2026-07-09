import type { CSSProperties } from "react";

// ── shared style tokens (season4) ─────────────────────────────────
// TEAL/mono는 FloatingNav(s4+blog 공용)와 같이 쓰는 값이라 lib/nav-shared에서 가져옴.
export { TEAL, mono } from "@/lib/nav-shared";

export const BG = "var(--background)";

export const serif = { fontFamily: "'Fraunces', serif", fontOpticalSizing: "auto" } as CSSProperties;
export const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" } as CSSProperties;

// ── tile helpers ──────────────────────────────────────────────────────────
export const tile =
  "rounded-2xl border border-[rgba(26,26,22,0.08)] bg-[var(--card)] p-5 flex flex-col overflow-hidden";
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

export type FilterKey = "전체" | "Web" | "App" | "PHP" | "Node.js";
export const FILTERS: FilterKey[] = ["전체", "Web", "App", "PHP", "Node.js"];

// ── nav ───────────────────────────────────────────────────────────────────
export type S4NavKey = "home" | "profile" | "project" | "ui";
