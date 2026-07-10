import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 항상 실시간으로 최신 글을 반영하도록 설정
export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = process.env.APP_ORIGIN ?? "https://2er0.io";

// 마크다운 문법 및 HTML 태그를 제거하여 순수 텍스트 요약본을 만드는 함수
const stripMarkdownAndHtml = (text: string, maxLength = 150): string => {
  if (!text) return "";

  const plainText = text
    .replace(/<[^>]*>/g, "") // HTML 태그 제거
    .replace(/[#*`_~[\]()]/g, "") // 마크다운 주요 특수문자 제거
    .replace(/\n+/g, " ") // 줄바꿈을 공백으로 치환
    .trim();

  return plainText.length > maxLength ? `${plainText.slice(0, maxLength)}...` : plainText;
};

export const GET = async () => {
  try {
    // 공개된 블로그 글 가져오기
    const posts = await prisma.post.findMany({
      where: { state: "PUBLISHED" },
      select: { id: true, title: true, contentMd: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    const now = new Date().toUTCString();

    // XML 빌드
    let rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>2er0.io Blog</title>
    <link>${baseUrl}/blog</link>
    <description>개발 · 기록 · 메모</description>
    <language>ko</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

    for (const post of posts) {
      const postUrl = `${baseUrl}/blog/posts/view/${post.id}`;
      const pubDate = new Date(post.publishedAt ?? new Date()).toUTCString();
      const cleanDescription = stripMarkdownAndHtml(post.content);

      rssXml += `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${cleanDescription}]]></description>
    </item>\n`;
    }

    rssXml += `  </channel>
</rss>`;

    // XML 전용 헤더 설정 후 반환
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("RSS Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
