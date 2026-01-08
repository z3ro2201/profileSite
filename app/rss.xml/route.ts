import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.APP_ORIGIN;

  const posts = await prisma.post.findMany({
    where: { state: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      contentHtml: true,
      contentMd: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const items = posts
    .map((post) => {
      const link = `${baseUrl}/blog/posts/view/${post.id}`;
      const description = post.contentHtml ?? `<pre>${escapeXml(post.contentMd?.slice(0, 300) ?? "")}</pre>`;

      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${link}</link>
          <guid>${link}</guid>
          <pubDate>${new Date(post.publishedAt ?? post.updatedAt).toUTCString()}</pubDate>
          <description><![CDATA[${description}]]></description>
        </item>
      `;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>2er0.io Blog</title>
    <link>${baseUrl}/blog</link>
    <description>개발 · 기록 · 메모</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
