import { redirect } from "next/navigation";

// 참고: 실제로는 이 컴포넌트가 렌더링되지 않음. next.config.ts의 redirects()가
// 라우팅 레벨에서 "/"를 먼저 가로채서 /s4로 308 리다이렉트하기 때문.
// 혹시 모를 예외 상황(예: redirects 설정 누락) 대비용 폴백으로만 남겨둠.
export default function Home() {
  redirect("/s4");
}
