import React from "react";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  role?: string;
  ariaLabel?: string;
}

/**
 * Badge Component
 * 상태, 카테고리 등을 표시하는 배지 컴포넌트
 */
export function Badge({ children, variant = "neutral", size = "md", className = "", role, ariaLabel, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors";

  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-100 text-emerald-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-gray-100 text-gray-600",
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} role={role || "status"} aria-label={ariaLabel} {...props}>
      {children}
    </span>
  );
}

export interface StatusBadgeProps extends Omit<BadgeProps, "children" | "variant"> {
  status: "online" | "offline";
  labels?: {
    online: string;
    offline: string;
  };
}

/**
 * StatusBadge - 온라인/오프라인 상태 전용 Badge
 */
export function StatusBadge({ status, labels = { online: "ONLINE", offline: "OFFLINE" }, ...props }: StatusBadgeProps) {
  const isOnline = status === "online";

  return (
    <Badge variant={isOnline ? "success" : "neutral"} ariaLabel={`상태: ${isOnline ? "온라인" : "오프라인"}`} {...props}>
      {isOnline ? labels.online : labels.offline}
    </Badge>
  );
}

export interface CountBadgeProps extends Omit<BadgeProps, "children"> {
  count: number;
  max?: number;
  showZero?: boolean;
}

/**
 * CountBadge - 숫자 카운트 전용 Badge
 */
export function CountBadge({ count, max = 99, showZero = false, ...props }: CountBadgeProps) {
  if (!showZero && count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant="info" size="sm" ariaLabel={`${count}개의 항목`} {...props}>
      {displayCount}
    </Badge>
  );
}
