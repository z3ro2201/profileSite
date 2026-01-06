"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Volume2Icon, VolumeOffIcon, PlayIcon, SquareIcon, PanelBottomOpen, PanelTopOpen, SkipForwardIcon } from "lucide-react";
import { cn } from "@/lib/cn";

import YouTube, { YouTubeEvent, YouTubePlayer, YouTubeProps } from "react-youtube";
import { playList } from "@/lib/playList";

const Player = () => {
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

  // ✅ 초기 랜덤: effect/setState 없이 1번만 결정
  const initialIndexRef = useRef<number | null>(null);
  if (initialIndexRef.current === null && playList.length > 0) {
    initialIndexRef.current = Math.floor(Math.random() * playList.length);
  }

  const [index, setIndex] = useState<number>(initialIndexRef.current ?? 0);

  const [playId, setPlayId] = useState<string>(playList[index]?.link ?? "");
  const ytRef = useRef<YouTubePlayer | null>(null);

  const pickNextRandom = useCallback(() => {
    const len = playList.length;
    if (len === 0) return;

    if (len === 1) {
      setIndex(0);
      return;
    }

    setIndex((prev) => {
      let next = Math.floor(Math.random() * len);
      if (next === prev) next = (next + 1) % len; // 같은 곡 연속 방지
      return next;
    });
  }, []);

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

  // --- YouTube events ---
  const onReady: YouTubeProps["onReady"] = (e: YouTubeEvent) => {
    ytRef.current = e.target;

    // 초기 상태 반영
    if (isMuted) e.target.mute();
    else e.target.unMute();

    if (isPlaying) e.target.playVideo();
    else e.target.pauseVideo();

    // 제목 표시
    const title = e.target.getVideoData()?.title ?? "";
    setPlayerSongTitle(title);
  };
  const nextRandom = () => {
    const i = Math.floor(Math.random() * playList.length);
    setPlayId(playList[i]?.link ?? "");
  };

  const onPlayerState: YouTubeProps["onStateChange"] = (e: YouTubeEvent<number>) => {
    const title = e.target.getVideoData()?.title ?? "";

    if (e.data === 3) {
      setPlayerSongTitle(title ? `${title} (버퍼링중)` : "버퍼링중");
    } else if (e.data === 1) {
      setPlayerSongTitle(title);
    } else if (e.data === 0) {
      // 끝남(ENDED) → 다음곡
      nextRandom();
    }
  };

  // playId(곡) 바뀌면: 새 영상 재생 상태도 맞춰주기
  React.useEffect(() => {
    const yt = ytRef.current;
    if (!yt) return;

    if (isMuted) yt.mute();
    else yt.unMute();

    if (isPlaying) yt.playVideo();
    else yt.pauseVideo();

    const title = yt.getVideoData()?.title ?? "";
    if (title) setPlayerSongTitle(title);
  }, [playId, isMuted, isPlaying]);

  // --- controls ---
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      const yt = ytRef.current;
      if (yt) next ? yt.mute() : yt.unMute();
      return next;
    });
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      const yt = ytRef.current;
      if (yt) next ? yt.playVideo() : yt.pauseVideo();
      return next;
    });
  };

  // --- drag handlers (✅ 상단바만 드래그 시작) ---
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

  return (
    <div className="z-[1000] fixed select-none touch-none" style={{ left: x, top: y }} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      {/* ✅ 이 헤더 바만 드래그 */}
      <div className="flex items-center gap-2 px-3 py-2 border-2 border-slate-200 bg-slate-800 overflow-hidden shadow-md text-white rounded cursor-grab active:cursor-grabbing" onPointerDown={onPointerDown}>
        {isMuted ? <VolumeOffIcon className="w-4" /> : <Volume2Icon className="w-4" />}

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={toggleMute}>
          {/* 텍스트 대신 아이콘만 쓰고 싶으면 여기 바꾸면 됨 */}
          <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={togglePlay}>
          {isPlaying ? <SquareIcon className="w-4" /> : <PlayIcon className="w-4" />}
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={pickNextRandom}>
          <SkipForwardIcon className="w-4" />
        </button>

        <button type="button" className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={() => setViewPlayer((v) => !v)}>
          {viewPlayer ? <PanelBottomOpen className="w-4" /> : <PanelTopOpen className="w-4" />}
        </button>

        <div className="ml-2 text-xs opacity-90 line-clamp-1 max-w-[240px]">{playerSongTitle}</div>
      </div>

      <div className={cn(viewPlayer ? "block" : "hidden", "videoPlayer")}>
        <YouTube opts={opts} videoId={playId} onReady={onReady} onStateChange={onPlayerState} />
      </div>
    </div>
  );
};

export default Player;
