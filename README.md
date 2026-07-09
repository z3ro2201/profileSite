# 시즌 셸 공용화 (season5 대비)

## 신규 파일
- `lib/season-shell-paths.ts` — `SEASON_SHELL_PATHS` 배열. 새 유틸리티 페이지를 "현재 시즌처럼" 보이게 하려면 여기에 경로만 추가.
- `components/season/SeasonShell.tsx` — `app/s4/layout.tsx`에 있던 헤더/다크모드/배경 로직을 통째로 이동. season5가 오면 이 파일 내부만 새로 고치면 됨.
- `app/privacy/layout.tsx` — `/privacy`에 SeasonShell 적용 (URL은 그대로 `/privacy` 유지).

## 수정 파일
- `app/s4/layout.tsx` — `SeasonShell`을 감싸는 3줄짜리 얇은 래퍼로 교체
- `layout/ClientShell.tsx` — 하드코딩된 경로 배열 대신 `SEASON_SHELL_PATHS` 참조
- `components/FloatingNav.tsx` — `/privacy`에서도 `.s4-root`(teal 톤) 스코프 적용되도록 조건 추가

## 다음에 새 유틸리티 페이지 추가하는 법
1. `lib/season-shell-paths.ts`의 `SEASON_SHELL_PATHS`에 경로 추가 (예: `"/terms"`)
2. 해당 라우트에 `layout.tsx` 하나 만들기:
```tsx
import { SeasonShell } from "@/components/season/SeasonShell";

const TermsLayout = ({ children }: { children: React.ReactNode }) => {
  return <SeasonShell>{children}</SeasonShell>;
};

export default TermsLayout;
```
3. `components/FloatingNav.tsx`의 `usesSeasonShell` 조건에도 그 경로 추가 (teal 톤 적용용)

## 확인해본 것
`tsc --noEmit`, `eslint` 전체 baseline(26/164) 그대로, 새로 깨진 곳 없음.
