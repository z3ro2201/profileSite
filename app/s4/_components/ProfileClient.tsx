"use client";

import { Github, Instagram, Mail, Rss } from "lucide-react";
import { TEAL, mono, serif } from "../_lib/theme";
import { PROFILE } from "@/lib/profile";

export default function ProfileClient() {
  const sections = [
    {
      label: "어디서 왔나요",
      body: "서울 출신입니다. 어렸을 때부터 손으로 뭔가 만드는 걸 좋아해서 이것저것 해보다가, HTML 태그를 배우면서 '내가 만든 게 화면에 나타난다'는 감각에 빠졌습니다. 주변에서 칭찬해준 것도 계속하게 된 이유 중 하나였고요.",
    },
    {
      label: "어떻게 여기까지",
      body: "처음엔 HTML로 시작해서 PHP를 만져보게 됐고, 고등학생 때 대학교에서 주최한 홈페이지 경진대회에 참여했습니다. 이후 주변 소개로 프리랜서 일을 시작하면서 실무 감각을 익혔습니다.",
    },
    {
      label: "지금은 뭘 하나요",
      body: "퇴사 후 새로운 자리를 찾는 중입니다. TypeScript·React·Node.js 실력을 더 다지려고 이런저런 프로젝트를 직접 만들어보면서 경험을 쌓고 있습니다. 아이디어가 떠오르면 수첩이나 휴대폰에 메모해뒀다가, 시간이 날 때 하나씩 실행에 옮깁니다.",
    },
    {
      label: "추구하는 것",
      body: "할 수 없는 걸 할 수 있다고 말하지 않습니다. 아는 만큼, 할 수 있는 만큼만 정직하게 보여드리고 싶습니다.",
    },
    {
      label: "만드는 방식",
      body: "구조와 방향은 직접 설계하고, ChatGPT · Gemini · Claude 같은 AI 도구를 적극 활용해서 구현합니다. 디자인은 Figma로 하고요. 코드 한 줄까지 전부 손으로 쳤다고는 안 하겠습니다 — 다만 왜 이렇게 만들었는지는 설명할 수 있습니다.",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
      {/* ── left: narrative ── */}
      <div>
        <h2 className="text-5xl sm:text-6xl font-light leading-[1.05] mb-10" style={serif}>
          저는 <span className="italic">이런</span>
          <br />
          사람입니다.
        </h2>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.label}>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2" style={mono}>
                {s.label}
              </p>
              <p className="text-[1.05rem] text-foreground/80 leading-relaxed font-light">{s.body}</p>
            </div>
          ))}
        </div>

        {/* social row */}
        <div className="flex gap-3 mt-10">
          {[
            { icon: Github, label: "GitHub", href: PROFILE.github },
            { icon: Instagram, label: "Instagram", href: PROFILE.instagram },
            { icon: Mail, label: "Email", href: `mailto:${PROFILE.email}` },
            { icon: Rss, label: "RSS", href: "#" },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-[#23c6a9] hover:border-[#23c6a9] transition-all duration-200"
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>

      {/* ── right: personal tiles ── */}
      <div className="flex flex-col gap-3">
        {/* quick info card */}
        <div className="rounded-2xl border border-border p-5 space-y-3" style={{ background: "var(--card)" }}>
          {[
            ["위치", "Seoul, KR 🇰🇷"],
            ["상태", "기회 탐색 중 👀"],
            ["전문", "Full-Stack"],
          ].map(([k, v]) => (
            <div
              key={k as string}
              className="flex justify-between items-baseline border-b border-border pb-2.5 last:border-0 last:pb-0"
            >
              <span className="text-xs text-muted-foreground" style={mono}>
                {k}
              </span>
              <span className="text-xs font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>

        {/* tech highlight */}
        <div className="rounded-2xl border border-border p-5" style={{ background: "var(--tint)" }}>
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: TEAL, ...mono }}>
            주로 쓰는 기술
          </p>
          <div className="space-y-1.5 text-xs text-muted-foreground" style={mono}>
            <p>
              <span className="text-foreground">Frontend</span> · Next.js (React) · Tailwind CSS
            </p>
            <p>
              <span className="text-foreground">Backend</span> · Node.js · PHP
            </p>
            <p>
              <span className="text-foreground">Database</span> · MySQL / MariaDB
            </p>
            <p>
              <span className="text-foreground">요즘 살펴보는 것</span> · Spring · PostgreSQL · Docker · Kotlin
            </p>
          </div>
        </div>

        {/* contact mini */}
        <div className="rounded-2xl border border-border p-5" style={{ background: "var(--card)" }}>
          <p className="text-xs font-medium text-foreground mb-1">같이 만들어볼까요?</p>
          <p className="text-xs text-muted-foreground mb-4 font-light">프로젝트 협업이나 커피챗 환영합니다.</p>
          <a
            href={`mailto:${PROFILE.email}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: TEAL }}
          >
            <Mail size={12} /> {PROFILE.email}
          </a>
        </div>
      </div>
    </div>
  );
}
