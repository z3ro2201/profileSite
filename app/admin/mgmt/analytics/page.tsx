"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { AnalyticsData, PeriodType } from "@/types/Analytics";

interface PeriodOption {
  value: PeriodType;
  label: string;
}

const periodOptions: PeriodOption[] = [
  { value: "today", label: "오늘" },
  { value: "yesterday", label: "어제" },
  { value: "week", label: "최근 7일" },
  { value: "month", label: "최근 30일" },
  { value: "year", label: "최근 1년" },
];

const AdminAnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<PeriodType>("today");
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchAnalytics();
  }, [period, page]);

  const fetchAnalytics = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}&page=${page}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        console.error("Failed to fetch analytics:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: PeriodType): void => {
    setPeriod(newPeriod);
    setPage(1);
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState onRetry={fetchAnalytics} />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header period={period} onPeriodChange={handlePeriodChange} />
        <SummaryCards summary={data.summary} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PageViewsCard pageViews={data.pageViews} />
          <ReferrersCard referrers={data.referrers} totalVisits={data.summary.totalVisits} />
        </div>
        <TechStatsGrid devices={data.devices} browsers={data.browsers} operatingSystems={data.operatingSystems} totalVisits={data.summary.totalVisits} />
        {data.countries.length > 0 && <CountriesCard countries={data.countries} />}
        <HourlyStatsCard hourlyStats={data.hourlyStats} />
        <RecentVisitsCard recentVisits={data.recentVisits} pagination={data.pagination} page={page} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-xl text-gray-600">데이터를 불러오는 중...</div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <div className="text-xl text-red-600">데이터를 불러올 수 없습니다.</div>
      <button onClick={onRetry} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        다시 시도
      </button>
    </div>
  </div>
);

const Header = ({ period, onPeriodChange }: { period: PeriodType; onPeriodChange: (period: PeriodType) => void }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">방문자 통계 대시보드</h1>
    <p className="text-gray-600">실시간 웹사이트 분석 및 방문자 추적</p>
    <div className="flex flex-wrap gap-2 mt-6">
      {periodOptions.map((p) => (
        <button key={p.value} onClick={() => onPeriodChange(p.value)} className={`px-5 py-2.5 rounded-lg font-medium transition-all ${period === p.value ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

const SummaryCards = ({ summary }: { summary: AnalyticsData["summary"] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard title="총 방문 수" value={summary.totalVisits.toLocaleString()} icon="👁️" color="blue" />
    <StatCard title="순 방문자" value={summary.uniqueVisitors.toLocaleString()} icon="👤" color="green" />
    <StatCard title="세션" value={summary.sessions.toLocaleString()} icon="🔄" color="purple" />
    <StatCard title="평균 페이지/세션" value={summary.avgPagesPerSession} icon="📄" color="orange" />
  </div>
);

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: string; color: "blue" | "green" | "purple" | "orange" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-5xl">{icon}</div>
    </div>
  </div>
);

const PageViewsCard = ({ pageViews }: { pageViews: AnalyticsData["pageViews"] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center">
      <span className="mr-2">📊</span> 페이지별 조회수
    </h2>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {pageViews.map((page, index) => (
        <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="text-blue-600 font-medium truncate">{page.page_path}</div>
            <div className="text-xs text-gray-500">{page.unique_visitors.toLocaleString()} 순방문자</div>
          </div>
          <div className="text-right ml-4">
            <div className="text-lg font-bold">{page.views.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReferrersCard = ({ referrers, totalVisits }: { referrers: AnalyticsData["referrers"]; totalVisits: number }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center">
      <span className="mr-2">🌐</span> 유입 경로
    </h2>
    <div className="space-y-3">
      {referrers.map((ref, index) => (
        <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getSourceIcon(ref.source)}</span>
            <div>
              <div className="font-medium">{ref.source}</div>
              <div className="text-xs text-gray-500">{ref.unique_visitors.toLocaleString()} 순방문자</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{ref.visits.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{((ref.visits / totalVisits) * 100).toFixed(1)}%</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TechStatsGrid = ({ devices, browsers, operatingSystems, totalVisits }: { devices: AnalyticsData["devices"]; browsers: AnalyticsData["browsers"]; operatingSystems: AnalyticsData["operatingSystems"]; totalVisits: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">📱</span> 디바이스
      </h2>
      <div className="space-y-3">
        {devices.map((device, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="font-medium">{device.device_type}</span>
            <div className="text-right">
              <div className="font-bold">{device.count.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{((device.count / totalVisits) * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">🌍</span> 브라우저
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {browsers.map((browser, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span>{browser.browser}</span>
            <span className="font-semibold">{browser.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">💻</span> 운영체제
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {operatingSystems.map((os, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span>{os.os}</span>
            <span className="font-semibold">{os.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CountriesCard = ({ countries }: { countries: AnalyticsData["countries"] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <h2 className="text-xl font-bold mb-4 flex items-center">
      <span className="mr-2">🗺️</span> 국가별 방문
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {countries.map((country, index) => (
        <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50">
          <span className="font-medium">{country.country}</span>
          <div className="text-right">
            <div className="text-lg font-bold">{country.visits.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{country.unique_visitors.toLocaleString()} 순방문자</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HourlyStatsCard = ({ hourlyStats }: { hourlyStats: AnalyticsData["hourlyStats"] }) => {
  const maxVisits = Math.max(...hourlyStats.map((h) => h.visits), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">⏰</span> 시간대별 방문
      </h2>
      <div className="flex items-end justify-between gap-1 h-48">
        {hourlyStats.map((stat) => {
          const height = (stat.visits / maxVisits) * 100;

          return (
            <div key={stat.hour} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer" style={{ height: `${Math.max(height, 2)}%` }} title={`${stat.hour}시: ${stat.visits.toLocaleString()}회`}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{stat.visits.toLocaleString()}회</span>
                </div>
              </div>
              <div className="text-xs mt-2 text-gray-600">{stat.hour}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentVisitsCard = ({ recentVisits, pagination, page, onPageChange }: { recentVisits: AnalyticsData["recentVisits"]; pagination: AnalyticsData["pagination"]; page: number; onPageChange: (page: number) => void }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center">
      <span className="mr-2">📋</span> 최근 방문 기록
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-2 font-semibold">시간</th>
            <th className="text-left py-3 px-2 font-semibold">페이지</th>
            <th className="text-left py-3 px-2 font-semibold">유입경로</th>
            <th className="text-left py-3 px-2 font-semibold">위치</th>
            <th className="text-left py-3 px-2 font-semibold">디바이스</th>
            <th className="text-left py-3 px-2 font-semibold">브라우저</th>
          </tr>
        </thead>
        <tbody>
          {recentVisits.map((visit) => (
            <tr key={visit.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-2 whitespace-nowrap text-gray-600">{format(new Date(visit.visited_at), "MM/dd HH:mm:ss")}</td>
              <td className="py-3 px-2 text-blue-600 max-w-xs truncate">{visit.page_path}</td>
              <td className="py-3 px-2 text-gray-600 max-w-xs truncate">{visit.referrer}</td>
              <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{visit.city && visit.country ? `${visit.city}, ${visit.country}` : visit.country || "-"}</td>
              <td className="py-3 px-2 text-gray-600">{visit.device_type}</td>
              <td className="py-3 px-2 text-gray-600">{visit.browser}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {pagination.totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
          이전
        </button>
        <span className="px-4 py-2 text-gray-700">
          페이지 {page} / {pagination.totalPages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pagination.totalPages} className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
          다음
        </button>
      </div>
    )}
  </div>
);

const getSourceIcon = (source: string): string => {
  const icons: Record<string, string> = {
    Direct: "🔗",
    Google: "🔍",
    Naver: "N",
    Facebook: "👥",
    Instagram: "📷",
    YouTube: "▶️",
    "Twitter/X": "🐦",
    LinkedIn: "💼",
    Other: "🌐",
  };
  return icons[source] || "🌐";
};
