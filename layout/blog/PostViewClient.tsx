"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import OsmMapClient from "@/components/maps/OsmMapClient";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { TEAL, mono } from "@/lib/nav-shared";
import { serif, sans } from "@/app/s4/_lib/theme";
import { SharedButton } from "@/lib/shared";

type TocItem = { id: string; text: string; level: number };

type Props = {
  post: {
    id: number;
    title: string;
    createdAt: string | Date;
    publishedAt: string | Date | null;
    category?: { name: string } | null;
    tags?: Array<{ slug: string; name: string }>; // ✅ 추가
    lat?: number | null;
    lng?: number | null;
    mapOnly?: boolean;
    placeName?: string | null;
    address?: string | null;
    aiSummary?: string | null;
  };
  finalHtml: string;
  toc: TocItem[];
  compact?: boolean;
  isAdmin?: boolean;
};

const PostViewClient = ({ post, finalHtml, toc, compact, isAdmin }: Props) => {
  const publishDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
  const hasCoord = Number.isFinite(post.lat) && Number.isFinite(post.lng);
  const lat = (post.lat ?? 0) as number;
  const lng = (post.lng ?? 0) as number;

  // 본문 이미지 클릭 시 확대 보기. dangerouslySetInnerHTML 내부라 이벤트 위임으로 처리.
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") setLightboxSrc((target as HTMLImageElement).src);
  };

  const [summaryOpen, setSummaryOpen] = useState(true);

  // 읽는 시간 추정 (한국어 분당 ~500자 기준, 최소 1분)
  const readingMinutes = Math.max(1, Math.round(finalHtml.replace(/<[^>]*>/g, "").length / 500));

  const datePart = publishDate
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "/")
    .replace(".", "");

  const timePart = publishDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return (
    <>
      <div className="relative max-w-2xl mx-auto">
        {/* 관리자 액션 - 우측 상단 고정 */}
        {isAdmin && (
          <div className="fixed top-24 right-8 z-490 flex gap-2 bg-[var(--card)] rounded-lg shadow-lg border border-border p-2">
            <Link
              href={`/admin/mgmt/posts/${post?.id}/modify`}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded transition"
            >
              수정
            </Link>
            <Link
              href={`/admin/mgmt/posts/${post?.id}/delete`}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded transition"
            >
              삭제
            </Link>
          </div>
        )}

        {/* back button */}
        <Link
          href="/blog"
          className="flex items-center gap-1.5 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
          style={mono}
        >
          ← 목록으로
        </Link>

        {/* category badges */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {post.category && (
            <Link
              href={`/blog?category=${post.category.name}`}
              className="text-xs px-3 py-1 rounded-full border"
              style={{ ...mono, borderColor: `${TEAL}13`, color: "#fff", background: TEAL }}
            >
              {post.category.name}
            </Link>
          )}

          {post.tags &&
            post.tags.length > 0 &&
            post.tags.map((tag, key) => (
              <Link
                href={`/blog?tag=${tag.name}`}
                className="flex gap-2 items-center text-xs px-3 py-1 rounded-full border"
                style={{ ...mono, borderColor: `${TEAL}30`, color: TEAL, background: `${TEAL}14` }}
                key={`${tag}-${key}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {tag.name}
              </Link>
            ))}
        </div>

        {/* title */}
        <h1 className="text-3xl sm:text-4xl font-light leading-snug mb-4" style={serif}>
          {post.title}
        </h1>

        {/* meta: date + reading time */}
        <p className="text-xs text-muted-foreground mb-6" style={mono}>
          <time dateTime={publishDate.toISOString()}>
            {datePart}&nbsp;{timePart}
          </time>
          &nbsp;· 읽는 시간 약 {readingMinutes}분
        </p>

        {/* AI 요약 — 발행/수정 시점에 미리 생성해둔 것, 매 조회마다 재생성 안 함 */}
        {post.aiSummary && (
          <div className="rounded-xl mb-8 overflow-hidden" style={{ background: "var(--secondary)" }}>
            <button
              onClick={() => setSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
            >
              <span style={mono}>✦ AI 요약</span>
              <ChevronDown
                size={16}
                className="text-muted-foreground transition-transform"
                style={{ transform: summaryOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {summaryOpen && (
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed font-light border-t border-border pt-3">
                {post.aiSummary}
              </div>
            )}
          </div>
        )}

        {/* article body */}
        {!post.mapOnly && (
          <div
            className="space-y-5 text-[1.05rem] text-foreground/80 leading-relaxed font-light mb-8 [&_img]:cursor-zoom-in [&_figure]:m-0 [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_figcaption]:text-center [&_figcaption]:mt-2"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />
        )}
      </div>

      {/* 이미지 확대 라이트박스 */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 원본 그대로 확대 표시, next/image 최적화 불필요 */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white text-xl hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      )}

      {/* ✅ 지도: 헤더 바로 아래 */}
      {hasCoord && !compact && (
        <div className={"mx-auto w-full max-w-2xl"}>
          <div className={cn(post.mapOnly ? "" : "mt-6")}>
            <h2 className="text-2xl font-bold text-foreground mb-4">위치 정보</h2>
            <div className="relative rounded-lg border border-border shadow-sm overflow-hidden bg-[var(--card)]">
              <OsmMapClient lat={lat} lng={lng} zoom={20} height={340} placeLabel={post.placeName} />
              <div className="pt-3 pb-4 px-5 flex flex-col flex-wrap text-xs text-muted-foreground">
                {post.placeName && <div className="text-xl font-bold text-foreground">{post.placeName}</div>}
                {post.address && (
                  <div className="flex flex-col">
                    <div className="text-md">{post.address}</div>
                    <div className="mt-2 lg:mt-0">
                      <span>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </span>
                      <span> · </span>
                      <a
                        className="underline hover:text-foreground"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lng))}#map=17/${encodeURIComponent(String(lat))}/${encodeURIComponent(String(lng))}`}
                      >
                        Openstreet Map
                      </a>
                      <span> · </span>
                      <a
                        className="underline hover:text-foreground"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`}
                      >
                        Google Maps
                      </a>
                      <span> · </span>
                      <a
                        className="underline hover:text-foreground"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://map.naver.com/p/search/${encodeURIComponent(post.address)}`}
                      >
                        Naver Maps
                      </a>
                      <span> · </span>
                      <a
                        className="underline hover:text-foreground"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://map.kakao.com/?map_type=TYPE_MAP&q=${encodeURIComponent(`${lat},${lng}`)}&urlLevel=10`}
                      >
                        Kakao Maps
                      </a>
                    </div>
                  </div>
                )}
                {!post.placeName && !post.address && (
                  <div>
                    <a
                      className="underline hover:text-foreground"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lng))}#map=17/${encodeURIComponent(String(lat))}/${encodeURIComponent(String(lng))}`}
                    >
                      OSM에서 열기
                    </a>
                    <span>·</span>
                    <a
                      className="underline hover:text-foreground"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`}
                    >
                      Google Maps에서 열기
                    </a>
                    <span>·</span>
                    <span>
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <SharedButton title={post.title} text={"내용을 공유합니다."} />
      </div>
    </>
  );
};

export default PostViewClient;
