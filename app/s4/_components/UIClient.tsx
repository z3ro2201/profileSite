"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { ChevronDown, ChevronRight, X, CheckCircle, Info, AlertTriangle, XCircle, House, Briefcase, User, Terminal } from "lucide-react";
import { TEAL, BG, mono, serif, sans } from "../_lib/theme";

export default function UIClient() {
  // ── existing state ──
  const [cbSm, setCbSm] = useState(false);
  const [cbBase, setCbBase] = useState(true);
  const [cbLg, setCbLg] = useState(false);
  const [radio, setRadio] = useState("옵션 1");
  const [selSm, setSelSm] = useState("옵션 1");
  const [selBase, setSelBase] = useState("옵션 1");
  const [selLg, setSelLg] = useState("옵션 1");
  const [modalOpen, setModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // ── new state ──
  const [activeTab, setActiveTab] = useState("개요");
  const [accordionOpen, setAccordionOpen] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(3);
  const [toasts, setToasts] = useState([true, true, true, true]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [rangeA, setRangeA] = useState(30);
  const [rangeB, setRangeB] = useState(60);
  const [rangeC, setRangeC] = useState(80);

  const toggleAccordion = (i: number) =>
    setAccordionOpen((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  const dismissToast = (i: number) =>
    setToasts((prev) => prev.map((v, idx) => (idx === i ? false : v)));

  const SL = (text: string) => (
    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-5" style={mono}>{text}</p>
  );

  const badgeVariants = [
    { label: "default", style: { background: "rgba(35,198,169,0.12)", color: TEAL } as CSSProperties },
    { label: "muted",   style: { background: "rgba(26,26,22,0.07)", color: "var(--muted-foreground)" } as CSSProperties },
    { label: "outline", style: { background: "transparent", color: "var(--muted-foreground)", border: "1px solid rgba(26,26,22,0.2)" } as CSSProperties },
  ];
  const badgeSizes = [
    { label: "sm",   cls: "text-[10px] px-2 py-0.5 rounded-full" },
    { label: "base", cls: "text-xs px-2.5 py-1 rounded-full" },
    { label: "lg",   cls: "text-sm px-3 py-1.5 rounded-full" },
    { label: "xl",   cls: "text-base px-4 py-2 rounded-full" },
  ];
  const btnVariants = [
    { label: "primary",   style: { background: TEAL, color: "#fff" } as CSSProperties, cls: "border-transparent" },
    { label: "secondary", style: { background: "rgba(26,26,22,0.06)", color: "var(--foreground)" } as CSSProperties, cls: "border-transparent" },
    { label: "outline",   style: { background: "transparent", color: "var(--foreground)" } as CSSProperties, cls: "border border-[rgba(26,26,22,0.2)]" },
  ];
  const btnSizes = [
    { label: "sm",   cls: "text-xs px-3 py-1.5 rounded-full" },
    { label: "base", cls: "text-sm px-4 py-2 rounded-full" },
    { label: "lg",   cls: "text-base px-5 py-2.5 rounded-full" },
    { label: "xl",   cls: "text-lg px-6 py-3 rounded-full" },
  ];
  const inputSizes = [
    { label: "sm",   cls: "text-xs px-3 py-1.5 rounded-xl" },
    { label: "base", cls: "text-sm px-4 py-2 rounded-xl" },
    { label: "lg",   cls: "text-base px-4 py-2.5 rounded-xl" },
    { label: "xl",   cls: "text-lg px-5 py-3 rounded-xl" },
  ];
  const selectSizes = [
    { label: "sm",   cls: "text-xs px-3 py-1.5 rounded-xl", val: selSm,   set: setSelSm },
    { label: "base", cls: "text-sm px-4 py-2 rounded-xl",   val: selBase, set: setSelBase },
    { label: "lg",   cls: "text-base px-4 py-2.5 rounded-xl", val: selLg, set: setSelLg },
  ];
  const cbSizes = [
    { label: "sm",   size: 14, textCls: "text-xs",   val: cbSm,   set: setCbSm },
    { label: "base", size: 16, textCls: "text-sm",   val: cbBase, set: setCbBase },
    { label: "lg",   size: 20, textCls: "text-base", val: cbLg,   set: setCbLg },
  ];
  const radioOptions = ["옵션 1", "옵션 2", "옵션 3"];
  const radioSizes = [
    { label: "sm",   size: 14, textCls: "text-xs" },
    { label: "base", size: 16, textCls: "text-sm" },
    { label: "lg",   size: 20, textCls: "text-base" },
  ];

  return (
    <div className="max-w-3xl">
      {/* page title */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: TEAL, ...mono }}>컴포넌트</p>
        <h2 className="text-4xl sm:text-5xl font-light leading-tight" style={serif}>
          UI <span className="italic">Components</span>
        </h2>
      </div>

      <div className="space-y-0">

        {/* ── Badge ── */}
        <section className="py-8 border-b border-border">
          {SL("Badge")}
          <div className="space-y-3">
            {badgeVariants.map((v) => (
              <div key={v.label} className="flex flex-wrap items-center gap-3">
                <span className="w-14 text-[10px] text-muted-foreground flex-shrink-0" style={mono}>{v.label}</span>
                {badgeSizes.map((s) => (
                  <span key={s.label} className={s.cls} style={{ ...mono, ...v.style }}>{s.label}</span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Button ── */}
        <section className="py-8 border-b border-border">
          {SL("Button")}
          <div className="space-y-3">
            {btnVariants.map((v) => (
              <div key={v.label} className="flex flex-wrap items-center gap-3">
                <span className="w-14 text-[10px] text-muted-foreground flex-shrink-0" style={mono}>{v.label}</span>
                {btnSizes.map((s) => (
                  <button key={s.label} className={`${s.cls} ${v.cls} font-medium transition-opacity hover:opacity-80`} style={{ ...sans, ...v.style }}>
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── TextInput ── */}
        <section className="py-8 border-b border-border">
          {SL("TextInput")}
          <div className="flex flex-wrap items-center gap-3">
            {inputSizes.map((s) => (
              <input key={s.label} type="text" placeholder="텍스트를 입력하세요"
                className={`${s.cls} border border-border focus:outline-none focus:border-[#23c6a9] transition-colors`}
                style={{ background: BG, ...sans, minWidth: 160 }}
              />
            ))}
          </div>
        </section>

        {/* ── Textarea ── */}
        <section className="py-8 border-b border-border">
          {SL("Textarea")}
          <div className="flex flex-wrap items-start gap-3">
            {[
              { label: "base", cls: "text-sm px-4 py-2 rounded-xl", rows: 3 },
              { label: "lg",   cls: "text-base px-4 py-2.5 rounded-xl", rows: 3 },
              { label: "xl",   cls: "text-lg px-5 py-3 rounded-xl", rows: 4 },
            ].map((s) => (
              <textarea key={s.label} rows={s.rows} placeholder="텍스트를 입력하세요"
                className={`${s.cls} border border-border focus:outline-none focus:border-[#23c6a9] transition-colors resize-none`}
                style={{ background: BG, ...sans, minWidth: 180 }}
              />
            ))}
          </div>
        </section>

        {/* ── Checkbox ── */}
        <section className="py-8 border-b border-border">
          {SL("Checkbox")}
          <div className="flex flex-wrap items-center gap-6">
            {cbSizes.map((s) => (
              <label key={s.label} className={`flex items-center gap-2 cursor-pointer select-none ${s.textCls}`}>
                <span className="flex-shrink-0 rounded flex items-center justify-center border transition-colors"
                  style={{ width: s.size, height: s.size, background: s.val ? TEAL : "transparent", borderColor: s.val ? TEAL : "rgba(26,26,22,0.25)" }}
                  onClick={() => s.set(!s.val)}
                >
                  {s.val && (
                    <svg width={s.size - 4} height={s.size - 4} viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={sans}>{s.label} 체크박스</span>
              </label>
            ))}
          </div>
        </section>

        {/* ── Radio ── */}
        <section className="py-8 border-b border-border">
          {SL("Radio")}
          <div className="space-y-3">
            {radioSizes.map((sz) => (
              <div key={sz.label} className="flex flex-wrap items-center gap-6">
                <span className="w-8 text-[10px] text-muted-foreground flex-shrink-0" style={mono}>{sz.label}</span>
                {radioOptions.map((opt) => (
                  <label key={opt} className={`flex items-center gap-2 cursor-pointer select-none ${sz.textCls}`}>
                    <span className="flex-shrink-0 rounded-full border flex items-center justify-center transition-colors"
                      style={{ width: sz.size, height: sz.size, borderColor: radio === opt ? TEAL : "rgba(26,26,22,0.25)" }}
                      onClick={() => setRadio(opt)}
                    >
                      {radio === opt && (
                        <span className="rounded-full" style={{ width: sz.size - 6, height: sz.size - 6, background: TEAL }} />
                      )}
                    </span>
                    <span style={sans}>{opt}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Select ── */}
        <section className="py-8 border-b border-border">
          {SL("Select / Combo")}
          <div className="flex flex-wrap items-center gap-3">
            {selectSizes.map((s) => (
              <div key={s.label} className="relative">
                <select value={s.val} onChange={(e) => s.set(e.target.value)}
                  className={`${s.cls} border border-border appearance-none pr-8 focus:outline-none focus:border-[#23c6a9] transition-colors`}
                  style={{ background: BG, ...sans, minWidth: 140 }}
                >
                  {["옵션 1", "옵션 2", "옵션 3"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Modal ── */}
        <section className="py-8 border-b border-border">
          {SL("Modal")}
          <button onClick={() => setModalOpen(true)}
            className="text-sm px-4 py-2 rounded-full font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: TEAL, ...sans }}
          >
            모달 열기
          </button>
          {modalOpen && (
            <>
              <div className="fixed inset-0 z-[60] bg-black/30"
                style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" } as CSSProperties}
                onClick={() => setModalOpen(false)}
              />
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
                  style={{ background: BG, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-medium text-foreground">모달 제목</h3>
                    <button onClick={() => setModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/6">
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">이것은 모달 본문 텍스트입니다. 확인 또는 취소 버튼으로 닫을 수 있습니다.</p>
                  </div>
                  <div className="flex justify-end gap-2 px-6 pb-5">
                    <button onClick={() => setModalOpen(false)} className="text-sm px-4 py-2 rounded-full border border-border hover:bg-black/4 transition-colors" style={sans}>취소</button>
                    <button onClick={() => setModalOpen(false)} className="text-sm px-4 py-2 rounded-full text-white transition-opacity hover:opacity-80" style={{ background: TEAL, ...sans }}>확인</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Alert Dialog ── */}
        <section className="py-8 border-b border-border">
          {SL("Dialog (Alert)")}
          <button onClick={() => setAlertOpen(true)}
            className="text-sm px-4 py-2 rounded-full font-medium border border-border text-foreground hover:bg-black/4 transition-colors"
            style={sans}
          >
            확인 대화상자
          </button>
          {alertOpen && (
            <>
              <div className="fixed inset-0 z-[60] bg-black/25"
                style={{ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" } as CSSProperties}
                onClick={() => setAlertOpen(false)}
              />
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden"
                  style={{ background: BG, boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}
                >
                  <div className="px-6 pt-6 pb-4">
                    <h3 className="text-base font-medium text-foreground mb-2">정말 삭제하시겠어요?</h3>
                    <p className="text-sm text-muted-foreground font-light">이 작업은 되돌릴 수 없습니다.</p>
                  </div>
                  <div className="flex gap-2 px-6 pb-5">
                    <button onClick={() => setAlertOpen(false)} className="flex-1 text-sm px-4 py-2 rounded-full border border-border hover:bg-black/4 transition-colors" style={sans}>취소</button>
                    <button onClick={() => setAlertOpen(false)} className="flex-1 text-sm px-4 py-2 rounded-full text-white transition-opacity hover:opacity-80" style={{ background: "#ef4444", ...sans }}>삭제</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Typography ── */}
        <section className="py-8 border-b border-border">
          {SL("Typography")}
          <div className="space-y-0">
            {[
              { tag: "h1", el: <h1 style={{ ...serif, fontSize: "3rem", fontWeight: 300, lineHeight: 1.1 }}>아름다운 타이포그래피</h1> },
              { tag: "h2", el: <h2 style={{ ...serif, fontSize: "2.25rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.15 }}>섬세한 디자인의 교차점</h2> },
              { tag: "h3", el: <h3 style={{ ...sans, fontSize: "1.5rem", fontWeight: 500 }}>UI 컴포넌트 시스템</h3> },
              { tag: "h4", el: <h4 style={{ ...sans, fontSize: "1.125rem", fontWeight: 500 }}>색상과 간격 토큰</h4> },
              { tag: "h5", el: <h5 style={{ ...sans, fontSize: "1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>기술 스택 개요</h5> },
              { tag: "subtitle", el: <p className="text-base text-muted-foreground font-light leading-relaxed">사람들이 실제로 즐겨 쓰는 제품을 만들기 위해, 깔끔한 엔지니어링과 섬세한 디자인의 교차점에서 일합니다.</p> },
            ].map(({ tag, el }, i, arr) => (
              <div key={tag} className={`flex items-start gap-4 py-4 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0 pt-1" style={mono}>{tag}</span>
                <div className="flex-1">{el}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Color Palette ── */}
        <section className="py-8 border-b border-border">
          {SL("Color Palette")}
          {(() => {
            const colors = [
              { name: "danger",  hex: "#ef4444", badge: { bg: "#fef2f2", text: "#ef4444" } },
              { name: "warning", hex: "#f59e0b", badge: { bg: "#fffbeb", text: "#d97706" } },
              { name: "info",    hex: "#3b82f6", badge: { bg: "#eff6ff", text: "#3b82f6" } },
              { name: "success", hex: "#23c6a9", badge: { bg: "#eef8f6", text: "#23c6a9" } },
              { name: "light",   hex: "#f5f5f1", badge: { bg: "#f5f5f1", text: "#7a7a72" } },
              { name: "dark",    hex: "#1a1a16", badge: { bg: "#1a1a16", text: "#ffffff" } },
            ];
            return (
              <>
                <div className="flex flex-wrap gap-4 mb-6">
                  {colors.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl border border-border" style={{ background: c.hex }} />
                      <span className="text-[10px] text-muted-foreground" style={mono}>{c.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span key={c.name} className="text-[10px] px-2.5 py-1 rounded-full" style={{ ...mono, background: c.badge.bg, color: c.badge.text }}>{c.name}</span>
                  ))}
                </div>
              </>
            );
          })()}
        </section>

        {/* ── Card ── */}
        <section className="py-8 border-b border-border">
          {SL("Card")}
          <div className="flex flex-wrap gap-3">
            {/* Default */}
            <div className="rounded-2xl border border-[rgba(26,26,22,0.08)] bg-white p-5 min-w-[200px] max-w-[260px] flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">기본 카드</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">카드 컴포넌트의 기본 스타일입니다.</p>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-full text-white self-start" style={{ background: TEAL, ...sans }}>버튼</button>
            </div>
            {/* Teal accent */}
            <div className="rounded-2xl border border-[rgba(26,26,22,0.08)] p-5 min-w-[200px] max-w-[260px]" style={{ borderLeft: `3px solid ${TEAL}`, background: BG }}>
              <p className="text-sm font-medium text-foreground mb-1">강조 카드</p>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">왼쪽 테두리로 중요도를 표현합니다.</p>
            </div>
            {/* Dark */}
            <div className="rounded-2xl p-5 min-w-[200px] max-w-[260px]" style={{ background: "#1a1a16" }}>
              <p className="text-sm font-medium text-white mb-1">다크 카드</p>
              <p className="text-xs leading-relaxed font-light" style={{ color: "#a0a09a" }}>어두운 배경 위의 카드입니다.</p>
            </div>
          </div>
        </section>

        {/* ── Breadcrumb ── */}
        <section className="py-8 border-b border-border">
          {SL("Breadcrumb")}
          <div className="flex items-center gap-1" style={mono}>
            {["첫화면", "블로그", "글 제목"].map((item, i, arr) => (
              <span key={item} className="flex items-center gap-1">
                <span className={`text-xs ${i === arr.length - 1 ? "" : "text-muted-foreground hover:text-foreground cursor-pointer"}`}
                  style={i === arr.length - 1 ? { color: TEAL } : {}}>
                  {item}
                </span>
                {i < arr.length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
              </span>
            ))}
          </div>
        </section>

        {/* ── HR ── */}
        <section className="py-8 border-b border-border">
          {SL("Horizontal Rule")}
          <div className="space-y-5">
            <hr className="border-border" />
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground" style={mono}>또는</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <hr className="border-dashed border-border" />
            <hr style={{ borderColor: TEAL }} />
          </div>
        </section>

        {/* ── Table ── */}
        <section className="py-8 border-b border-border">
          {SL("Table")}
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full" style={{ ...mono, background: "#eff6ff", color: "#3b82f6" }}>
              ← 가로로 스크롤하면 전체 내용을 볼 수 있어요
            </span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-[600px] w-full text-sm" style={{ background: BG }}>
              <thead>
                <tr style={{ background: "rgba(26,26,22,0.04)" }}>
                  {["이름", "역할", "기술", "경력", "상태", "액션"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium" style={mono}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "김준호", role: "Frontend Dev", tech: "React · TypeScript", exp: "5년", status: "재직 중", statusColor: { bg: "#eef8f6", text: "#23c6a9" } },
                  { name: "이서연", role: "Backend Dev",  tech: "Node.js · PostgreSQL", exp: "3년", status: "협업 중", statusColor: { bg: "#fffbeb", text: "#d97706" } },
                  { name: "박민준", role: "DevOps",       tech: "Docker · AWS", exp: "7년", status: "휴직",    statusColor: { bg: "#fef2f2", text: "#ef4444" } },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-black/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground text-sm">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{row.role}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs" style={mono}>{row.tech}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{row.exp}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ ...mono, background: row.statusColor.bg, color: row.statusColor.text }}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[10px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:border-[#23c6a9] hover:text-[#23c6a9] transition-colors" style={mono}>보기</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Skeleton ── */}
        <section className="py-8 border-b border-border">
          {SL("Placeholder / Skeleton")}
          <div className="flex flex-wrap gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border p-4 w-[200px]" style={{ background: BG }}>
                <div className="aspect-video rounded-xl bg-[#e8e8e4] animate-pulse mb-3" />
                <div className="h-3 rounded-full bg-[#e8e8e4] animate-pulse mb-2" style={{ width: "80%" }} />
                <div className="h-3 rounded-full bg-[#e8e8e4] animate-pulse" style={{ width: "55%" }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Spinner ── */}
        <section className="py-8 border-b border-border">
          {SL("Spinner")}
          <div className="flex flex-wrap items-end gap-6">
            {[
              { label: "sm",   cls: "w-4 h-4 border-2" },
              { label: "base", cls: "w-6 h-6 border-2" },
              { label: "lg",   cls: "w-8 h-8 border-[3px]" },
              { label: "xl",   cls: "w-12 h-12 border-4" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className={`${s.cls} rounded-full animate-spin border-t-transparent`} style={{ borderColor: TEAL, borderTopColor: "transparent" }} />
                <span className="text-[10px] text-muted-foreground" style={mono}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Progress Bar ── */}
        <section className="py-8 border-b border-border">
          {SL("Progress Bar")}
          <div className="space-y-3">
            {[
              { pct: 25, color: "#ef4444", label: "25%" },
              { pct: 50, color: "#f59e0b", label: "50%" },
              { pct: 75, color: "#3b82f6", label: "75%" },
              { pct: 100, color: TEAL,     label: "100%" },
            ].map((p) => (
              <div key={p.pct} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-8 text-right flex-shrink-0" style={mono}>{p.label}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(26,26,22,0.08)" }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Range ── */}
        <section className="py-8 border-b border-border">
          {SL("Range / Slider")}
          <style>{`input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;outline:none;cursor:pointer}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:${TEAL};cursor:pointer;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.15)}input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:${TEAL};cursor:pointer;border:2px solid white}`}</style>
          <div className="space-y-4">
            {[
              { label: "sm",   value: rangeA, set: setRangeA, h: "h-[3px]" },
              { label: "base", value: rangeB, set: setRangeB, h: "h-[4px]" },
              { label: "lg",   value: rangeC, set: setRangeC, h: "h-[6px]" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground w-8 flex-shrink-0" style={mono}>{r.label}</span>
                <input type="range" min={0} max={100} value={r.value}
                  onChange={(e) => r.set(Number(e.target.value))}
                  className={`flex-1 ${r.h}`}
                  style={{ accentColor: TEAL, background: `linear-gradient(to right, ${TEAL} ${r.value}%, rgba(26,26,22,0.12) ${r.value}%)` }}
                />
                <span className="text-[10px] text-muted-foreground w-8 text-right flex-shrink-0" style={mono}>{r.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Button Group ── */}
        <section className="py-8 border-b border-border">
          {SL("Button Group")}
          <div className="flex flex-wrap gap-6 items-center">
            {/* Segmented */}
            <div className="flex">
              {["이전", "현재", "다음"].map((label, i) => (
                <button key={label}
                  className="text-xs px-4 py-2 border font-medium transition-colors"
                  style={{
                    ...mono,
                    borderColor: i === 1 ? TEAL : "rgba(26,26,22,0.2)",
                    background: i === 1 ? TEAL : "transparent",
                    color: i === 1 ? "#fff" : "var(--muted-foreground)",
                    borderRadius: i === 0 ? "9999px 0 0 9999px" : i === 2 ? "0 9999px 9999px 0" : "0",
                    marginLeft: i > 0 ? "-1px" : "0",
                    zIndex: i === 1 ? 1 : 0,
                    position: "relative",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Icon group B/I/U */}
            <div className="flex">
              {[
                { label: "B", style: { fontWeight: 700 } },
                { label: "I", style: { fontStyle: "italic" } },
                { label: "U", style: { textDecoration: "underline" } },
              ].map(({ label, style }, i) => (
                <button key={label}
                  className="w-9 h-9 flex items-center justify-center border text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{
                    borderColor: "rgba(26,26,22,0.2)",
                    borderRadius: i === 0 ? "9999px 0 0 9999px" : i === 2 ? "0 9999px 9999px 0" : "0",
                    marginLeft: i > 0 ? "-1px" : "0",
                    ...style,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tab ── */}
        <section className="py-8 border-b border-border">
          {SL("Tab")}
          <div className="border-b border-border flex gap-6 mb-4">
            {["개요", "기술", "경력"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="pb-3 text-sm transition-colors relative"
                style={{
                  ...sans,
                  color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: activeTab === tab ? 500 : 400,
                  borderBottom: activeTab === tab ? `2px solid ${TEAL}` : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground font-light leading-relaxed">
            {activeTab === "개요" && "풀스택 개발자로 사용자 경험을 중심에 두고 제품을 만듭니다. 아이디어에서 배포까지 전 과정을 경험했습니다."}
            {activeTab === "기술" && "TypeScript · React · Next.js · Node.js · PostgreSQL · Docker · AWS · Tailwind CSS 등을 주력으로 사용합니다."}
            {activeTab === "경력" && "Craft Labs (2023–현재), Novaline Systems (2021–2023), Pixel Workshop (2019–2021) 등에서 근무했습니다."}
          </div>
        </section>

        {/* ── Accordion ── */}
        <section className="py-8 border-b border-border">
          {SL("Accordion")}
          <div className="rounded-2xl border border-border overflow-hidden" style={{ background: BG }}>
            {[
              { q: "어떤 기술 스택을 주로 사용하나요?", a: "TypeScript와 React를 기반으로 프론트엔드를 구성하고, Node.js와 Python으로 백엔드를 처리합니다. 인프라는 AWS와 Docker를 주로 활용합니다." },
              { q: "프리랜서 프로젝트를 받으시나요?",    a: "네, 흥미로운 프로젝트라면 협업할 수 있습니다. 먼저 이메일로 간단한 프로젝트 개요를 보내주시면 검토 후 답변드리겠습니다." },
              { q: "협업 방식은 어떻게 되나요?",          a: "비동기 커뮤니케이션을 선호하며, 주로 GitHub과 Notion을 통해 협업합니다. 필요한 경우 정기 미팅도 진행합니다." },
            ].map(({ q, a }, i) => (
              <div key={i} className={i > 0 ? "border-t border-border" : ""}>
                <button onClick={() => toggleAccordion(i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground text-left"
                  style={sans}
                >
                  <span>{q}</span>
                  <ChevronDown size={15} className="text-muted-foreground flex-shrink-0 ml-3 transition-transform"
                    style={{ transform: accordionOpen.includes(i) ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {accordionOpen.includes(i) && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground font-light leading-relaxed border-t border-border pt-3" style={sans}>
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Pagination ── */}
        <section className="py-8 border-b border-border">
          {SL("Pagination")}
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-muted-foreground border border-border hover:border-[#23c6a9] hover:text-[#23c6a9] transition-colors"
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
            >←</button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setCurrentPage(n)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
                style={currentPage === n
                  ? { background: TEAL, color: "#fff", fontWeight: 500 }
                  : { color: "var(--muted-foreground)" }
                }
              >{n}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-muted-foreground border border-border hover:border-[#23c6a9] hover:text-[#23c6a9] transition-colors"
              disabled={currentPage === 5}
              style={{ opacity: currentPage === 5 ? 0.4 : 1 }}
            >→</button>
          </div>
        </section>

        {/* ── Toast / Notification ── */}
        <section className="py-8 border-b border-border">
          {SL("Toast / Notification")}
          <div className="space-y-2 max-w-sm">
            {[
              { icon: CheckCircle, bg: "#eef8f6", text: "#23c6a9", msg: "저장되었습니다.", iconColor: "#23c6a9" },
              { icon: Info,         bg: "#eff6ff", text: "#3b82f6", msg: "새로운 업데이트가 있습니다.", iconColor: "#3b82f6" },
              { icon: AlertTriangle,bg: "#fffbeb", text: "#d97706", msg: "확인이 필요합니다.", iconColor: "#f59e0b" },
              { icon: XCircle,      bg: "#fef2f2", text: "#ef4444", msg: "오류가 발생했습니다.", iconColor: "#ef4444" },
            ].map(({ icon: Icon, bg, text, msg, iconColor }, i) => (
              toasts[i] && (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: bg }}>
                  <Icon size={16} style={{ color: iconColor, flexShrink: 0 }} />
                  <span className="flex-1 text-sm font-medium" style={{ color: text, ...sans }}>{msg}</span>
                  <button onClick={() => dismissToast(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={13} />
                  </button>
                </div>
              )
            ))}
            {toasts.every((v) => !v) && (
              <button onClick={() => setToasts([true, true, true, true])}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                style={mono}
              >다시 보기</button>
            )}
          </div>
        </section>

        {/* ── Popover ── */}
        <section className="py-8 border-b border-border">
          {SL("Popover")}
          <div className="relative inline-block">
            <button onClick={() => setPopoverOpen((v) => !v)}
              className="text-sm px-4 py-2 rounded-full border border-border font-medium text-foreground hover:border-[#23c6a9] hover:text-[#23c6a9] transition-colors"
              style={sans}
            >
              팝오버 열기
            </button>
            {popoverOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border shadow-lg p-4" style={{ background: BG }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">팝오버</p>
                  <button onClick={() => setPopoverOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={13} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">버튼 아래에 표시되는 작은 팝오버 패널입니다. 추가 정보나 빠른 액션을 담을 수 있어요.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Navigator ── */}
        <section className="py-8 border-b border-border">
          {SL("Navigator")}
          <div className="w-[180px] rounded-xl border border-border p-2 space-y-0.5" style={{ background: BG }}>
            {[
              { label: "대시보드", icon: House,    active: true },
              { label: "프로젝트", icon: Briefcase, active: false },
              { label: "팀원",     icon: User,      active: false },
              { label: "설정",     icon: Terminal,  active: false },
            ].map(({ label, icon: Icon, active }) => (
              <div key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                style={active
                  ? { borderLeft: `3px solid ${TEAL}`, background: "rgba(35,198,169,0.08)", color: TEAL, paddingLeft: "calc(0.75rem - 3px)" }
                  : { color: "var(--muted-foreground)" }
                }
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span style={sans}>{label}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
