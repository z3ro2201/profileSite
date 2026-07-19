"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  MapPin,
  Clapperboard,
  Github,
  Instagram,
  Terminal,
  Zap,
  BookOpen,
  Coffee,
  Mail,
} from "lucide-react";
import { TEAL, mono, serif, tile, tileTeal, tileDark, TECH_STACK } from "../_lib/theme";
import { PROFILE } from "@/lib/profile";
import type { GithubStats } from "@/lib/github";

// 0에서 target까지 부드럽게 세는 카운트업 애니메이션
function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function CountUp({ value }: { value: number }) {
  const animated = useCountUp(value);
  return <>{animated}</>;
}

// languages 막대의 각 구간도 숫자랑 같은 방식(0→실제 값)으로 차오르게
function AnimatedBarSegment({ pct, color }: { pct: number; color: string }) {
  const animatedPct = useCountUp(pct);
  return <div style={{ width: `${animatedPct}%`, background: color }} />;
}

const HomeClient = ({ githubStats }: { githubStats: GithubStats }) => {
  // new Date()를 useState 초기값으로 바로 넣으면 서버가 렌더링한 시각과
  // 클라이언트가 하이드레이션하는 시각 사이에 실제 시간이 흘러서(초 단위라도)
  // 하이드레이션 불일치가 남. null로 시작해서 서버/클라이언트 첫 렌더를 동일하게 만들고,
  // 실제 시각은 마운트 이후(useEffect, 클라이언트 전용)에만 채운다.
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 최초 시각 반영 + 매초 갱신 시작
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = time ? String(time.getHours()).padStart(2, "0") : "--";
  const mm = time ? String(time.getMinutes()).padStart(2, "0") : "--";
  const ss = time ? String(time.getSeconds()).padStart(2, "0") : "--";

  // 매초 갱신되는 시계 때문에 컴포넌트가 1초마다 리렌더되는데,
  // 렌더 중에 Math.random()을 부르면(설령 useMemo 안이라도) 리렌더될 때마다
  // 히트맵 색이 깜빡일 수 있다. 마운트 시 이펙트에서 한 번만 계산해 state로 고정한다.
  // (반짝이는 효과 자체는 CSS 애니메이션이 담당해서 리렌더링과 무관하게 계속 동작함 — 아래 렌더 부분 참고)
  const [heatmap, setHeatmap] = useState<{ peak: number; delay: number }[]>(() =>
    Array.from({ length: 52 }, () => ({ peak: 0.08, delay: 0 })),
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회만 랜덤 고정
    setHeatmap(
      Array.from({ length: 52 }, () => {
        const r = Math.random();
        const peak = r < 0.4 ? 0.08 : r < 0.7 ? 0.3 : r < 0.9 ? 0.6 : 1;
        return { peak, delay: Math.random() * 3 };
      }),
    );
  }, []);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
      {/* Hero */}
      <div className={`${tileDark} col-span-12 md:col-span-8`} style={{ background: "#1a1a16", minHeight: 220 }}>
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: TEAL, ...mono }}>
          Full-Stack Developer
        </p>
        <h1 className="text-5xl sm:text-6xl font-light text-white leading-[1.05] mb-4" style={serif}>
          Kim <span className="italic">Zero</span>.
        </h1>
        <p className="text-[#a0a09a] text-sm leading-relaxed font-light max-w-md mt-auto">
          어릴 때 홈페이지 만들어보다 재미 붙인 게 시작이에요.{" "}
          <span style={{ color: TEAL }}>지금도 필요한 걸, 필요한 만큼만</span> 만듭니다.
        </p>
      </div>

      {/* Status */}
      <div
        className={`${tileTeal} col-span-12 md:col-span-4 justify-between`}
        style={{ background: "rgba(35,198,169,0.08)", minHeight: 160 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: TEAL }} />
          <span className="text-xs text-muted-foreground" style={mono}>
            현재 상태
          </span>
        </div>
        <p className="text-foreground font-medium text-lg leading-snug mb-1">
          새로운 기회에
          <br />
          열려 있어요 👋
        </p>
        <a
          href={`mailto:${PROFILE.email}`}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: TEAL }}
        >
          연락하기 <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Clock */}
      <div className={`${tile} col-span-6 md:col-span-4 justify-between`} style={{ minHeight: 140 }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          <MapPin size={13} />
          <span className="text-xs" style={mono}>
            Seoul, KR 🇰🇷
          </span>
        </div>
        <div>
          <p className="text-3xl font-light tabular-nums text-foreground" style={serif}>
            {hh}:{mm}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5" style={mono}>
            KST +09:00 · :{ss}
          </p>
        </div>
      </div>

      {/* Favorite */}
      <div className={`${tile} col-span-6 md:col-span-4`} style={{ minHeight: 140, background: "var(--secondary)" }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-auto">
          <Clapperboard size={13} />
          <span className="text-xs" style={mono}>
            favorite
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">애니메이션</p>
          <p className="text-base font-medium text-foreground leading-tight">명탐정 코난</p>
          <span
            className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full"
            style={{ ...mono, background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            detective conan
          </span>
        </div>
      </div>

      {/* GitHub Stats */}
      <div className={`${tile} col-span-12 md:col-span-4`} style={{ minHeight: 140 }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          <Github size={13} />
          <span className="text-xs" style={mono}>
            github stats
          </span>
        </div>
        <div className="flex gap-4 mb-4">
          {(
            [
              [githubStats.commits, "commits"],
              [githubStats.prs, "PRs"],
              [githubStats.repos, "repos"],
            ] as [number, string][]
          ).map(([n, l]) => (
            <div key={l}>
              <p className="text-2xl font-light text-foreground" style={serif}>
                <CountUp value={n} />
              </p>
              <p className="text-xs text-muted-foreground" style={mono}>
                {l}
              </p>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 flex-wrap mt-auto">
          {heatmap.map((dot, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-[2px]"
              style={
                {
                  background: TEAL,
                  "--peak-opacity": dot.peak,
                  opacity: dot.peak,
                  animation: `s4-heatmap-twinkle 0.9s steps(1, end) ${dot.delay}s infinite`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className={`${tile} col-span-12 md:col-span-6`} style={{ minHeight: 160 }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
          <Terminal size={13} />
          <span className="text-xs" style={mono}>
            tech stack
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((t) => (
            <span
              key={t}
              className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:border-[#23c6a9] hover:text-[#23c6a9] transition-all duration-200 cursor-default"
              style={mono}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className={`${tile} col-span-12 md:col-span-6`} style={{ minHeight: 160 }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
          <Zap size={13} />
          <span className="text-xs" style={mono}>
            languages
          </span>
        </div>
        {githubStats.languages.length > 0 ? (
          <>
            <div className="flex rounded-full overflow-hidden h-2 mb-5">
              {githubStats.languages.map((l) => (
                <AnimatedBarSegment key={l.name} pct={l.pct} color={l.color} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {githubStats.languages.map((l) => (
                <div key={l.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-xs text-muted-foreground" style={mono}>
                    {l.name}
                  </span>
                  <span className="text-xs text-foreground ml-auto" style={mono}>
                    <CountUp value={l.pct} />%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground" style={mono}>
            불러오는 중이거나 데이터가 없습니다.
          </p>
        )}
      </div>

      {/* Experience */}
      <div className={`${tile} col-span-12 md:col-span-8`} style={{ minHeight: 160 }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-5">
          <BookOpen size={13} />
          <span className="text-xs" style={mono}>
            experience
          </span>
        </div>
        <div className="space-y-4">
          {[
            { period: "2022 — 2026", company: "keystone education", role: "Junior Software Engineer" },
            { period: "2019 — 2021", company: "freelancer", role: "Backend/Frontend Developer" },
          ].map((j) => (
            <div
              key={j.company}
              className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <span className="text-[11px] text-muted-foreground w-28 flex-shrink-0" style={mono}>
                {j.period}
              </span>
              <span className="text-sm font-medium text-foreground">{j.role}</span>
              <span className="text-xs ml-auto" style={{ color: TEAL, ...mono }}>
                @ {j.company}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fun facts */}
      <div
        className={`${tile} col-span-12 md:col-span-4 justify-between`}
        style={{ minHeight: 160, background: "var(--tint)" }}
      >
        <div className="flex items-center gap-1.5 mb-3">
          <Coffee size={13} style={{ color: TEAL }} />
          <span className="text-xs text-muted-foreground" style={mono}>
            about me
          </span>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground font-light flex-1">
          {[
            "☕ 하루 커피 3잔 이상",
            "🏋️ 주 3-4회 이상 운동",
            "🍿 명탐정 코난은 꼭 즐겨 봄",
            "✍️ 생각나는 아이디어는 실행",
          ].map((f) => (
            <li key={f} className="leading-snug">
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Awards */}
      <div className={`${tile} col-span-12`} style={{ minHeight: 140 }}>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-5">
          <Zap size={13} style={{ color: TEAL }} />
          <span className="text-xs" style={{ color: TEAL, ...mono }}>
            awards & recognition
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              year: "2008",
              title: "홈페이지 제작 경진대회 장려",
              org: "동서울대학",
              desc: "[동서울 대학 페스티벌] 주제",
            },
            {
              year: "2009",
              title: "홈페이지 제작 경진대회 은상",
              org: "단국공업고등학교",
              desc: "19지구 자율장학회 주최",
            },
            {
              year: "2009",
              title: "홈페이지 제작 경진대회 우수",
              org: "동서울대학",
              desc: "[동서울대학 자원봉사 동호회] 주제",
            },
          ].map((a) => (
            <div key={a.title} className="flex gap-4 p-4 rounded-xl" style={{ background: "var(--secondary)" }}>
              <div className="flex-shrink-0 text-right">
                <span className="text-xs font-medium" style={{ color: TEAL, ...mono }}>
                  {a.year}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{a.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-1.5" style={mono}>
                  {a.org}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA — iMessage style */}
      <div className={`${tile} col-span-12`} style={{ background: "var(--secondary)", padding: "1.75rem" }}>
        <p className="text-xs tracking-widest uppercase mb-5" style={{ color: TEAL, ...mono }}>
          연락하기
        </p>
        <div className="flex flex-col gap-3 mb-6">
          {/* incoming bubble */}
          <div className="flex items-end gap-2">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white"
              style={{ background: TEAL }}
            >
              KJ
            </div>
            <div
              className="max-w-xs px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
              style={{ background: "var(--secondary)", color: "var(--foreground)" }}
            >
              같이 만들어볼 프로젝트가 있으신가요? 아니면 그냥 안녕이라도 👋
            </div>
          </div>
          {/* outgoing bubble */}
          <div className="flex justify-end">
            <div
              className="max-w-xs px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed text-white"
              style={{ background: TEAL }}
            >
              좋아요, 연락해볼게요 🙌
            </div>
          </div>
        </div>
        {/* action buttons */}
        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${PROFILE.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border bg-[var(--card)] hover:border-[#23c6a9] hover:text-[#23c6a9] transition-all duration-200"
          >
            <Mail size={13} /> 이메일 보내기
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border bg-[var(--card)] hover:border-[#23c6a9] hover:text-[#23c6a9] transition-all duration-200"
          >
            <Github size={13} /> GitHub
          </a>
          <a
            href={PROFILE.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border bg-[var(--card)] hover:border-[#23c6a9] hover:text-[#23c6a9] transition-all duration-200"
          >
            <Instagram size={13} /> Instagram
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeClient;
