import { NextResponse } from "next/server";

const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

# AI 학습엔 쓰지 말아달라는 선언, 검색 색인은 허용 (아직 신생 표준이라 모든 크롤러가 지키진 않음)
Content-Signal: ai-train=no, search=yes, ai-input=no

Sitemap: https://2er0.io/sitemap.xml
`;

export function GET() {
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
