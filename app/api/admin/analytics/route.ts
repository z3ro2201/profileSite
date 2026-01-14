import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/analytics-config";
import type { AnalyticsData, PeriodType, PageViewStat, ReferrerStat, DeviceStat, BrowserStat, OSStat, CountryStat, HourlyStat, RecentVisit } from "@/types/Analytics";

// 관리자 인증 확인
const checkAdminAuth = async (request: NextRequest): Promise<boolean> => {
  // 개발 환경에서는 인증 건너뛰기
  if (!config.adminAuthRequired) {
    return true;
  }

  // 배포 환경에서는 실제 인증 로직 사용
  // TODO: 실제 인증 로직으로 교체
  // 예시:
  // import { getServerSession } from 'next-auth';
  // const session = await getServerSession(authOptions);
  // return session?.user?.role === 'admin';

  const authHeader = request.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET;

  if (adminSecret && authHeader === `Bearer ${adminSecret}`) {
    return true;
  }

  return false;
};

// 날짜 필터 생성
const getDateFilter = (period: PeriodType): { gte?: Date; lte?: Date } | {} => {
  const now = new Date();

  switch (period) {
    case "today":
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      return { gte: startOfToday };

    case "yesterday":
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(now.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return { gte: startOfYesterday, lte: endOfYesterday };

    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return { gte: weekAgo };

    case "month":
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return { gte: monthAgo };

    case "year":
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      return { gte: yearAgo };

    default:
      return {};
  }
};

// 유입 소스 분류
const classifyReferrer = (referrer: string): string => {
  const ref = referrer.toLowerCase();

  if (ref === "direct" || ref === "") return "Direct";
  if (ref.includes("google")) return "Google";
  if (ref.includes("naver")) return "Naver";
  if (ref.includes("facebook")) return "Facebook";
  if (ref.includes("instagram")) return "Instagram";
  if (ref.includes("youtube")) return "YouTube";
  if (ref.includes("twitter") || ref.includes("x.com")) return "Twitter/X";
  if (ref.includes("linkedin")) return "LinkedIn";

  return "Other";
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "today") as PeriodType;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const skip = (page - 1) * limit;

    const dateFilter = getDateFilter(period);

    // 1. 총 방문 수
    const totalVisits = await prisma.pageVisit.count({
      where: { visitedAt: dateFilter },
    });

    // 2. 유니크 방문자 수
    const uniqueVisitorsData = await prisma.pageVisit.groupBy({
      by: ["visitorId"],
      where: { visitedAt: dateFilter },
    });
    const uniqueVisitors = uniqueVisitorsData.length;

    // 3. 세션 수
    const sessionsData = await prisma.pageVisit.groupBy({
      by: ["sessionId"],
      where: { visitedAt: dateFilter },
    });
    const sessions = sessionsData.length;

    // 4. 페이지별 방문 수 (Top 20)
    const pageViewsData = await prisma.pageVisit.groupBy({
      by: ["pagePath"],
      where: { visitedAt: dateFilter },
      _count: { pagePath: true },
      orderBy: { _count: { pagePath: "desc" } },
      take: 20,
    });

    const pageViews: PageViewStat[] = await Promise.all(
      pageViewsData.map(async (page) => {
        const uniqueCount = await prisma.pageVisit.groupBy({
          by: ["visitorId"],
          where: {
            pagePath: page.pagePath,
            visitedAt: dateFilter,
          },
        });

        return {
          page_path: page.pagePath,
          views: page._count.pagePath,
          unique_visitors: uniqueCount.length,
        };
      })
    );

    // 5. 유입 경로별 통계
    const referrersRaw = await prisma.pageVisit.findMany({
      where: { visitedAt: dateFilter },
      select: { referrer: true, visitorId: true },
    });

    const referrersMap = new Map<string, { visits: number; uniqueVisitors: Set<string> }>();

    referrersRaw.forEach((visit) => {
      const source = classifyReferrer(visit.referrer);

      if (!referrersMap.has(source)) {
        referrersMap.set(source, { visits: 0, uniqueVisitors: new Set() });
      }

      const data = referrersMap.get(source)!;
      data.visits++;
      data.uniqueVisitors.add(visit.visitorId);
    });

    const referrers: ReferrerStat[] = Array.from(referrersMap.entries())
      .map(([source, data]) => ({
        source,
        visits: data.visits,
        unique_visitors: data.uniqueVisitors.size,
      }))
      .sort((a, b) => b.visits - a.visits);

    // 6. 디바이스별 통계
    const devicesData = await prisma.pageVisit.groupBy({
      by: ["deviceType"],
      where: { visitedAt: dateFilter },
      _count: { deviceType: true },
    });

    const devices: DeviceStat[] = await Promise.all(
      devicesData.map(async (device) => {
        const uniqueCount = await prisma.pageVisit.groupBy({
          by: ["visitorId"],
          where: {
            deviceType: device.deviceType,
            visitedAt: dateFilter,
          },
        });

        return {
          device_type: device.deviceType,
          count: device._count.deviceType,
          unique_visitors: uniqueCount.length,
        };
      })
    );

    // 7. 브라우저별 통계
    const browsersData = await prisma.pageVisit.groupBy({
      by: ["browser"],
      where: { visitedAt: dateFilter },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
    });

    const browsers: BrowserStat[] = browsersData.map((browser) => ({
      browser: browser.browser,
      count: browser._count.browser,
    }));

    // 8. OS별 통계
    const osData = await prisma.pageVisit.groupBy({
      by: ["os"],
      where: { visitedAt: dateFilter },
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
    });

    const operatingSystems: OSStat[] = osData.map((os) => ({
      os: os.os,
      count: os._count.os,
    }));

    // 9. 국가별 통계 (Top 10)
    const countriesData = await prisma.pageVisit.groupBy({
      by: ["country"],
      where: {
        visitedAt: dateFilter,
        country: { not: null },
      },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 10,
    });

    const countries: CountryStat[] = await Promise.all(
      countriesData.map(async (country) => {
        const uniqueCount = await prisma.pageVisit.groupBy({
          by: ["visitorId"],
          where: {
            country: country.country,
            visitedAt: dateFilter,
          },
        });

        return {
          country: country.country!,
          visits: country._count.country,
          unique_visitors: uniqueCount.length,
        };
      })
    );

    // 10. 시간대별 방문 (24시간)
    const allVisits = await prisma.pageVisit.findMany({
      where: { visitedAt: dateFilter },
      select: { visitedAt: true },
    });

    const hourlyStatsMap = new Map<number, number>();
    allVisits.forEach((visit) => {
      const hour = new Date(visit.visitedAt).getHours();
      hourlyStatsMap.set(hour, (hourlyStatsMap.get(hour) || 0) + 1);
    });

    const hourlyStats: HourlyStat[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visits: hourlyStatsMap.get(hour) || 0,
    }));

    // 11. 최근 방문 기록
    const recentVisitsRaw = await prisma.pageVisit.findMany({
      where: { visitedAt: dateFilter },
      orderBy: { visitedAt: "desc" },
      take: limit,
      skip: skip,
      select: {
        id: true,
        visitorId: true,
        sessionId: true,
        pagePath: true,
        referrer: true,
        ipAddress: true,
        country: true,
        city: true,
        deviceType: true,
        browser: true,
        os: true,
        visitedAt: true,
      },
    });

    const recentVisits: RecentVisit[] = recentVisitsRaw.map((visit) => ({
      id: visit.id,
      visitor_id: visit.visitorId,
      session_id: visit.sessionId,
      page_path: visit.pagePath,
      referrer: visit.referrer,
      ip_address: visit.ipAddress,
      country: visit.country,
      city: visit.city,
      device_type: visit.deviceType,
      browser: visit.browser,
      os: visit.os,
      visited_at: visit.visitedAt,
    }));

    // 응답 데이터
    const responseData: AnalyticsData = {
      summary: {
        totalVisits,
        uniqueVisitors,
        sessions,
        avgPagesPerSession: sessions > 0 ? (totalVisits / sessions).toFixed(2) : "0",
      },
      pageViews,
      referrers,
      devices,
      browsers,
      operatingSystems,
      countries,
      hourlyStats,
      recentVisits,
      pagination: {
        page,
        limit,
        total: totalVisits,
        totalPages: Math.ceil(totalVisits / limit),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    if (config.logErrors) {
      console.error("Analytics error:", error);
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
};
