# 카테고리/글별 아이콘 + 배경색 지정 기능

## 배포 시 필요
```powershell
npx prisma migrate dev --name add_icon_color
```
`Category`, `Post` 둘 다에 `icon`(String?), `color`(String?) 컬럼 추가됩니다.

## 우선순위 (아이콘/색상 둘 다 동일)
1. **글에 직접 지정한 값** (PostEditor 하단 "아이콘"/"카드 배경색")
2. **카테고리 기본값** (카테고리 관리 화면에서 지정)
3. (아이콘만) 카테고리/태그 **이름 기반 자동 추정** (기존 방식, 못 찾으면 Cpu)
4. 그래도 없으면 기본값 (아이콘: StickyNote, 배경색: `var(--secondary)`)

## 아이콘은 자유 텍스트 입력
`lucide-react`에 실제로 존재하는 이름(예: `Coffee`, `Plane`, `Server`)을 그대로 입력하면 돼요. 대소문자 정확히 맞아야 하고, 관리자 폼에 입력하는 즉시 옆에 미리보기가 뜨니 실제로 그 아이콘이 맞는지 바로 확인 가능해요. 잘못된 이름이면 조용히 기본 아이콘(StickyNote)으로 대체되고, 폼에는 "이름을 못 찾았다"는 경고 문구가 떠요.

**참고**: `lucide-react` 아이콘 전체(5700개+)를 통째로 import해서 이름으로 동적 조회하는 방식이라, 클라이언트 번들 크기가 다소 늘어나요(수백KB 수준). 나중에 부담되면 자주 쓰는 아이콘만 추린 목록으로 바꿀 수 있어요.

## 태그는 이번 범위 밖
`Tag` 모델에는 icon/color 필드를 안 만들었어요 — 태그는 기존처럼 이름 매칭(`TAG_ICONS`)만 써요. 필요하시면 나중에 같은 패턴으로 추가 가능해요.

## 파일 목록
- `prisma/schema.prisma` — Category/Post에 icon/color 컬럼
- `lib/icon-registry.ts` (신규) — 아이콘 이름 → 실제 컴포넌트 안전 변환
- `types/Category.ts`, `types/Posts.ts` — 관련 타입 전부 icon/color 추가
- `app/api/blog/category/list/route.ts` — 공개 카테고리 API에 icon/color 포함
- `app/api/admin/blog/categories/route.ts`, `[id]/route.ts` — 카테고리 생성/수정 API
- `layout/admin/categories/categoriesLayout.tsx` — 카테고리 관리 폼 (아이콘 미리보기 + 색상피커)
- `app/api/admin/blog/posts/route.ts`, `[id]/route.ts` — 글 생성/수정 API
- `app/api/blog/posts/list/route.ts`, `[id]/route.ts` — 공개 글 API에 icon/color 포함
- `components/blog/Editor/PostEditor.tsx` — 글쓰기 폼에 아이콘/색상 오버라이드 입력 추가
- `components/blog/Editor/PostEditorWrapper.client.tsx` — 수정 시 기존값 전달
- `layout/blog/BlogListClient.tsx` — 실제 카드 렌더링에 우선순위 로직 반영

## 확인해본 것
`tsc --noEmit`, `eslint` 전체 baseline(26/145) 그대로, 새로 깨진 곳 없음.
