import * as LucideIcons from "lucide-react";
import { StickyNote, type LucideIcon } from "lucide-react";

const DEFAULT_ICON: LucideIcon = StickyNote;

// lucide-react가 아이콘이 아닌 것도 같이 export하고 있어서(icons 맵, createLucideIcon 등),
// "실제 아이콘 컴포넌트만" 걸러내려고 이름이 대문자로 시작하는 것만 후보로 봄.
const iconRegistry = LucideIcons as unknown as Record<string, LucideIcon>;

const isIconComponent = (v: unknown): v is LucideIcon =>
  typeof v === "object" && v !== null && "render" in v;

/**
 * 저장된 아이콘 이름(자유 입력이라 오타 가능)을 실제 아이콘 컴포넌트로 변환.
 * 없거나 잘못된 이름이면 조용히 기본 아이콘으로 대체 — 화면이 깨지지 않게.
 */
export function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return DEFAULT_ICON;
  const trimmed = name.trim();
  if (!trimmed) return DEFAULT_ICON;
  const found = iconRegistry[trimmed];
  return isIconComponent(found) ? found : DEFAULT_ICON;
}

/** 관리자 화면에서 "이 이름 진짜 존재하는 아이콘 맞아?" 미리보기용 */
export function isValidIconName(name?: string | null): boolean {
  if (!name?.trim()) return true; // 비어있으면 "기본값 씀" 상태라 에러 아님
  return isIconComponent(iconRegistry[name.trim()]);
}
