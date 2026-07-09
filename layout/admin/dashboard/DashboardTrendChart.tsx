"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TEAL } from "@/lib/nav-shared";
import type { DailyVisitPoint } from "@/lib/dashboard-stats";

export default function DashboardTrendChart({ data }: { data: DailyVisitPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="dashGv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
            <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dashGpv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          interval={6}
        />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="visitors" name="방문자" stroke={TEAL} strokeWidth={2} fill="url(#dashGv)" />
        <Area
          type="monotone"
          dataKey="pageviews"
          name="페이지뷰"
          stroke="#818cf8"
          strokeWidth={2}
          fill="url(#dashGpv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
