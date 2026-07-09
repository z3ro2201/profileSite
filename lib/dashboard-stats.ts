import "server-only";
import { prisma } from "@/lib/prisma";

export type DailyVisitPoint = { date: string; visitors: number; pageviews: number };
export type TopPagePoint = { path: string; views: number };

export type DashboardStats = {
  todayVisitors: number;
  yesterdayVisitors: number;
  todayPageviews: number;
  yesterdayPageviews: number;
  last30dVisitors: number;
  publishedCount: number;
  draftCount: number;
  dailyTrend: DailyVisitPoint[]; // 최근 30일, 하루 단위
  topPages: TopPagePoint[]; // 최근 30일 상위 5
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const last30dStart = new Date(todayStart);
  last30dStart.setDate(last30dStart.getDate() - 29); // 오늘 포함 30일

  const [todayRows, yesterdayRows, last30dRows, publishedCount, draftCount] = await Promise.all([
    prisma.pageVisit.findMany({ where: { visitedAt: { gte: todayStart } }, select: { visitorId: true } }),
    prisma.pageVisit.findMany({
      where: { visitedAt: { gte: yesterdayStart, lt: todayStart } },
      select: { visitorId: true },
    }),
    prisma.pageVisit.findMany({
      where: { visitedAt: { gte: last30dStart } },
      select: { visitorId: true, pagePath: true, visitedAt: true },
    }),
    prisma.post.count({ where: { state: "PUBLISHED" } }),
    prisma.post.count({ where: { state: "DRAFT" } }),
  ]);

  const todayVisitors = new Set(todayRows.map((r: { visitorId: string }) => r.visitorId)).size;
  const yesterdayVisitors = new Set(yesterdayRows.map((r: { visitorId: string }) => r.visitorId)).size;

  // 일별 방문자/페이지뷰 집계 (30일)
  const byDay = new Map<string, { visitors: Set<string>; pageviews: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(last30dStart);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), { visitors: new Set(), pageviews: 0 });
  }
  const pathCounts = new Map<string, number>();
  for (const row of last30dRows) {
    const key = row.visitedAt.toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.visitors.add(row.visitorId);
      bucket.pageviews += 1;
    }
    pathCounts.set(row.pagePath, (pathCounts.get(row.pagePath) ?? 0) + 1);
  }

  const dailyTrend: DailyVisitPoint[] = Array.from(byDay.entries()).map(([date, v]) => ({
    date: date.slice(5), // MM-DD
    visitors: v.visitors.size,
    pageviews: v.pageviews,
  }));

  const topPages: TopPagePoint[] = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));

  return {
    todayVisitors,
    yesterdayVisitors,
    todayPageviews: todayRows.length,
    yesterdayPageviews: yesterdayRows.length,
    last30dVisitors: new Set(last30dRows.map((r: { visitorId: string }) => r.visitorId)).size,
    publishedCount,
    draftCount,
    dailyTrend,
    topPages,
  };
}
