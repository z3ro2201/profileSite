import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { TEAL, mono } from "@/lib/nav-shared";
import { serif } from "@/app/s4/_lib/theme";
import DashboardTrendChart from "@/layout/admin/dashboard/DashboardTrendChart";

const glassCard: React.CSSProperties = {
  background: "var(--card)",
  borderRadius: 16,
  border: "1px solid var(--border)",
};

function StatCard({ label, value, sub, up }: { label: string; value: string; sub: string; up: boolean }) {
  return (
    <div className="p-5 flex flex-col gap-2" style={glassCard}>
      <p className="text-[10px] tracking-widest uppercase text-muted-foreground" style={mono}>
        {label}
      </p>
      <p className="text-3xl font-light text-foreground" style={serif}>
        {value}
      </p>
      <div className={`flex items-center gap-1 text-xs ${up ? "text-emerald-500" : "text-rose-400"}`} style={mono}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {sub}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic"; // 관리자 전용 페이지, 캐싱하지 않음

export default async function DashboardPage() {
  const [stats, recentPosts] = await Promise.all([
    getDashboardStats(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, state: true, publishedAt: true, createdAt: true },
    }),
  ]);

  const visitorDiff = stats.todayVisitors - stats.yesterdayVisitors;
  const pageviewDiff = stats.todayPageviews - stats.yesterdayPageviews;
  const maxTopPageViews = stats.topPages[0]?.views ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1" style={mono}>
          Overview
        </p>
        <h2 className="text-2xl font-light text-foreground" style={serif}>
          대시보드
        </h2>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="오늘 방문자"
          value={String(stats.todayVisitors)}
          sub={`어제 대비 ${visitorDiff >= 0 ? "+" : ""}${visitorDiff}명`}
          up={visitorDiff >= 0}
        />
        <StatCard
          label="오늘 페이지뷰"
          value={String(stats.todayPageviews)}
          sub={`어제 대비 ${pageviewDiff >= 0 ? "+" : ""}${pageviewDiff}`}
          up={pageviewDiff >= 0}
        />
        <StatCard label="30일 방문자" value={stats.last30dVisitors.toLocaleString()} sub="최근 30일 누계" up={true} />
        <StatCard
          label="발행된 글"
          value={String(stats.publishedCount)}
          sub={`초안 ${stats.draftCount}개 포함`}
          up={true}
        />
      </div>

      {/* visitor chart */}
      <div className="p-5" style={glassCard}>
        <p className="text-xs font-medium text-foreground mb-4">방문자 추이 (최근 30일)</p>
        <DashboardTrendChart data={stats.dailyTrend} />
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: TEAL }} />
            방문자
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-0.5 rounded inline-block bg-indigo-400" />
            페이지뷰
          </span>
        </div>
      </div>

      {/* top pages + recent posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5" style={glassCard}>
          <p className="text-xs font-medium text-foreground mb-4">상위 페이지 (최근 30일)</p>
          <div className="space-y-2">
            {stats.topPages.length === 0 && <p className="text-xs text-muted-foreground">방문 기록이 없습니다.</p>}
            {stats.topPages.map((pg: { path: string; views: number }, i: number) => (
              <div key={pg.path} className="flex items-center gap-3">
                <span className="text-[10px] w-4 text-muted-foreground flex-shrink-0" style={mono}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground truncate">{pg.path}</span>
                    <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0" style={mono}>
                      {pg.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: "var(--muted)" }}>
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${(pg.views / maxTopPageViews) * 100}%`, background: TEAL }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5" style={glassCard}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-foreground">최근 글</p>
            <Link href="/admin/mgmt/posts/list" className="text-[10px]" style={{ color: TEAL, ...mono }}>
              모두 보기 →
            </Link>
          </div>
          <div className="space-y-2">
            {recentPosts.length === 0 && <p className="text-xs text-muted-foreground">작성된 글이 없습니다.</p>}
            {recentPosts.map((post: (typeof recentPosts)[number]) => (
              <Link
                key={post.id}
                href={`/admin/mgmt/posts/${post.id}`}
                className="w-full flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0 hover:opacity-70 transition-opacity"
              >
                <div className="min-w-0">
                  <p className="text-xs text-foreground truncate font-medium">{post.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5" style={mono}>
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${post.state === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"}`}
                  style={mono}
                >
                  {post.state === "PUBLISHED" ? "발행" : post.state === "DRAFT" ? "초안" : "보관"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
