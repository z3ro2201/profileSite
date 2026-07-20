import { NextResponse } from "next/server";

// IndexNow는 https://도메인/{key}.txt 에 키 파일이 있는지로 소유권을 확인함.
// 키는 랜덤 문자열이라 URL 경로 자체가 곧 인증 수단 — 그래서 여기서 방문 경로가
// 실제 설정된 키랑 일치할 때만 응답하고, 그 외엔 전부 404로 그냥 통과시킴
// (다른 정적 페이지/라우트를 가리지 않게).
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const key = process.env.INDEXNOW_KEY;

  if (!key || file !== `${key}.txt`) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(key, {
    headers: { "Content-Type": "text/plain" },
  });
}
