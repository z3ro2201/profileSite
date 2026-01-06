"use client";

import dynamic from "next/dynamic";
const YouTube = dynamic(() => import("react-youtube"), { ssr: false });
const MarqueeTitle = dynamic(() => import("@/components/maquee"), { ssr: false });
type PlayerProps = {
  onBgImageChange?: (bgImage: string) => void;
  bgFolder?: "kartrider" | "lostark" | "onepiece" | "unchartedwartersonline"; // 필요하면 string으로
};

import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Volume2Icon, VolumeOffIcon, PlayIcon, SquareIcon, PanelBottomOpen, PanelTopOpen, SkipForwardIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { YouTubeEvent, YouTubePlayer, YouTubeProps } from "react-youtube";
import { playList } from "@/lib/playList";

/** link(URL/ID) -> 11자리 videoId로 정규화 (아니면 "") */
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

const Player = ({ onBgImageChange, bgFolder = "lostark" }: PlayerProps) => {
  // --- draggable ---
  const [x, setX] = useState<number>(10);
  const [y, setY] = useState<number>(10);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ dx: 0, dy: 0 });

  // --- player state ---
  const [viewPlayer, setViewPlayer] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playerSongTitle, setPlayerSongTitle] = useState<string>("");

  const ytRef = useRef<YouTubePlayer | null>(null);

  /** ✅ 유효한 영상만 */
  const valid = useMemo(() => {
    const items = playList.map((p, i) => ({ i, id: toVideoId(p?.link ?? "") })).filter((x) => x.id);
    const validIndexes = items.map((x) => x.i);
    const idByIndex = new Map<number, string>(items.map((x) => [x.i, x.id]));
    return { validIndexes, idByIndex };
  }, []);

  const hasValid = valid.validIndexes.length > 0;

  /** ✅ 초기 index (유효곡 중 랜덤 1회) */
  const initialIndexRef = useRef<number>(-1);
  if (initialIndexRef.current === -1) {
    if (hasValid) {
      initialIndexRef.current = valid.validIndexes[Math.floor(Math.random() * valid.validIndexes.length)];
    } else {
      initialIndexRef.current = 0;
    }
  }
  const [index, setIndex] = useState<number>(initialIndexRef.current);

  useEffect(() => {
    // 곡 변경마다 배경 바꾸고 싶으면 index를 dependency로 두면 됨
    if (!bgFolder) return;

    (async () => {
      try {
        const res = await fetch(`/api/bg?folder=${bgFolder}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.ok && typeof data.url === "string") {
          onBgImageChange?.(data.url); // ✅ 여기서 Player 밖으로 리턴
        }
      } catch {
        // 실패 시 조용히 무시
      }
    })();
  }, [index, bgFolder, onBgImageChange]);

  /** ✅ bgImage 계산 (URL만) */
  const bgImage = useMemo(() => {
    return playList?.[index]?.bgImage ?? "";
  }, [index]);

  /** ✅ index(곡) 바뀔 때 부모로 전달 */
  useEffect(() => {
    onBgImageChange?.(bgImage);
  }, [bgImage, onBgImageChange]);

  /** ✅ 현재 videoId */
  const videoId = useMemo(() => {
    return valid.idByIndex.get(index) ?? "";
  }, [index, valid.idByIndex]);

  /** ✅ 다음곡(유효곡만) */
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

  /** ✅ YouTube 옵션 */
  const opts: YouTubeProps["opts"] = useMemo(
    () => ({
      width: 640,
      height: 390,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
      },
    }),
    []
  );

  /** ✅ onReady: ref 저장 + 상태 반영 */
  const onReady: YouTubeProps["onReady"] = (e: YouTubeEvent) => {
    ytRef.current = e.target;

    if (isMuted) e.target.mute();
    else e.target.unMute();

    if (isPlaying) e.target.playVideo();
    else e.target.pauseVideo();

    const title = e.target.getVideoData()?.title ?? "";
    setPlayerSongTitle(title);
  };

  /** ✅ 상태 변화 (ended면 다음곡) */
  const onPlayerState: YouTubeProps["onStateChange"] = (e: YouTubeEvent<number>) => {
    const title = e.target.getVideoData()?.title ?? "";

    if (e.data === 3) setPlayerSongTitle(title ? `${title} (버퍼링중)` : "대기중");
    else if (e.data === 1) setPlayerSongTitle(title);
    else if (e.data === 0) pickNextRandom();
  };

  /**
   * ✅ 핵심: index/videoId 변경 시 "컴포넌트 재생성"이 아니라
   * YouTube IFrame API로 갈아끼움(loadVideoById)
   * -> react-youtube 내부의 null(src) 케이스를 크게 줄임
   */
  useEffect(() => {
    const yt = ytRef.current as any;
    if (!yt) return;
    if (!videoId) return; // src 없으면 아무것도 안함(요구사항)

    // loadVideoById가 없을 수도 있으니 방어
    if (typeof yt.loadVideoById === "function") {
      yt.loadVideoById(videoId);
    } else if (typeof yt.cueVideoById === "function") {
      yt.cueVideoById(videoId);
    }

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

  // --- drag handlers ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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

  /**
   * ✅ 중요:
   * - YouTube 컴포넌트는 "항상 렌더"
   * - viewPlayer는 "숨김 처리만" (언마운트 금지)
   */
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

  // ✅ 최초 마운트용 videoId (유효곡이 없으면 빈값이라 렌더만 됨)
  const initialVideoId = useMemo(() => {
    if (!hasValid) return "";
    const firstIndex = valid.validIndexes[0];
    return valid.idByIndex.get(firstIndex) ?? "";
  }, [hasValid, valid.validIndexes, valid.idByIndex]);

  return (
    <div className="z-[1000] fixed select-none touch-none" style={{ left: x, top: y }} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      {/* drag header */}
      <div className="flex items-center gap-2 px-3 py-2 border-2 border-slate-200 bg-slate-800 overflow-hidden shadow-md text-white rounded cursor-grab active:cursor-grabbing" onPointerDown={onPointerDown}>
        {isMuted ? <VolumeOffIcon className="w-4" /> : <Volume2Icon className="w-4" />}

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={toggleMute}>
          <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={togglePlay} disabled={!hasValid}>
          {isPlaying ? <SquareIcon className="w-4" /> : <PlayIcon className="w-4" />}
        </button>

        <button type="button" className={cn("cursor-pointer", !hasValid && "opacity-50 cursor-not-allowed")} onPointerDown={(e) => e.stopPropagation()} onClick={pickNextRandom} disabled={!hasValid}>
          <SkipForwardIcon className="w-4" />
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={() => setViewPlayer((v) => !v)}>
          {viewPlayer ? <PanelBottomOpen className="w-4" /> : <PanelTopOpen className="w-4" />}
        </button>

        <MarqueeTitle className={cn("ml-2 text-xs opacity-90 line-clamp-1", viewPlayer ? "max-w-[500px]" : "w-[240px]")} text={hasValid ? playerSongTitle : "재생 가능한 곡이 없습니다 (videoId 누락)"} />
      </div>

      {/* ✅ YouTube는 항상 렌더(언마운트 금지) */}
      <div className="videoPlayer" style={playerContainerStyle}>
        <YouTube
          opts={opts}
          // ⚠️ 여기에는 "초기 마운트용"만 넣고,
          // 이후 곡 변경은 loadVideoById로 처리
          videoId={initialVideoId}
          onReady={onReady}
          onStateChange={onPlayerState}
        />
      </div>
    </div>
  );
};

export default Player;
