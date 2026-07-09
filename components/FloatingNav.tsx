"use client";

import dynamic from "next/dynamic";
const YouTube = dynamic(() => import("react-youtube"), { ssr: false });

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { YouTubeEvent, YouTubePlayer, YouTubeProps } from "react-youtube";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Github,
  Instagram,
  Mail,
  Music,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  House,
  User,
  Newspaper,
  Briefcase,
  History,
  Layers,
} from "lucide-react";
import { TEAL, mono, PLAYLIST } from "@/lib/nav-shared";
import { PROFILE } from "@/lib/profile";
import { useNavTheme } from "@/components/theme/NavThemeContext";

// 블로그/앱은 이미 있는 라우트를 그대로 사용 (구조 변경 예정이라 s4에 복제하지 않음)
const S4_NAV = [
  { href: "/s4", label: "첫화면", icon: House },
  { href: "/s4/profile", label: "프로필", icon: User },
  { href: "/blog", label: "블로그", icon: Newspaper },
  { href: "/s4/project", label: "프로젝트", icon: Briefcase },
  { href: "/s4/ui", label: "UI", icon: Layers },
] as const;

type S4NavItem = (typeof S4_NAV)[number];

export function FloatingNav() {
  const { isDark } = useNavTheme();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // /s4 는 정확히 일치할 때만, 나머지는 prefix 매칭
  const activeHref = S4_NAV.find((n) => (n.href === "/s4" ? pathname === "/s4" : pathname.startsWith(n.href)))?.href;

  const glassShell: CSSProperties = {
    background: isDark ? "rgba(26,26,24,0.75)" : "rgba(250,250,248,0.55)",
    backdropFilter: "blur(28px) saturate(200%)",
    WebkitBackdropFilter: "blur(28px) saturate(200%)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.75)",
    boxShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.4), 0 1.5px 0 rgba(255,255,255,0.08) inset"
      : "0 8px 32px rgba(0,0,0,0.10), 0 1.5px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.04) inset",
  };
  const activePill: CSSProperties = {
    background: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.92)",
    boxShadow: isDark ? "0 1px 6px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,1) inset",
  };

  // measure active button and move pill
  useEffect(() => {
    const btn = activeHref ? btnRefs.current.get(activeHref) : undefined;
    const nav = navRef.current;
    if (!btn || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [activeHref]);

  // ── music player (player.tsx와 동일하게 react-youtube의 실제 Player API로 제어) ──
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const currentTrack = PLAYLIST[trackIdx];
  const ytRef = useRef<YouTubePlayer | null>(null);
  // 유튜브 iframe API가 실제로 준비됐는지. ytRef만으로는 "준비되자마자 최신 트랙을
  // 다시 로드"하는 트리거가 안 걸려서 별도 state로 추적한다.
  const [playerReady, setPlayerReady] = useState(false);

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
  };

  const onReady: YouTubeProps["onReady"] = (e: YouTubeEvent) => {
    ytRef.current = e.target;
    setPlayerReady(true);
  };

  // 곡이 끝나면(0 = ended) 자동으로 다음 곡. 3 = buffering, 1 = playing.
  const onPlayerState: YouTubeProps["onStateChange"] = (e: YouTubeEvent<number>) => {
    if (e.data === 3) setIsBuffering(true);
    else if (e.data === 1) setIsBuffering(false);
    else if (e.data === 0) {
      setIsBuffering(false);
      setTrackIdx((i) => (i + 1) % PLAYLIST.length);
    }
  };

  // 트랙이 바뀌거나(trackIdx) 플레이어가 뒤늦게 준비되면(playerReady) 현재 선택된 곡을 로드.
  // playerReady를 의존성에 넣어야, "플레이어 준비 전에 트랙을 클릭"한 경우에도
  // 준비되는 순간 그때의 최신 trackIdx를 다시 반영한다 (버튼 클릭 ↔ 실제 재생 영상 불일치 버그 수정).
  useEffect(() => {
    const yt = ytRef.current;
    if (!yt || !playerReady) return;
    yt.loadVideoById(currentTrack.ytId);
    if (muted) yt.mute();
    else yt.unMute();
    if (playing) yt.playVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muted/playing은 아래 별도 effect에서 처리
  }, [trackIdx, playerReady]);

  // 재생/일시정지, 음소거는 버튼 클릭 시 곧바로 API 호출 (아래는 외부 요인 대비 동기화용)
  useEffect(() => {
    const yt = ytRef.current;
    if (!yt) return;
    if (playing) yt.playVideo();
    else yt.pauseVideo();
  }, [playing]);

  useEffect(() => {
    const yt = ytRef.current;
    if (!yt) return;
    if (muted) yt.mute();
    else yt.unMute();
  }, [muted]);

  const togglePlay = useCallback(() => setPlaying((v) => !v), []);
  const toggleMute = useCallback(() => setMuted((v) => !v), []);
  const prevTrack = useCallback(() => setTrackIdx((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length), []);
  const nextTrack = useCallback(() => setTrackIdx((i) => (i + 1) % PLAYLIST.length), []);

  // FloatingNav는 ClientShell에서 children의 형제로 렌더링돼서 SeasonShell의
  // .s4-root 스코프 밖에 있음. SeasonShell을 쓰는 경로(/s4, /privacy 등)에서만
  // 스스로 .s4-root를 씌워서 teal 톤을 가져오고, /blog처럼 SeasonShell을 안 쓰는
  // 곳에서는 기본(ui-v2) 톤으로 자연스럽게 렌더링되게 한다.
  const usesSeasonShell = pathname === "/s4" || pathname.startsWith("/s4/") || pathname === "/privacy" || pathname.startsWith("/privacy/");
  const scopeClass = usesSeasonShell ? `s4-root${isDark ? " dark" : ""}` : "";

  return (
    <div
      className={`fixed bottom-10 inset-x-0 z-50 flex items-center justify-center px-4 pointer-events-none gap-2 flex-wrap-reverse ${scopeClass}`}
    >
      <nav
        ref={navRef}
        aria-label="주요 메뉴"
        className="pointer-events-auto relative flex items-center rounded-full px-2 py-2"
        style={glassShell}
      >
        {/* sliding background pill */}
        <div
          className="absolute top-2 bottom-2 rounded-full pointer-events-none"
          style={{
            ...activePill,
            left: pillStyle.left,
            width: pillStyle.width,
            opacity: pillStyle.opacity,
            transition:
              pillStyle.opacity === 0
                ? "none"
                : "left 0.42s cubic-bezier(0.34,1.4,0.64,1), width 0.42s cubic-bezier(0.34,1.4,0.64,1)",
          }}
        />

        {/* tab buttons */}
        {S4_NAV.map((n: S4NavItem) => {
          const isActive = activeHref === n.href;
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              ref={(el) => {
                if (el) btnRefs.current.set(n.href, el);
              }}
              aria-current={isActive ? "page" : undefined}
              className="relative z-10 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full whitespace-nowrap select-none"
              style={{
                color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                transition: "color 0.2s ease",
              }}
            >
              {/* icon — always visible, teal when active */}
              <Icon
                size={17}
                style={{ color: isActive ? TEAL : undefined, transition: "color 0.2s ease", flexShrink: 0 }}
              />
              {/* active dot — desktop only */}
              {isActive && (
                <span className="hidden sm:block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TEAL }} />
              )}
              {/* label — desktop only */}
              <span className="hidden sm:inline text-sm leading-none" style={{ fontWeight: isActive ? 500 : 400 }}>
                {n.label}
              </span>
            </Link>
          );
        })}

        {/* divider + social icons */}
        <span
          className="hidden sm:block w-px h-4 mx-1 flex-shrink-0 relative z-10"
          style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }}
        />

        <a
          href="/s3"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="hidden sm:flex relative z-10 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <History size={14} />
        </a>

        <a
          href={PROFILE.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="hidden sm:flex relative z-10 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github size={14} />
        </a>
        <a
          href={PROFILE.instagram}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="hidden sm:flex relative z-10 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <Instagram size={14} />
        </a>
        <a
          href={`mailto:${PROFILE.email}`}
          aria-label="Email"
          className="hidden sm:flex relative z-10 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mail size={14} />
        </a>
      </nav>

      {/* player pill */}
      <div className="pointer-events-auto relative">
        {/* YouTube popup — 항상 마운트해두고 패널 열림 여부는 CSS로만 제어.
            그래야 패널을 닫아도(playerOpen=false) 음악이 끊기지 않고 계속 재생됨. */}
        <div
          className="absolute bottom-[calc(100%+10px)] right-0 rounded-2xl overflow-hidden"
          style={{
            width: 300,
            boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
            border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
            transition: "opacity 0.2s ease",
            opacity: playerOpen ? 1 : 0,
            pointerEvents: playerOpen ? "auto" : "none",
            visibility: playerOpen ? "visible" : "hidden",
          }}
        >
          {/* video */}
          <div className="relative" style={{ paddingBottom: "56.25%" }}>
            <div className="absolute inset-0 w-full h-full">
              <YouTube
                videoId={PLAYLIST[0]?.ytId}
                opts={opts}
                onReady={onReady}
                onStateChange={onPlayerState}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>
          </div>
          {/* track list */}
          <div style={{ background: "var(--card)" }} className="max-h-[calc(100vh-2rem-400px)] px-3 py-2 overflow-auto">
            {PLAYLIST.map((t, i) => (
              <button
                key={`${t.ytId}-${i}`}
                onClick={() => {
                  setTrackIdx(i);
                  setPlaying(true);
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-black/5"
              >
                <span
                  className="text-[10px] w-4 text-center flex-shrink-0"
                  style={{ color: i === trackIdx ? TEAL : "var(--muted-foreground)", ...mono }}
                >
                  {i === trackIdx ? "▶" : i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: i === trackIdx ? TEAL : "var(--foreground)" }}
                  >
                    {t.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground" style={mono}>
                    {t.artist}
                  </p>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* pill bar */}
        <div className="flex items-center gap-0.5 rounded-full px-2 py-2" style={glassShell}>
          {/* panel toggle — dedicated open/close */}
          <button
            onClick={() => setPlayerOpen((v) => !v)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: playerOpen ? TEAL : "var(--muted-foreground)" }}
            aria-label={playerOpen ? "플레이어 닫기" : "플레이어 열기"}
          >
            <Music size={14} />
          </button>

          {/* divider */}
          <span
            className="w-px h-3 mx-0.5 flex-shrink-0"
            style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }}
          />

          {/* prev */}
          <button
            onClick={prevTrack}
            className="hidden sm:flex p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="이전 곡"
          >
            <SkipBack size={13} />
          </button>

          {/* play / pause */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label={playing ? "일시정지" : "재생"}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* next */}
          <button
            onClick={nextTrack}
            className="hidden sm:flex p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="다음 곡"
          >
            <SkipForward size={13} />
          </button>

          {/* mute */}
          <button
            onClick={toggleMute}
            className="hidden sm:flex p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label={muted ? "음소거 해제" : "음소거"}
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          {/* track title */}
          <div className="hidden sm:block text-[10px] text-muted-foreground max-w-[88px] truncate mx-1" style={mono}>
            <span className="block marquee-track truncate">
              {currentTrack.title}
              {isBuffering ? " (버퍼링중)" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
