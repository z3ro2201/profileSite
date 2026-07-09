"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TEAL, mono } from "@/lib/nav-shared";
import { serif } from "@/app/s4/_lib/theme";
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

const glassCard: React.CSSProperties = {
  background: "var(--card)",
  borderRadius: 16,
  border: "1px solid var(--border)",
};

const AdminAnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<PeriodType>("today");
  const [page, setPage] = useState<number>(1);

  const fetchAnalytics = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}&page=${page}`);
      const result = await response.json();
      if (response.ok) setData(result);
      else console.error("Failed to fetch analytics:", result.error);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- period/page 바뀔 때마다 최신 데이터 재조회
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchAnalytics는 period/page를 클로저로 참조
  }, [period, page]);

  const handlePeriodChange = (newPeriod: PeriodType): void => {
    setPeriod(newPeriod);
    setPage(1);
  };

  if (loading && !data) return <LoadingState />;
  if (!data) return <ErrorState onRetry={fetchAnalytics} />;

  return (
    <div className="space-y-6">
      <Header period={period} onPeriodChange={handlePeriodChange} />
      <SummaryCards summary={data.summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PageViewsCard pageViews={data.pageViews} />
        <ReferrersCard referrers={data.referrers} totalVisits={data.summary.totalVisits} />
      </div>
      <TechStatsGrid
        devices={data.devices}
        browsers={data.browsers}
        operatingSystems={data.operatingSystems}
        totalVisits={data.summary.totalVisits}
      />
      {data.countries.length > 0 && <CountriesCard countries={data.countries} />}
      <HourlyStatsCard hourlyStats={data.hourlyStats} />
      <RecentVisitsCard
        recentVisits={data.recentVisits}
        pagination={data.pagination}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminAnalyticsPage;

const LoadingState = () => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center">
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
        style={{ borderColor: `${TEAL} transparent transparent transparent` }}
      />
      <p className="text-sm text-muted-foreground" style={mono}>
        데이터를 불러오는 중…
      </p>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center">
      <p className="text-sm text-rose-500 mb-4">데이터를 불러올 수 없습니다.</p>
      <button
        onClick={onRetry}
        className="px-5 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: TEAL }}
      >
        다시 시도
      </button>
    </div>
  </div>
);

const Header = ({ period, onPeriodChange }: { period: PeriodType; onPeriodChange: (period: PeriodType) => void }) => (
  <div>
    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1" style={mono}>
      Analytics
    </p>
    <h2 className="text-2xl font-light text-foreground mb-4" style={serif}>
      방문자 분석
    </h2>
    <div className="flex flex-wrap gap-2">
      {periodOptions.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className="px-4 py-1.5 rounded-full text-sm transition-all"
          style={
            p.value === period
              ? { background: TEAL, color: "#fff", ...mono }
              : { background: "var(--secondary)", color: "var(--muted-foreground)", ...mono }
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

const SummaryCards = ({ summary }: { summary: AnalyticsData["summary"] }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatCard title="총 방문 수" value={summary.totalVisits.toLocaleString()} />
    <StatCard title="순 방문자" value={summary.uniqueVisitors.toLocaleString()} />
    <StatCard title="세션" value={summary.sessions.toLocaleString()} />
    <StatCard title="평균 페이지/세션" value={summary.avgPagesPerSession} />
  </div>
);

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="p-5 flex flex-col gap-2" style={glassCard}>
    <p className="text-[10px] tracking-widest uppercase text-muted-foreground" style={mono}>
      {title}
    </p>
    <p className="text-3xl font-light text-foreground" style={serif}>
      {value}
    </p>
  </div>
);

const PageViewsCard = ({ pageViews }: { pageViews: AnalyticsData["pageViews"] }) => (
  <div className="p-5" style={glassCard}>
    <p className="text-xs font-medium text-foreground mb-4">페이지별 조회수</p>
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {pageViews.length === 0 && <p className="text-xs text-muted-foreground">데이터가 없습니다.</p>}
      {pageViews.map((page, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs text-foreground truncate font-medium">{page.page_path}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5" style={mono}>
              {page.unique_visitors.toLocaleString()} 순방문자
            </div>
          </div>
          <div className="text-sm font-medium text-foreground ml-4" style={mono}>
            {page.views.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReferrersCard = ({ referrers, totalVisits }: { referrers: AnalyticsData["referrers"]; totalVisits: number }) => (
  <div className="p-5" style={glassCard}>
    <p className="text-xs font-medium text-foreground mb-4">유입 경로</p>
    <div className="space-y-3">
      {referrers.length === 0 && <p className="text-xs text-muted-foreground">데이터가 없습니다.</p>}
      {referrers.map((r) => (
        <div key={r.source}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-foreground">{r.source}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground" style={mono}>
                {r.visits.toLocaleString()}
              </span>
              <span className="text-[10px] font-medium w-9 text-right" style={{ color: TEAL, ...mono }}>
                {totalVisits ? ((r.visits / totalVisits) * 100).toFixed(1) : "0"}%
              </span>
            </div>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${totalVisits ? (r.visits / totalVisits) * 100 : 0}%`, background: TEAL }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TechStatsGrid = ({
  devices,
  browsers,
  operatingSystems,
  totalVisits,
}: {
  devices: AnalyticsData["devices"];
  browsers: AnalyticsData["browsers"];
  operatingSystems: AnalyticsData["operatingSystems"];
  totalVisits: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="p-5" style={glassCard}>
      <p className="text-xs font-medium text-foreground mb-4">디바이스</p>
      <div className="space-y-3">
        {devices.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-foreground">{d.device_type ?? "알 수 없음"}</span>
              <span className="text-[10px] font-medium" style={{ color: TEAL, ...mono }}>
                {totalVisits ? ((d.count / totalVisits) * 100).toFixed(1) : "0"}%
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${totalVisits ? (d.count / totalVisits) * 100 : 0}%`, background: TEAL }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="p-5" style={glassCard}>
      <p className="text-xs font-medium text-foreground mb-4">브라우저</p>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {browsers.map((b, i) => (
          <div key={i} className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{b.browser ?? "알 수 없음"}</span>
            <span className="text-foreground font-medium" style={mono}>
              {b.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="p-5" style={glassCard}>
      <p className="text-xs font-medium text-foreground mb-4">운영체제</p>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {operatingSystems.map((os, i) => (
          <div key={i} className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{os.os ?? "알 수 없음"}</span>
            <span className="text-foreground font-medium" style={mono}>
              {os.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CountriesCard = ({ countries }: { countries: AnalyticsData["countries"] }) => (
  <div className="p-5" style={glassCard}>
    <p className="text-xs font-medium text-foreground mb-4">국가별 방문</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {countries.map((c, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
        >
          <span className="text-xs text-foreground">{c.country}</span>
          <div className="text-right">
            <div className="text-xs font-medium text-foreground" style={mono}>
              {c.visits.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground" style={mono}>
              {c.unique_visitors.toLocaleString()} 순방문자
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HourlyStatsCard = ({ hourlyStats }: { hourlyStats: AnalyticsData["hourlyStats"] }) => {
  const maxVisits = Math.max(...hourlyStats.map((h) => h.visits), 1);
  return (
    <div className="p-5" style={glassCard}>
      <p className="text-xs font-medium text-foreground mb-4">시간대별 방문</p>
      <div className="flex items-end justify-between gap-1 h-40">
        {hourlyStats.map((stat) => {
          const height = (stat.visits / maxVisits) * 100;
          return (
            <div key={stat.hour} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full flex items-end" style={{ height: 120 }}>
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: `${Math.max(height, 2)}%`, background: TEAL, opacity: 0.85 }}
                  title={`${stat.hour}시: ${stat.visits.toLocaleString()}회`}
                />
              </div>
              <div className="text-[9px] mt-2 text-muted-foreground" style={mono}>
                {stat.hour}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentVisitsCard = ({
  recentVisits,
  pagination,
  page,
  onPageChange,
}: {
  recentVisits: AnalyticsData["recentVisits"];
  pagination: AnalyticsData["pagination"];
  page: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="p-5" style={glassCard}>
    <p className="text-xs font-medium text-foreground mb-4">최근 방문 기록</p>
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            {["시간", "페이지", "유입경로", "위치", "디바이스", "브라우저"].map((h) => (
              <th key={h} className="text-left py-2.5 px-2 font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentVisits.map((visit) => (
            <tr
              key={visit.id}
              className="border-b border-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
            >
              <td className="py-2.5 px-2 whitespace-nowrap text-muted-foreground" style={mono}>
                {format(new Date(visit.visited_at), "MM/dd HH:mm:ss")}
              </td>
              <td className="py-2.5 px-2 text-foreground max-w-[180px] truncate">{visit.page_path}</td>
              <td className="py-2.5 px-2 text-muted-foreground max-w-[140px] truncate">{visit.referrer || "-"}</td>
              <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">
                {visit.city && visit.country ? `${visit.city}, ${visit.country}` : visit.country || "-"}
              </td>
              <td className="py-2.5 px-2 text-muted-foreground">{visit.device_type || "-"}</td>
              <td className="py-2.5 px-2 text-muted-foreground">{visit.browser || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {pagination.totalPages > 1 && (
      <div className="flex justify-center items-center gap-3 mt-5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-1.5 rounded-full text-xs border border-border text-muted-foreground disabled:opacity-40 hover:text-foreground transition-colors"
        >
          이전
        </button>
        <span className="text-xs text-muted-foreground" style={mono}>
          {page} / {pagination.totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pagination.totalPages}
          className="px-4 py-1.5 rounded-full text-xs border border-border text-muted-foreground disabled:opacity-40 hover:text-foreground transition-colors"
        >
          다음
        </button>
      </div>
    )}
  </div>
);
