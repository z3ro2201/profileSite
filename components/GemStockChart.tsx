"use client";

import { useMemo, useRef } from "react";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler, type ChartOptions, type ChartData, type ScatterDataPoint } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler, zoomPlugin);

type Row = {
  halfhour_registDateTime: string; // "YYYY-MM-DD HH:mm:ss"
  item_amount: number | null;
};

type Props = {
  rows: Row[];
  height?: number; // px
  bucketSeconds?: number;
  rangeSeconds?: number; // ✅ 서버 응답 rangeSeconds
  updatetimeLabel?: string;
};

// "YYYY-MM-DD HH:mm:ss" (KST) -> epoch(ms)
function toEpochMsFromKstString(s: string): number {
  const [d, t] = s.split(" ");
  if (!d || !t) return NaN;

  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map(Number);
  if (![y, m, day, hh, mm, ss].every((n) => Number.isFinite(n))) return NaN;

  return Date.UTC(y, m - 1, day, hh - 9, mm, ss);
}

function pickTimeUnit(bucketSeconds: number) {
  if (bucketSeconds >= 86400) return { unit: "day" as const, stepSize: Math.max(1, Math.round(bucketSeconds / 86400)) };
  if (bucketSeconds >= 3600) return { unit: "hour" as const, stepSize: Math.max(1, Math.round(bucketSeconds / 3600)) };
  return { unit: "minute" as const, stepSize: Math.max(1, Math.round(bucketSeconds / 60)) };
}

function toKstParts(ts: number) {
  const dtf = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(new Date(ts));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function formatTickKst(ts: number, mode: "INTRADAY" | "WEEK" | "LONG") {
  const p = toKstParts(ts);

  if (mode === "INTRADAY") {
    // 하루 미만(24h) : 분 단위는 HH:mm (5/10/15/30)
    return `${p.hour}:${p.minute}`;
  }

  if (mode === "WEEK") {
    // 7일 이하: 00월 00일 00시 00분
    return `${p.month}월 ${p.day}일 ${p.hour}시 ${p.minute}분`;
  }

  // 초과: 00월 00일 00시 (분 제거)
  return `${p.month}월 ${p.day}일 ${p.hour}시`;
}

export default function GemStockChartChartJS({ rows, height = 380, bucketSeconds = 300, rangeSeconds = 24 * 60 * 60, updatetimeLabel }: Props) {
  const chartRef = useRef<ChartJS<"line", ScatterDataPoint[], unknown> | null>(null);

  const mode = useMemo<"INTRADAY" | "WEEK" | "LONG">(() => {
    if (rangeSeconds <= 24 * 60 * 60) return "INTRADAY";
    if (rangeSeconds <= 7 * 24 * 60 * 60) return "WEEK";
    return "LONG";
  }, [rangeSeconds]);

  const { unit, stepSize } = useMemo(() => pickTimeUnit(bucketSeconds), [bucketSeconds]);

  const chartData: ChartData<"line", ScatterDataPoint[], unknown> = useMemo(() => {
    const points: ScatterDataPoint[] = rows
      .filter((r) => r.item_amount != null)
      .map((r) => ({
        x: toEpochMsFromKstString(r.halfhour_registDateTime),
        y: Number(r.item_amount),
      }))
      .filter((p) => Number.isFinite(p.x as number));

    points.sort((a, b) => (a.x as number) - (b.x as number));

    return {
      datasets: [
        {
          label: "보석 시세",
          data: points,
          borderColor: "rgba(20, 20, 20, 0.9)",
          backgroundColor: "rgba(20, 20, 20, 0.10)",
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [rows]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },

      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => {
              const ts = items[0]?.parsed?.x as number | undefined;
              if (!ts) return "";
              if (mode === "INTRADAY") return new Date(ts).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
              if (mode === "WEEK") return formatTickKst(ts, "WEEK");
              return formatTickKst(ts, "LONG");
            },
            label: (ctx) => `가격: ${Number(ctx.parsed.y).toLocaleString("ko-KR")}`,
          },
        },
        zoom: {
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
          pan: { enabled: true, mode: "x" },
          limits: { x: { min: "original", max: "original" } },
        },
      },

      scales: {
        x: {
          type: "time",
          time: {
            unit,
            stepSize,
            displayFormats: {
              minute: "HH:mm",
              hour: "MM/dd HH:mm",
              day: "MM/dd",
              month: "yyyy-MM",
            },
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            callback: (value) => {
              const ts = Number(value);
              if (!Number.isFinite(ts)) return "";
              return formatTickKst(ts, mode);
            },
          },
          grid: { display: false },
        },
        y: {
          ticks: { callback: (v) => Number(v).toLocaleString("ko-KR") },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    }),
    [mode, unit, stepSize]
  );

  const handleResetZoom = () => {
    chartRef.current?.resetZoom();
  };

  const headerText = useMemo(() => {
    const sec = Math.max(60, Math.floor(bucketSeconds));
    const m = Math.round(sec / 60);
    const base = `${m}분 단위 시세 (Stock-style)`;
    return updatetimeLabel ? `${base} · ${updatetimeLabel}` : base;
  }, [bucketSeconds, updatetimeLabel]);

  return (
    <div className="w-full rounded-xl border border-gray-800/10 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-80">{headerText}</div>
        <button type="button" onClick={handleResetZoom} className="text-xs px-2 py-1 rounded-md border border-gray-800/20 bg-white hover:bg-gray-50">
          줌 리셋
        </button>
      </div>

      <div style={{ height }}>
        <Line
          ref={(instance) => {
            chartRef.current = (instance as any)?.chart ?? null;
          }}
          data={chartData}
          options={options}
        />
      </div>

      <div className="text-[11px] opacity-60 mt-2">마우스휠: 줌 · 드래그: 좌우 이동 · 모바일: 핀치 줌</div>
    </div>
  );
}
