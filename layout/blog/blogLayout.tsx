"use client";

import React, { useState, useEffect } from "react";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarSection, SidebarMenuItem, SidebarOverlay } from "@/components/ui/Sidebar";
import { Header, HeaderContainer, HeaderTitle, HeaderSearch } from "@/components/ui/Header";
import { Logo } from "@/components/ui/Logo";
import { MenuButton, Icons } from "@/components/ui/MenuButton";

import { SessionUserProp } from "@/types/Users";
import { useBlogUi } from "./BlogUiProvider";
import { Category } from "@/types/Category";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface BlogLayoutProps {
  children: React.ReactNode;
  defaultActiveMenu?: string;
  isLoggedIn?: boolean;
  user?: SessionUserProp | null;
  onSignOut?: () => void;
  title?: string;
  breadcrumb?: string;
  categories: Category[];
}

export function BlogLayout({ children, defaultActiveMenu = "posts", categories, isLoggedIn = false, user = null, title = "블로그", breadcrumb = "", onSignOut }: BlogLayoutProps) {
  const adminUi = useBlogUi();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(defaultActiveMenu);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // ESC 키로 사이드바 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  // 사이드바 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  // 현재 선택된 카테고리의 부모들을 자동으로 펼침
  useEffect(() => {
    if (!currentCategory) return;

    const findCategoryPath = (cats: Category[], targetSlug: string): number[] => {
      for (const cat of cats) {
        if (cat.slug === targetSlug) {
          return [cat.id];
        }
        if (cat.children) {
          const childPath = findCategoryPath(cat.children, targetSlug);
          if (childPath.length > 0) {
            return [cat.id, ...childPath];
          }
        }
      }
      return [];
    };

    const path = findCategoryPath(categories, currentCategory);
    setExpandedIds(new Set(path));
  }, [currentCategory, categories]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 카테고리 재귀 렌더링
  const renderCategory = (category: Category, level = 0): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const isActive = currentCategory === category.slug;

    return (
      <div key={category.id} className="w-full">
        <div
          className={`
            flex items-center w-full px-3 py-2 rounded-lg
            hover:bg-gray-100 transition-colors
            ${isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"}
          `}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpand(category.id)} className="mr-2 p-0.5 hover:bg-gray-200 rounded" aria-label={isExpanded ? "접기" : "펼치기"}>
              {isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
            </button>
          ) : (
            <span className="w-6" />
          )}

          <Link href={`/blog/posts?category=${category.slug}`} className="flex-1 text-sm" onClick={() => setSidebarOpen(false)}>
            {category.name}
          </Link>
        </div>

        {hasChildren && isExpanded && <div className="mt-1">{category.children!.map((child) => renderCategory(child, level + 1))}</div>}
      </div>
    );
  };

  const accountMenuItems =
    isLoggedIn && user
      ? [
          { id: "dashboard", icon: Icons.Dashboard, label: "관리자", link: "/admin/mgmt/dashboard" },
          { id: "logout", icon: Icons.UserPlus, label: "로그아웃", link: "/admin/logout" },
        ]
      : [{ id: "login", icon: Icons.User, label: "로그인", link: "/admin/login" }];

  return (
    <div className="min-h-screen flex font-sans">
      {/* Skip to main content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg">
        메인 콘텐츠로 건너뛰기
      </a>

      {/* Overlay */}
      <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <SidebarHeader onClose={() => setSidebarOpen(false)}>
          <Logo icon="Z" text="2ER0 블로그" size="md" variant="default" />
        </SidebarHeader>

        <SidebarContent>
          <Link href="/s3" className="mt-4 block text-xs font-semibold text-gray-800 uppercase tracking-wider px-4 mb-3">
            처음화면
          </Link>

          <Link href="/s3/profile" className="mt-4 block text-xs font-semibold text-gray-800 uppercase tracking-wider px-4 mb-3">
            프로필
          </Link>

          <Link href="/blog/prologue" className="mt-4 block text-xs font-semibold text-gray-800 uppercase tracking-wider px-4 mb-3">
            프롤로그
          </Link>

          {/* 전체 글 보기 */}
          <Link href="/blog/posts" className="mt-4 block text-xs font-semibold text-gray-800 uppercase tracking-wider px-4 mb-3">
            전체 글
          </Link>

          {/* 카테고리 목록 */}
          <SidebarSection title="카테고리" className="mt-4">
            <div className="space-y-1">{categories.map((category) => renderCategory(category))}</div>
          </SidebarSection>

          {/* 계정 관리 */}
          <SidebarSection title="계정" className="mt-4">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem
                  key={item.id}
                  icon={<Icon />}
                  active={activeMenu === item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  link={item.link}
                >
                  {item.label}
                </SidebarMenuItem>
              );
            })}
          </SidebarSection>
        </SidebarContent>

        <SidebarFooter>
          <div className="text-xs text-gray-500 text-center">
            <p>© 2024 2ER0</p>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header transparent sticky>
          <HeaderContainer>
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} />
              <HeaderTitle title={adminUi.title || title} breadcrumb={adminUi.breadcrumb.join("") || breadcrumb} />
            </div>

            <div className="flex items-center gap-4">
              <HeaderSearch placeholder="검색..." />
              {isLoggedIn && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-800">{user.name || user.email}</p>
                    {user.name && user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                  </div>
                  <button onClick={onSignOut} className="size-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="프로필 메뉴">
                    <span className="text-sm font-semibold text-gray-700">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</span>
                  </button>
                </div>
              ) : (
                <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
              )}
            </div>
          </HeaderContainer>
        </Header>

        {/* Main Content */}
        <main id="main-content" className="w-full xl:w-[calc(100%-255px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default BlogLayout;
