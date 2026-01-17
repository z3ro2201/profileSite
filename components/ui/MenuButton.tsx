import React from "react";

export interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 메뉴가 열려있는지 여부
   */
  isOpen?: boolean;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * MenuButton (햄버거 메뉴)
 * 모바일에서 사이드바를 여는 버튼
 */
export function MenuButton({ isOpen = false, className = "", ...props }: MenuButtonProps) {
  return (
    <button
      className={`
        lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${className}
      `}
      aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
      aria-expanded={isOpen}
      type="button"
      {...props}
    >
      <svg className="size-5 text-gray-600 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <>
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </>
        )}
      </svg>
    </button>
  );
}

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * CloseButton
 * X 아이콘 닫기 버튼
 */
export function CloseButton({ className = "", ...props }: CloseButtonProps) {
  return (
    <button
      className={`
        p-2 rounded-lg hover:bg-gray-100 transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${className}
      `}
      aria-label="닫기"
      type="button"
      {...props}
    >
      <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

/**
 * 아이콘 컴포넌트들
 */
export const Icons = {
  Dashboard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
    </svg>
  ),

  Table: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <line x1="3" y1="9" x2="21" y2="9" strokeWidth="2" />
      <line x1="9" y1="21" x2="9" y2="9" strokeWidth="2" />
    </svg>
  ),

  CreditCard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
      <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
    </svg>
  ),

  Globe: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
    </svg>
  ),

  User: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
      <circle cx="12" cy="7" r="4" strokeWidth="2" />
    </svg>
  ),

  LogIn: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeWidth="2" />
      <polyline points="10 17 15 12 10 7" strokeWidth="2" />
      <line x1="15" y1="12" x2="3" y2="12" strokeWidth="2" />
    </svg>
  ),

  UserPlus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
      <circle cx="8.5" cy="7" r="4" strokeWidth="2" />
      <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2" />
      <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2" />
    </svg>
  ),

  VR: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M2 12C2 6.5 6.5 2 12 2s10 4.5 10 10-4.5 10-10 10S2 17.5 2 12z" strokeWidth="2" />
      <path d="M12 2v20M2 12h20" strokeWidth="2" />
    </svg>
  ),

  Settings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
      <path d="M12 1v6m0 6v6M3.2 9l5.2 3m6 0l5.2-3M3.2 15l5.2-3m6 0l5.2 3" strokeWidth="2" />
    </svg>
  ),

  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  ChevronRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  Search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  Bell: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" />
    </svg>
  ),
};
