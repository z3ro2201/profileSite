# 다크모드 전면 개선

## 삭제할 파일
- `app/s4/_components/PortfolioClient.tsx` — `ProjectClient.tsx`로 이름 바뀐 뒤 안 지워진 죽은 중복 파일

## 수정 파일
- `app/s4/_lib/s4-theme.css` — 다크모드용 `--input-background` 토큰 추가
- `app/s4/_components/HomeClient.tsx` — detective conan 배지, iMessage 말풍선, 하단 3개 버튼(`bg-white`) 다크 대응
- `app/s4/_components/ProjectClient.tsx` — 필터 pill 테두리 다크 대응
- `app/s4/_components/DetailPanel.tsx` — 미리보기 플레이스홀더 배경 다크 대응
- `layout/blog/PostViewClient.tsx` — 글 본문 전체(prose, 카드, TOC, 지도) 다크 대응. 태그 링크가 옛날에 없어진 `/blog/posts?scope=tags&q=` URL을 가리키던 것도 `/blog?tag=`로 수정
- `layout/blog/CommentClient.tsx` — 댓글 UI 전체 다크 대응 + 예전부터 있던 `useMemo` setState 버그, `catch (err: any)` 타입 버그 수정

## 확인해본 것
`tsc --noEmit`, `eslint` 전체 baseline이 오히려 개선됨(154→152, 위 버그 2개 고친 만큼). 새로 깨진 곳 없음.

## 아직 안 건드린 것
`app/s4/_components/UIClient.tsx`(컴포넌트 쇼케이스 페이지)에도 하드코딩된 색이 꽤 남아있는데, 실제 콘텐츠가 아니라 UI 예시 모음이라 우선순위 낮다고 판단해서 이번에도 건너뛰었어요. 신경 쓰이시면 말씀해주세요.
