import React from "react";
import Link from "next/link";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Sidebar Component
 * 반응형 사이드바 컨테이너
 */
export function Sidebar({ children, isOpen = false, onClose, className = "", ...props }: SidebarProps) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-550
        w-64 bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${className}
      `}
      aria-label="주 내비게이션"
      role="navigation"
      {...props}
    >
      {children}
    </aside>
  );
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * SidebarHeader
 * 사이드바 상단 영역 (로고, 닫기 버튼)
 */
export function SidebarHeader({ children, showCloseButton = true, onClose, className = "", ...props }: SidebarHeaderProps) {
  return (
    <div className={`p-6 border-b border-gray-100 ${className}`} {...props}>
      <div className="flex items-center justify-between gap-3">
        {children}
        {showCloseButton && onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label="내비게이션 메뉴 닫기" type="button">
            <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export interface SidebarContentProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * SidebarContent
 * 사이드바 메인 콘텐츠 영역
 */
export function SidebarContent({ children, className = "", ...props }: SidebarContentProps) {
  return (
    <nav className={`flex-1 px-4 py-6 overflow-y-auto ${className}`} aria-label="메인 메뉴" {...props}>
      {children}
    </nav>
  );
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * SidebarFooter
 * 사이드바 하단 영역
 */
export function SidebarFooter({ children, className = "", ...props }: SidebarFooterProps) {
  return (
    <div className={`p-4 border-t border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SidebarSection
 * 사이드바 섹션 (제목 + 메뉴 그룹)
 */
export function SidebarSection({ title, children, className = "", ...props }: SidebarSectionProps) {
  return (
    <div className={className} {...props}>
      {title && <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">{title}</h2>}
      <ul className="space-y-1" role="list">
        {children}
      </ul>
    </div>
  );
}

export interface SidebarMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
  link?: string;
  onClick?: () => void;
}

const baseClass = `
  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
  transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
`;

/**
 * SidebarMenuItem
 * 사이드바 메뉴 아이템
 */
export function SidebarMenuItem({ icon, children, link, active = false, badge, onClick, className = "", ...props }: SidebarMenuItemProps) {
  const commonClassName = `
    ${baseClass}
    ${active ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}
    ${className}
  `;

  const content = (
    <>
      {icon && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{children}</span>
      {badge && <span className="inline-flex shrink-0">{badge}</span>}
    </>
  );

  return (
    <li>
      {link ? (
        <Link href={link} prefetch={false} onClick={onClick} className={commonClassName} aria-current={active ? "page" : undefined}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={commonClassName} aria-current={active ? "page" : undefined} {...props}>
          {content}
        </button>
      )}
    </li>
  );
}

export interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SidebarOverlay
 * 모바일에서 사이드바 열릴 때 배경 오버레이
 */
export function SidebarOverlay({ isOpen, onClose }: SidebarOverlayProps) {
  if (!isOpen) return null;

  return <div className="fixed inset-0 bg-black/50 z-500 lg:hidden" onClick={onClose} aria-hidden="true" />;
}
