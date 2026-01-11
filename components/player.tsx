"use client";

import dynamic from "next/dynamic";
const YouTube = dynamic(() => import("react-youtube"), { ssr: false });
const MarqueeTitle = dynamic(() => import("@/components/maquee"), { ssr: false });

import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Volume2Icon, VolumeOffIcon, PlayIcon, SquareIcon, PanelBottomOpen, PanelTopOpen, SkipForwardIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { YouTubeEvent, YouTubePlayer, YouTubeProps } from "react-youtube";

import { playList } from "@/lib/i18n/playList";
import { withSubjectI18n } from "@/lib/i18n/utils";
import type { Lang } from "@/lib/i18n/types";
import type { BgSubjectKey } from "@/lib/i18n/subjects";

type PlayerProps = {
  onBgImageChange?: (bgImageUrl: string) => void;
};

function getLangFromNavigator(): Lang {
  const raw = (typeof navigator !== "undefined" ? navigator.language : "ko").toLowerCase();
  if (raw.startsWith("ja")) return "ja";
  if (raw.startsWith("en")) return "en";
  return "ko";
}

const toVideoId = (input: string) => {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const u = new URL(input);

    const v = u.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m?.[1]) return m[1];

    return "";
  } catch {
    return "";
  }
};

const Player = ({ onBgImageChange }: PlayerProps) => {
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ dx: 0, dy: 0 });

  const [viewPlayer, setViewPlayer] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [lang, setLang] = useState<Lang>("ko");
  const [isBuffering, setIsBuffering] = useState(false);

  // ✅ 전체 UI 숨김 토글
  const [isHidden, setIsHidden] = useState(false);

  const ytRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    setLang(getLangFromNavigator());
  }, []);

  const valid = useMemo(() => {
    const items = playList.map((p, i) => ({ i, id: toVideoId(p?.link ?? "") })).filter((x) => x.id);
    const validIndexes = items.map((x) => x.i);
    const idByIndex = new Map<number, string>(items.map((x) => [x.i, x.id]));
    return { validIndexes, idByIndex };
  }, []);

  const hasValid = valid.validIndexes.length > 0;

  const initialIndexRef = useRef<number>(-1);
  if (initialIndexRef.current === -1) {
    if (hasValid) initialIndexRef.current = valid.validIndexes[Math.floor(Math.random() * valid.validIndexes.length)];
    else initialIndexRef.current = 0;
  }
  const [index, setIndex] = useState<number>(initialIndexRef.current);

  const current = useMemo(() => playList[index], [index]);
  const videoId = useMemo(() => valid.idByIndex.get(index) ?? "", [index, valid.idByIndex]);

  const displayTitle = useMemo(() => {
    if (!current) return "";
    const suffix = isBuffering ? (lang === "ja" ? "（バッファ中）" : lang === "en" ? " (Buffering)" : " (버퍼링중)") : "";
    return withSubjectI18n(current.title, current.bgImage as BgSubjectKey, lang) + suffix;
  }, [current, lang, isBuffering]);

  useEffect(() => {
    if (!current?.bgImage) return;

    (async () => {
      try {
        const folder = current.bgImage;
        const res = await fetch(`/api/bg?folder=${folder}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.ok && typeof data.url === "string") {
          onBgImageChange?.(data.url);
        }
      } catch {}
    })();
  }, [current?.bgImage, onBgImageChange]);

  const pickNextRandom = useCallback(() => {
    const list = valid.validIndexes;
    const len = list.length;
    if (len === 0) return;

    if (len === 1) {
      setIndex(list[0]);
      return;
    }

    setIndex((prev) => {
      const prevPos = list.indexOf(prev);
      let nextPos = Math.floor(Math.random() * len);
      if (nextPos === prevPos) nextPos = (nextPos + 1) % len;
      return list[nextPos];
    });
  }, [valid.validIndexes]);

  const opts: YouTubeProps["opts"] = useMemo(
    () => ({
      width: 640,
      height: 390,
      playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
    }),
    []
  );

  const onReady: YouTubeProps["onReady"] = (e: YouTubeEvent) => {
    ytRef.current = e.target;

    if (isMuted) e.target.mute();
    else e.target.unMute();

    if (isPlaying) e.target.playVideo();
    else e.target.pauseVideo();
  };

  const onPlayerState: YouTubeProps["onStateChange"] = (e: YouTubeEvent<number>) => {
    if (e.data === 3) setIsBuffering(true);
    else if (e.data === 1) setIsBuffering(false);
    else if (e.data === 0) {
      setIsBuffering(false);
      pickNextRandom();
    }
  };

  useEffect(() => {
    const yt = ytRef.current as any;
    if (!yt) return;
    if (!videoId) return;

    if (typeof yt.loadVideoById === "function") yt.loadVideoById(videoId);
    else if (typeof yt.cueVideoById === "function") yt.cueVideoById(videoId);

    if (isMuted) yt.mute?.();
    else yt.unMute?.();

    if (isPlaying) yt.playVideo?.();
    else yt.pauseVideo?.();
  }, [videoId, isMuted, isPlaying]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      const yt = ytRef.current as any;
      if (yt) next ? yt.mute?.() : yt.unMute?.();
      return next;
    });
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      const yt = ytRef.current as any;
      if (yt) next ? yt.playVideo?.() : yt.pauseVideo?.();
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isHidden) return; // ✅ 숨김 상태에서는 드래그 금지(아이콘만)
    draggingRef.current = true;
    offsetRef.current = { dx: e.clientX - x, dy: e.clientY - y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setX(e.clientX - offsetRef.current.dx);
    setY(e.clientY - offsetRef.current.dy);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const playerContainerStyle: React.CSSProperties = viewPlayer
    ? { position: "relative" }
    : {
        position: "absolute",
        left: -99999,
        top: -99999,
        width: 1,
        height: 1,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0,
      };

  const initialVideoId = useMemo(() => {
    if (!hasValid) return "";
    const firstIndex = valid.validIndexes[0];
    return valid.idByIndex.get(index ?? firstIndex) ?? "";
  }, [hasValid, valid.validIndexes, valid.idByIndex, index]);

  // ✅ 숨김 상태 UI(아이콘만)
  if (isHidden) {
    return (
      <div className="z-[1000] fixed select-none" style={{ right: 12, bottom: 12 }}>
        <button type="button" onClick={() => setIsHidden(false)} className="h-11 w-11 rounded-full bg-slate-800 text-white border-2 border-slate-200 shadow-md flex items-center justify-center active:scale-[0.98]" aria-label="플레이어 표시">
          <EyeIcon className="w-5 h-5" />
        </button>

        {/* YouTube always mounted (숨김 상태에서도 유지) */}
        <div className="videoPlayer" style={playerContainerStyle} role="application">
          <YouTube opts={opts} videoId={initialVideoId} onReady={onReady} onStateChange={onPlayerState} />
        </div>
      </div>
    );
  }

  return (
    <div className="z-[1000] fixed select-none touch-none" style={{ right: -x, bottom: -y }} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div className="flex items-center gap-2 px-3 py-2 border-2 border-slate-200 bg-slate-800 overflow-hidden shadow-md text-white rounded cursor-grab active:cursor-grabbing" onPointerDown={onPointerDown} role="dialog">
        {isMuted ? <VolumeOffIcon className="w-4" /> : <Volume2Icon className="w-4" />}

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={toggleMute} aria-label="음소거" role="button">
          <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={togglePlay} disabled={!hasValid} aria-label="재생/정지" role="button">
          {isPlaying ? <SquareIcon className="w-4" /> : <PlayIcon className="w-4" />}
        </button>

        <button type="button" className={cn("cursor-pointer", !hasValid && "opacity-50 cursor-not-allowed")} onPointerDown={(e) => e.stopPropagation()} onClick={pickNextRandom} disabled={!hasValid} aria-label="다음곡" role="button">
          <SkipForwardIcon className="w-4" />
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={() => setViewPlayer((v) => !v)} aria-label="동영상 보기" role="button">
          {viewPlayer ? <PanelBottomOpen className="w-4" /> : <PanelTopOpen className="w-4" />}
        </button>

        {/* ✅ 숨김 버튼 추가 */}
        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsHidden(true)} aria-label="플레이어 숨김" role="button">
          <EyeOffIcon className="w-4" />
        </button>

        <MarqueeTitle
          className={cn("ml-2 text-xs opacity-90 line-clamp-1", viewPlayer ? "max-w-[500px]" : "w-[240px]")}
          text={hasValid ? displayTitle : lang === "ja" ? "再生可能な曲がありません（videoIdなし）" : lang === "en" ? "No playable tracks (missing videoId)" : "재생 가능한 곡이 없습니다 (videoId 누락)"}
        />
      </div>

      <div className="videoPlayer" style={playerContainerStyle} role="application">
        <YouTube opts={opts} videoId={initialVideoId} onReady={onReady} onStateChange={onPlayerState} />
      </div>
    </div>
  );
};

export default Player;
