import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_ORIGIN ?? "https://2er0.io";
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [];

  const add = (
    path: string,
    opts?: {
      changeFrequency?: Freq;
      priority?: number;
      lastModified?: Date;
    }
  ) => {
    routes.push({
      url: joinUrl(baseUrl, path),
      lastModified: opts?.lastModified ?? now,
      changeFrequency: opts?.changeFrequency ?? "daily",
      priority: opts?.priority ?? 0.7,
    });
  };

  // 정적 페이지
  add("/", { changeFrequency: "weekly", priority: 1 });
  add("/blog", { changeFrequency: "daily", priority: 0.9 });
  add("/blog/posts", { changeFrequency: "daily", priority: 0.8 });

  add("/s3", { priority: 0.7 });
  add("/s3/profile", { priority: 0.7 });
  add("/s3/portfolio", { priority: 0.7 });

  add("/s2", { priority: 0.7 });
  add("/s2/profile", { priority: 0.7 });

  add("/tools", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone", { priority: 1 });

  add("/tools/game/onstove/lostark/auction-chart/gemstone", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=1&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=2&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=3&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=4&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=5&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=6&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=7&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=8&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=9&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=10&updatetime=1d", { priority: 1 });

  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=1&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=2&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=3&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=4&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=5&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=6&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=7&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=8&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=9&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EC%9E%91%EC%97%B4&level=10&updatetime=5m", { priority: 1 });

  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=1&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=2&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=3&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=4&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=5&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=6&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=7&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=8&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=9&updatetime=1d", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=10&updatetime=1d", { priority: 1 });

  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=1&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=2&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=3&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=4&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=5&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=6&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=7&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=8&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=9&updatetime=5m", { priority: 1 });
  add("/tools/game/onstove/lostark/auction-chart/gemstone?gemStone=%EA%B2%81%ED%99%94&level=10&updatetime=5m", { priority: 1 });

  add("/tools/game/onstove/lostark/sasaFind", { priority: 1 });
  add("/tools/ocr", { priority: 1 });

  // 공개된 블로그 글
  const posts = await prisma.post.findMany({
    where: { state: "PUBLISHED" },
    select: { id: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: joinUrl(baseUrl, `/blog/posts/view/${p.id}`),
    lastModified: p.updatedAt ?? p.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...routes, ...postRoutes];
}
