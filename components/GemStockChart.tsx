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
};

// KST 문자열 → epoch(ms) (타입/파싱 안정)
function toEpochMsFromKstString(s: string): number {
  const [d, t] = s.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map(Number);
  const dt = new Date(y, m - 1, day, hh, mm, ss);
  return dt.getTime();
}

export default function GemStockChartChartJS({ rows, height = 380 }: Props) {
  const chartRef = useRef<ChartJS<"line", ScatterDataPoint[], unknown> | null>(null);

  const chartData: ChartData<"line", ScatterDataPoint[], unknown> = useMemo(() => {
    const points: ScatterDataPoint[] = rows
      .filter((r) => r.item_amount != null)
      .map((r) => ({
        x: toEpochMsFromKstString(r.halfhour_registDateTime), // ✅ number(ms)
        y: Number(r.item_amount),
      }));

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
              return new Date(ts).toLocaleString("ko-KR");
            },
            label: (ctx) => `가격: ${Number(ctx.parsed.y).toLocaleString("ko-KR")}`,
          },
        },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
          pan: {
            enabled: true,
            mode: "x",
          },
          limits: { x: { min: "original", max: "original" } },
        },
      },

      scales: {
        x: {
          type: "time",
          time: {
            unit: "minute",
            stepSize: 5,
            displayFormats: {
              minute: "HH:mm",
              hour: "HH:mm",
              day: "MM/dd",
              month: "yyyy-MM",
            },
          },
          ticks: { autoSkip: true, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          ticks: { callback: (v) => Number(v).toLocaleString("ko-KR") },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    }),
    []
  );

  const handleResetZoom = () => {
    chartRef.current?.resetZoom();
  };

  return (
    <div className="w-full rounded-xl border border-gray-800/10 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-80">5분 단위 시세 (Stock-style)</div>
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
