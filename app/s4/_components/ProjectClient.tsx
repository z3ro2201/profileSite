"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { TEAL, mono, serif, FILTERS, type FilterKey, type DetailItem } from "../_lib/theme";
import { DetailPanel } from "./DetailPanel";

export default function ProjectClient({ items }: { items: DetailItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("전체");
  const [selected, setSelected] = useState<DetailItem | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = (id: string) => {
    hoverTimer.current = setTimeout(() => setHovered(id), 600);
  };
  const onLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(null);
  };

  const filtered = items.filter((p) => filter === "전체" || p.tags?.includes(filter));

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: TEAL, ...mono }}>
          프로젝트
        </p>
        <h2 className="text-4xl sm:text-5xl font-light leading-tight mb-6" style={serif}>
          상상을 현실로,
          <br />
          <span className="italic">뚝딱뚝딱</span> 만들고 있어요.
        </h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-sm px-4 py-1.5 rounded-full border transition-all duration-200"
              style={
                filter === f
                  ? { background: TEAL, color: "#fff", borderColor: TEAL, ...mono }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)", ...mono }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground" style={mono}>표시할 프로젝트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="relative" onMouseEnter={() => onEnter(item.id)} onMouseLeave={onLeave}>
            {/* hover preview card */}
            {hovered === item.id && (
              <div
                className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-30 rounded-2xl overflow-hidden pointer-events-none"
                style={{
                  background: "var(--card)",
                  border: "1px solid rgba(35,198,169,0.3)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                  animation: "fadeUp 0.18s cubic-bezier(0.32,0.72,0,1)",
                }}
              >
                {/* preview image grid */}
                <div className="grid grid-cols-3 gap-1 p-2" style={{ background: item.color }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.35)" }}
                    >
                      <span className={i === 0 ? "text-2xl" : "text-lg opacity-40"}>{item.emoji}</span>
                    </div>
                  ))}
                </div>
                {/* caption */}
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground leading-tight">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5" style={mono}>
                      {item.period}
                    </p>
                  </div>
                  <ArrowUpRight size={13} style={{ color: TEAL }} />
                </div>
              </div>
            )}
            <button
              onClick={() => setSelected(item)}
              className="group w-full rounded-2xl border border-border bg-[var(--card)] overflow-hidden hover:border-[rgba(35,198,169,0.3)] hover:shadow-sm transition-all duration-200 text-left"
            >
              {/* thumbnail */}
              <div
                className="w-full aspect-video flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${item.color} 0%, #ddddd9 100%)` }}
              >
                <span className="text-4xl opacity-50">{item.emoji}</span>
                <div
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  <ArrowUpRight size={13} className="text-foreground" />
                </div>
              </div>
              {/* info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground leading-snug mb-1 group-hover:text-[#23c6a9] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{item.subtitle}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground" style={mono}>
                    {item.year ?? item.period}
                  </span>
                  {(item.tags ?? []).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ ...mono, background: "rgba(35,198,169,0.1)", color: TEAL }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </div>
        ))}
        </div>
      )}

      {selected && <DetailPanel item={selected} onClose={close} />}
    </div>
  );
}
