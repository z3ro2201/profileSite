import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button Component
 * 다양한 스타일과 상태를 지원하는 버튼 컴포넌트
 */
export function Button({ children, variant = "primary", size = "md", disabled = false, loading = false, fullWidth = false, leftIcon, rightIcon, type = "button", className = "", onClick, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg focus-visible:ring-blue-500",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 focus-visible:ring-gray-500",
    outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`} {...props}>
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
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon"> {
  icon: React.ReactNode;
  "aria-label": string;
}

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
    <Button variant={variant} size={size} className={`${sizeStyles[size]} ${className}`} aria-label={ariaLabel} {...props}>
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
