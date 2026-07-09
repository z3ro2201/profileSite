"use client";

import React, { useState, useEffect } from "react";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarSection, SidebarMenuItem, SidebarOverlay } from "@/components/ui/Sidebar";
import { Header, HeaderContainer, HeaderTitle, HeaderSearch } from "@/components/ui/Header";
import { Logo } from "@/components/ui/Logo";
import { MenuButton, Icons } from "@/components/ui/MenuButton";
import { Button } from "@/components/ui/Button";
import { RssIcon, Redo2Icon } from "lucide-react";
export interface AdminLayoutProps {
  children: React.ReactNode;
  defaultActiveMenu?: string;
}
import { useAdminUi } from "@/layout/admin/AdminUiProvider";

import { SessionUserProp } from "@/types/Users";
import { usePathname } from "next/navigation";

export interface AdminLayoutProps {
  children: React.ReactNode;
  defaultActiveMenu?: string;
  isLoggedIn?: boolean;
  user?: SessionUserProp | null;
  onSignOut?: () => void;
  title?: string;
  breadcrumb?: string;
}

export function AdminLayout({ children, defaultActiveMenu = "tables", isLoggedIn = false, user = null, title = "", breadcrumb = "", onSignOut }: AdminLayoutProps) {
  const adminUi = useAdminUi();

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(defaultActiveMenu);

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

  const mainMenuItems = [
    { id: "대시보드", icon: Icons.Dashboard, label: "대시보드", link: "/admin/mgmt/dashboard", title: "대시보드" },
    { id: "글 작성", icon: Icons.Table, label: "글 작성", link: "/admin/mgmt/posts/write" },
    { id: "글 관리", icon: Icons.CreditCard, label: "글 관리", link: "/admin/mgmt/posts/list" },
    { id: "카테고리 관리", icon: Icons.VR, label: "카테고리 관리", link: "/admin/mgmt/categories" },
    { id: "프로젝트 관리", icon: Icons.CreditCard, label: "프로젝트 관리", link: "/admin/mgmt/projects" },
  ];

  const accountMenuItems = [
    { id: "내 정보", icon: Icons.User, label: "내 정보", link: "/admin/mgmt/users/me" },
    { id: "로그아웃", icon: Icons.UserPlus, label: "로그아웃", link: "/admin/logout" },
  ];

  // ✅ /admin/mgmt/post/123 형태 체크
  const isPostDetail = /^\/admin\/mgmt\/post\/\d+$/.test(pathname);
  // ✅ /admin/mgmt/post/123/modify 형태 체크
  const isPostModify = /^\/admin\/mgmt\/post\/\d+\/modify$/.test(pathname);

  const shouldShowItem = (itemId: string) => {
    const postOnlyIds = ["0", "1"];

    if (postOnlyIds.includes(itemId)) {
      return isPostDetail || isPostModify;
    }

    return true;
  };

  const postId = pathname.match(/\d+/)?.[0] ?? null;
  const blogMenuItems = [
    { id: "블로그", icon: RssIcon, label: "블로그", link: "/blog/posts" },
    { id: "현재 글 바로가기", icon: Redo2Icon, label: "현재 글 바로가기", link: `/blog/posts/view/${postId}` },
  ];

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Skip to main content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg">
        메인 콘텐츠로 건너뛰기
      </a>

      {/* Overlay */}
      <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <SidebarHeader onClose={() => setSidebarOpen(false)}>
          <Logo icon="Z" text="2ER0.IO" size="md" variant="default" />
        </SidebarHeader>

        <SidebarContent>
          {/* Main Menu */}
          <SidebarSection>
            {mainMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <SidebarMenuItem
                  key={item.id}
                  icon={<Icon />}
                  active={activeMenu === item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                    adminUi.setTitle(item.title ?? item.label);
                    adminUi.setBreadcrumb(["관리자", ` / ${item.title ?? item.label}`]);
                  }}
                  {...(item.link ? { link: item.link } : {})}
                >
                  {item.label}
                </SidebarMenuItem>
              );
            })}
          </SidebarSection>

          {/* 글 관리 */}
          {postId && (
            <SidebarSection title="글 관리" className="mt-4">
              {blogMenuItems.map((item) => (
                <SidebarMenuItem
                  key={item.id}
                  icon={<item.icon size={16} />}
                  active={activeMenu === item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  {...(item.link ? { link: item.link } : {})}
                >
                  {item.label}
                </SidebarMenuItem>
              ))}
            </SidebarSection>
          )}

          {/* Account Pages */}
          <SidebarSection title="계정 관리" className="mt-4">
            {accountMenuItems.map((item, id) => {
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
                  {...(item.link ? { link: item.link } : {})}
                >
                  {item.label}
                </SidebarMenuItem>
              );
            })}
          </SidebarSection>
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header transparent sticky>
          <HeaderContainer>
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} />
              <HeaderTitle title={adminUi.title || title} breadcrumb={adminUi.breadcrumb.join("") ?? breadcrumb} />
            </div>

            <div className="flex items-center gap-4">
              <HeaderSearch placeholder="Type here..." /> {/* 로그인 상태에 따른 버튼 */}
              {isLoggedIn && user && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-800">{user.name || user.email}</p>
                    {user.name && user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                  </div>
                  <button onClick={onSignOut} className="size-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="프로필 메뉴">
                    <span className="text-sm font-semibold text-gray-700">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</span>
                  </button>
                </div>
              )}
            </div>
          </HeaderContainer>
        </Header>

        {/* Main Content */}
        <main id="main-content" className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
