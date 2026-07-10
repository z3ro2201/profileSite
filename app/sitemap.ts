import { prisma } from "@/lib/prisma";
import { GEMSTONE_LIST } from "@/lib/lostark";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const joinUrl = (base: string, path: string): string => {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const baseUrl = process.env.APP_ORIGIN ?? "https://2er0.io";
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [];

  const add = (
    path: string,
    opts?: {
      changeFrequency?: Freq;
      priority?: number;
      lastModified?: Date;
    },
  ) => {
    routes.push({
      url: joinUrl(baseUrl, path),
      lastModified: opts?.lastModified ?? now,
      changeFrequency: opts?.changeFrequency ?? "daily",
      priority: opts?.priority ?? 0.7,
    });
  };

  // 정적 페이지
  // "/"는 next.config.ts에서 /s4로 308(영구) 리다이렉트되므로 sitemap엔 안 올림
  // (올려도 구글이 어차피 리다이렉트 따라가서 /s4만 색인함 — 중복/혼란만 생김).
  add("/blog", { changeFrequency: "daily", priority: 0.9 });

  add("/s3", { priority: 0.3 });
  add("/s3/profile", { priority: 0.3 });
  add("/s3/portfolio", { priority: 0.3 });

  add("/s2", { priority: 0.3 });
  add("/s2/profile", { priority: 0.3 });

  add("/s4", { changeFrequency: "weekly", priority: 1 });
  add("/s4/profile", { priority: 0.7 });
  add("/s4/project", { priority: 0.7 });
  // /s4/ui는 컴포넌트 쇼케이스 페이지라 metadata에서 noindex 처리했으므로 sitemap에서도 제외

  add("/tools", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone", { priority: 0.9 });
  add("/tools/game/onstove/lostark/sasaFind", { priority: 0.95 });
  add("/tools/ocr", { priority: 0.8 });

  // 로스트아크 보석 차트 동적 페이지
  const gemstones = GEMSTONE_LIST as readonly string[];
  const levels = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"]; // 전체 레벨

  for (const itemName of gemstones) {
    for (const level of levels) {
      // 기본 URL만 포함 (쿼리 파라미터 URL은 제외하여 중복 콘텐츠 방지)
      add(`/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(itemName)}/${level}`, {
        changeFrequency: level === "10" ? "hourly" : level === "9" || level === "8" ? "daily" : "weekly",
        priority: level === "10" ? 0.9 : level === "9" ? 0.8 : level === "8" ? 0.75 : 0.7,
      });
    }
  }

  // 공개된 블로그 글
  const posts = await prisma.post.findMany({
    where: { state: "PUBLISHED" },
    select: { id: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => {
    // 발행/수정된 지 7일 이내인 글은 daily, 그 외 오래된 글은 weekly 또는 monthly로 서빙
    const isRecent = new Date().getTime() - new Date(p.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

    return {
      url: joinUrl(baseUrl, `/blog/posts/view/${p.id}`),
      lastModified: p.updatedAt ?? p.publishedAt ?? now,
      changeFrequency: isRecent ? "daily" : "weekly", // 최신 글은 매일, 옛날 글은 매주 점검 유도
      priority: isRecent ? 0.8 : 0.6, // 최신 글에 검색 가중치 더 주기
    };
  });

  return [...routes, ...postRoutes];
};

export default sitemap;
