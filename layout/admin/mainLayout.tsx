"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  FolderTree,
  Briefcase,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { TEAL, mono } from "@/lib/nav-shared";
import { serif } from "@/app/s4/_lib/theme";
import { PROFILE } from "@/lib/profile";
import type { SessionUserProp } from "@/types/Users";

export interface AdminLayoutProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  user?: SessionUserProp | null;
}

const NAV_ITEMS = [
  { label: "대시보드", href: "/admin/mgmt/dashboard", icon: LayoutDashboard },
  { label: "방문자 분석", href: "/admin/mgmt/analytics", icon: BarChart2 },
  { label: "글 관리", href: "/admin/mgmt/posts/list", icon: FileText },
  { label: "카테고리 관리", href: "/admin/mgmt/categories", icon: FolderTree },
  { label: "프로젝트 관리", href: "/admin/mgmt/projects", icon: Briefcase },
] as const;

// pathname → 상단 타이틀. useAdminUi 컨텍스트(클릭 시점에만 갱신되던 예전 방식)보다
// pathname 기반이 새로고침/뒤로가기에도 항상 정확해서 이 방식으로 교체함.
const titleForPathname = (pathname: string): string => {
  if (pathname.startsWith("/admin/mgmt/dashboard")) return "대시보드";
  if (pathname.startsWith("/admin/mgmt/analytics")) return "방문자 분석";
  if (pathname.startsWith("/admin/mgmt/posts/write")) return "글 작성";
  if (/\/admin\/mgmt\/posts\/\d+\/modify/.test(pathname)) return "글 수정";
  if (/\/admin\/mgmt\/posts\/\d+/.test(pathname)) return "글 보기";
  if (pathname.startsWith("/admin/mgmt/posts")) return "글 관리";
  if (pathname.startsWith("/admin/mgmt/categories")) return "카테고리 관리";
  if (pathname.startsWith("/admin/mgmt/projects")) return "프로젝트 관리";
  if (pathname.startsWith("/admin/mgmt/users")) return "내 정보";
  return "관리자";
};

const DARK_STORAGE_KEY = "admin-theme";

export function AdminLayout({ children, isLoggedIn = false, user = null }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // 로그인 페이지와 톤을 맞추되, 관리자 패널 자체는 SeasonShell 스코프 밖이라
  // 다크모드 상태를 자체적으로 들고 있음 (localStorage에 기억).
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(DARK_STORAGE_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회만 저장된 테마 값 반영
    if (stored === "dark") setIsDark(true);
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      window.localStorage.setItem(DARK_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const title = titleForPathname(pathname);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const initial = (user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium focus:text-white"
          style={{ background: TEAL }}
        >
          메인 콘텐츠로 건너뛰기
        </a>

        {/* mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* sidebar */}
        <aside
          className={`flex flex-col gap-1 p-3 border-r border-border flex-shrink-0 ${
            sidebarOpen ? "fixed inset-y-0 left-0 z-50 w-56" : "hidden"
          } md:sticky md:top-0 md:flex md:h-screen md:w-56`}
          style={{ background: "var(--card)" }}
        >
          <div className="flex items-center justify-between px-2 py-3 mb-2">
            <span className="text-base font-medium text-foreground" style={serif}>
              {PROFILE.name}
              <span style={{ color: TEAL }}>.</span>
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-muted-foreground"
              aria-label="사이드바 닫기"
            >
              <X size={14} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                style={
                  isActive(href)
                    ? { background: "rgba(35,198,169,0.1)", color: TEAL, fontWeight: 500 }
                    : { color: "var(--muted-foreground)" }
                }
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-3 border-t border-border flex flex-col gap-1">
            <Link
              href="/admin/mgmt/users/me"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
              style={
                isActive("/admin/mgmt/users")
                  ? { background: "rgba(35,198,169,0.1)", color: TEAL, fontWeight: 500 }
                  : { color: "var(--muted-foreground)" }
              }
            >
              <User size={15} />내 정보
            </Link>
            <Link
              href="/admin/logout"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              <LogOut size={15} />
              로그아웃
            </Link>
            <button
              onClick={toggleDark}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? "라이트 모드" : "다크 모드"}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              <ChevronLeft size={15} />
              사이트로 돌아가기
            </Link>
          </div>
        </aside>

        {/* main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex items-center gap-3 px-4 sm:px-6 border-b border-border flex-shrink-0 sticky top-0 z-30"
            style={{ background: "var(--card)", height: 52 }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-muted-foreground"
              aria-label="사이드바 열기"
            >
              <Menu size={16} />
            </button>
            <span className="text-xs text-muted-foreground" style={mono}>
              {title}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {isLoggedIn && user && (
                <>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-medium text-foreground">{user.name || user.email}</p>
                    {user.name && user.email && <p className="text-[10px] text-muted-foreground">{user.email}</p>}
                  </div>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium text-white flex-shrink-0"
                    style={{ background: TEAL }}
                  >
                    {initial}
                  </div>
                </>
              )}
            </div>
          </div>

          <main id="main-content" className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
