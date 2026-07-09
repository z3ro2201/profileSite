"use client";

import { useEffect, useRef } from "react";
import { X, Link, Github, ArrowUpRight } from "lucide-react";
import { BG, mono, serif, type DetailItem } from "../_lib/theme";

export function DetailPanel({ item, onClose }: { item: DetailItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  useEffect(() => { closeRef.current?.focus(); }, []);

  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/30"
        style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" } as React.CSSProperties}
        onClick={onClose}
      />

      {/* centered modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-title"
          className="pointer-events-auto w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl overflow-hidden"
          style={{
            background: BG,
            boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            animation: "fadeUp 0.26s cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          {/* ── modal header ── */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: item.color }}
              >
                {item.emoji}
              </div>
              <div className="min-w-0">
                <h2 id="detail-title" className="text-sm font-medium text-foreground truncate">{item.title}</h2>
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              </div>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
            >
              <X size={15} className="text-muted-foreground" />
            </button>
          </div>

          {/* ── scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* two-column meta + description */}
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-border">

              {/* left sidebar — meta */}
              <div className="px-6 py-6 space-y-6 flex-shrink-0">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2" style={mono}>기간</p>
                  <p className="text-sm font-medium text-foreground">{item.period}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2" style={mono}>기여도</p>
                  <p className="text-sm font-medium text-foreground">{item.contribution}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2" style={mono}>카테고리</p>
                  <p className="text-sm font-medium text-foreground">{item.category}</p>
                </div>
                {(item.url || item.github) && (
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2" style={mono}>링크</p>
                    <div className="flex flex-col gap-2">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#23c6a9] transition-colors"
                          style={mono}>
                          <Link size={10} /> Website <ArrowUpRight size={10} />
                        </a>
                      )}
                      {item.github && (
                        <a href={item.github} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#23c6a9] transition-colors"
                          style={mono}>
                          <Github size={10} /> GitHub <ArrowUpRight size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {/* stack — sidebar on desktop */}
                <div className="hidden sm:block">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3" style={mono}>Tech Stack</p>
                  <div className="space-y-3">
                    {item.stack.map((group: { label: string; items: string[] }) => (
                      <div key={group.label}>
                        <p className="text-[10px] text-muted-foreground mb-1.5" style={mono}>{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground" style={mono}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* right — description */}
              <div className="px-6 py-6">
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3" style={mono}>Description</p>
                <h3 className="text-2xl font-light leading-snug mb-4 text-foreground" style={serif}>
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light mb-6">{item.subtitle}</p>

                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3" style={mono}>Context</p>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.body}</p>

                {/* stack — mobile only */}
                <div className="mt-6 sm:hidden">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3" style={mono}>Tech Stack</p>
                  <div className="space-y-3">
                    {item.stack.map((group: { label: string; items: string[] }) => (
                      <div key={group.label}>
                        <p className="text-[10px] text-muted-foreground mb-1.5" style={mono}>{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground" style={mono}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── image gallery ── */}
            <div className="border-t border-border px-6 py-5">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-4" style={mono}>미리보기</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-xl flex items-center justify-center"
                    style={{ background: i === 0 ? item.color : `rgba(26,26,22,0.05)` }}
                  >
                    <span className={`${i === 0 ? "text-3xl" : "text-2xl opacity-20"}`}>
                      {i === 0 ? item.emoji : "🖼"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
