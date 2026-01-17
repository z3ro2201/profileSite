import React from "react";

export type LogoSize = "sm" | "md" | "lg";
export type LogoVariant = "default" | "gradient" | "outline";

export interface LogoProps {
  /**
   * 로고 텍스트 또는 이미지
   */
  text?: string;
  /**
   * 로고 이미지 소스
   */
  src?: string;
  /**
   * 로고 크기
   */
  size?: LogoSize;
  /**
   * 로고 스타일 변형
   */
  variant?: LogoVariant;
  /**
   * 아이콘 (텍스트 왼쪽에 표시)
   */
  icon?: React.ReactNode;
  /**
   * 클릭 핸들러
   */
  onClick?: () => void;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * Logo Component
 * 브랜드 로고를 표시하는 컴포넌트
 */
export function Logo({ text, src, size = "md", variant = "default", icon, onClick, className = "" }: LogoProps) {
  const sizeStyles: Record<LogoSize, { container: string; icon: string; text: string; image: string }> = {
    sm: {
      container: "gap-2",
      icon: "size-6 text-xs",
      text: "text-sm",
      image: "h-6",
    },
    md: {
      container: "gap-3",
      icon: "size-8 text-sm",
      text: "text-base",
      image: "h-8",
    },
    lg: {
      container: "gap-4",
      icon: "size-10 text-base",
      text: "text-lg",
      image: "h-10",
    },
  };

  const variantStyles: Record<LogoVariant, string> = {
    default: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
    gradient: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white",
    outline: "border-2 border-gray-300 text-gray-700",
  };

  const styles = sizeStyles[size];
  const isClickable = !!onClick;

  const content = (
    <>
      {src ? (
        <img src={src} alt={text || "Logo"} className={`${styles.image} object-contain`} />
      ) : icon ? (
        <div className={`${styles.icon} ${variantStyles[variant]} rounded-lg flex items-center justify-center font-bold`} role="img" aria-label={`${text} 로고`}>
          {icon}
        </div>
      ) : null}

      {text && <span className={`font-semibold text-gray-800 ${styles.text}`}>{text}</span>}
    </>
  );

  if (isClickable) {
    return (
      <button type="button" onClick={onClick} className={`flex items-center ${styles.container} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg ${className}`}>
        {content}
      </button>
    );
  }

  return <div className={`flex items-center ${styles.container} ${className}`}>{content}</div>;
}

export interface LogoIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 아이콘 내용 (텍스트 또는 SVG)
   */
  children: React.ReactNode;
  /**
   * 크기
   */
  size?: LogoSize;
  /**
   * 스타일 변형
   */
  variant?: LogoVariant;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * LogoIcon
 * 로고 아이콘만 표시하는 컴포넌트
 */
export function LogoIcon({ children, size = "md", variant = "default", className = "", ...props }: LogoIconProps) {
  const sizeStyles: Record<LogoSize, string> = {
    sm: "size-6 text-xs",
    md: "size-8 text-sm",
    lg: "size-10 text-base",
  };

  const variantStyles: Record<LogoVariant, string> = {
    default: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
    gradient: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white",
    outline: "border-2 border-gray-300 text-gray-700",
  };

  return (
    <div className={`${sizeStyles[size]} ${variantStyles[variant]} rounded-lg flex items-center justify-center font-bold ${className}`} role="img" {...props}>
      {children}
    </div>
  );
}

export interface LogoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 로고 텍스트
   */
  children: React.ReactNode;
  /**
   * 크기
   */
  size?: LogoSize;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * LogoText
 * 로고 텍스트만 표시하는 컴포넌트
 */
export function LogoText({ children, size = "md", className = "", ...props }: LogoTextProps) {
  const sizeStyles: Record<LogoSize, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span className={`font-semibold text-gray-800 ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
