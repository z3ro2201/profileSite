import React from "react";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
  sticky?: boolean;
  transparent?: boolean;
}

/**
 * Header Component
 * 페이지 상단 헤더
 */
export function Header({ children, className = "", sticky = true, transparent = false, ...props }: HeaderProps) {
  const stickyClass = sticky ? "sticky top-0" : "";
  const bgClass = transparent ? "bg-white/70 backdrop-blur-sm" : "bg-white";

  return (
    <header className={`${bgClass} border-b border-gray-200 px-4 lg:px-8 py-4 z-10 ${stickyClass} ${className}`} {...props}>
      {children}
    </header>
  );
}

export interface HeaderContainerProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * HeaderContainer
 * 헤더 내부 레이아웃 (왼쪽/오른쪽 정렬)
 */
export function HeaderContainer({ left, right, children, className = "" }: HeaderContainerProps) {
  if (children) {
    return <div className={`flex items-center justify-between ${className}`}>{children}</div>;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {left && <div className="flex items-center gap-4">{left}</div>}
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  );
}

export interface HeaderTitleProps {
  title: string;
  breadcrumb?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * HeaderTitle
 * 헤더 타이틀 + Breadcrumb
 */
export function HeaderTitle({ title, breadcrumb, icon, className = "" }: HeaderTitleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {icon && <div className="flex items-center justify-center">{icon}</div>}
      <div>
        {breadcrumb && (
          <nav aria-label="Breadcrumb">
            <p className="text-xs text-gray-500 mb-1">{breadcrumb}</p>
          </nav>
        )}
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
    </div>
  );
}

export interface HeaderSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * HeaderSearch
 * 헤더 검색 입력
 */
export function HeaderSearch({ placeholder = "Type here...", className = "", ...props }: HeaderSearchProps) {
  return (
    <>
      <form method="get">
        <input type="hidden" name="scope" value="all" />
        <label htmlFor="header-search-input" className="sr-only">
          검색
        </label>
        <input id="header-search-input" name="q" type="search" placeholder={placeholder} className={`hidden sm:block px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`} aria-label="페이지 검색" {...props} />
      </form>
    </>
  );
}

export interface HeaderActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * HeaderActions
 * 헤더 우측 액션 영역
 */
export function HeaderActions({ children, className = "" }: HeaderActionsProps) {
  return <div className={`flex items-center gap-4 ${className}`}>{children}</div>;
}

export interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  separator?: string;
  className?: string;
}

/**
 * Breadcrumb
 * Breadcrumb 네비게이션
 */
export function Breadcrumb({ items, separator = "/", className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-xs text-gray-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.href ? (
              <a href={item.href} className="hover:text-gray-700 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={index === items.length - 1 ? "text-gray-700 font-medium" : ""}>{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="text-gray-400">
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface HeaderLeftProps {
  menuButton?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * HeaderLeft
 * 헤더 왼쪽 영역 (메뉴 버튼 + 타이틀)
 */
export function HeaderLeft({ menuButton, title, children, className = "" }: HeaderLeftProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {menuButton}
      {title}
      {children}
    </div>
  );
}

export interface HeaderRightProps {
  search?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * HeaderRight
 * 헤더 오른쪽 영역 (검색 + 액션)
 */
export function HeaderRight({ search, actions, children, className = "" }: HeaderRightProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {search}
      {actions}
      {children}
    </div>
  );
}
