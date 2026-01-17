import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "warning" | "success" | "info" | "purple" | "blue";
export type ButtonSize = "sm" | "md" | "lg";

// Button 전용 props
interface BaseButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

// href가 없을 때 - button 타입
interface ButtonAsButton extends BaseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  href?: never;
  target?: never;
  rel?: never;
}

// href가 있을 때 - link 타입
interface ButtonAsLink extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  href: string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Button Component
 * href prop이 있으면 <a> 태그로, 없으면 <button> 태그로 렌더링
 */
export function Button({ children, variant = "primary", size = "md", loading = false, fullWidth = false, leftIcon, rightIcon, className = "", ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all " + "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " + "disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg focus-visible:ring-blue-500",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 focus-visible:ring-gray-500",
    outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    warning: "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg focus-visible:ring-amber-500",
    success: "bg-gradient-to-r from-teal-400 to-emerald-500 text-white hover:shadow-lg focus-visible:ring-teal-500",
    info: "bg-gradient-to-r from-cyan-400 to-sky-500 text-white hover:shadow-lg focus-visible:ring-cyan-500",
    purple: "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg focus-visible:ring-purple-500",
    blue: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg focus-visible:ring-blue-600",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {!loading && leftIcon && (
        <span className="inline-flex" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span className="inline-flex" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );

  // href가 있으면 Link로 렌더링
  if ("href" in props && props.href) {
    const { href, target, rel, ...restProps } = props;

    // 외부 링크인 경우
    if (href.startsWith("http") || href.startsWith("//")) {
      return (
        <a href={href} target={target} rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)} className={combinedClassName} {...(restProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {content}
        </a>
      );
    }

    // 내부 링크인 경우 (Next.js Link)
    return (
      <Link href={href} target={target} rel={rel} className={combinedClassName} {...(restProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </Link>
    );
  }

  // href가 없으면 button으로 렌더링
  const { type = "button", disabled, onClick, ...restProps } = props as ButtonAsButton;

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={combinedClassName} {...restProps}>
      {content}
    </button>
  );
}

// IconButton props - button과 link 모두 지원
interface BaseIconButtonProps {
  icon: React.ReactNode;
  "aria-label": string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
}

interface IconButtonAsButton extends BaseIconButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseIconButtonProps | "children"> {
  href?: never;
}

interface IconButtonAsLink extends BaseIconButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseIconButtonProps | "children"> {
  href: string;
}

export type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

/**
 * IconButton - 아이콘만 있는 Button
 */
export function IconButton({ icon, "aria-label": ariaLabel, size = "md", variant = "ghost", className = "", ...props }: IconButtonProps) {
  const sizeStyles: Record<ButtonSize, string> = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <Button variant={variant} size={size} className={`${sizeStyles[size]} ${className}`} aria-label={ariaLabel} {...(props as any)}>
      {icon}
    </Button>
  );
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}

/**
 * ButtonGroup - 여러 Button을 그룹화
 */
export function ButtonGroup({ children, orientation = "horizontal", className = "" }: ButtonGroupProps) {
  const orientationStyles = {
    horizontal: "flex-row",
    vertical: "flex-col",
  };

  return (
    <div className={`inline-flex ${orientationStyles[orientation]} gap-2 ${className}`} role="group">
      {children}
    </div>
  );
}
