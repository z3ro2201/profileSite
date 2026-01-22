import OsmMapClient from "@/components/maps/OsmMapClient";
import { cn } from "@/lib/cn";
import Link from "next/link";

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
    <div>
      <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", compact ? "py-2" : "py-4")}>
        {/* 관리자 액션 - 우측 상단 고정 */}
        {isAdmin && (
          <div className="fixed top-24 right-8 z-490 flex gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <Link href={`/admin/mgmt/posts/${post?.id}/modify`} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition">
              수정
            </Link>
            <Link href={`/admin/mgmt/posts/${post?.id}/delete`} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded transition">
              삭제
            </Link>
          </div>
        )}

        {/* 포스트 헤더 */}
        <header className="mb-12">
          {/* 카테고리 */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700">{post.category.name}</span>
            </div>
          )}

          {/* 제목 */}
          <h1 className={cn("font-bold text-gray-900 leading-tight mb-4", compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl")}>{post.title}</h1>

          {/* 날짜 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <time dateTime={publishDate.toISOString()}>
              {datePart}&nbsp;{timePart}
            </time>
          </div>
        </header>

        {/* 메인 콘텐츠 + TOC */}
        {!post.mapOnly && (
          <div className={cn("relative", !compact && toc.length > 0 ? "lg:grid lg:grid-cols-[1fr_280px] lg:gap-8" : "")}>
            {/* 포스트 본문 */}
            <article
              className={cn(
                "prose prose-lg max-w-none",
                "prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24",
                "prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12",
                "prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4",
                "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
                "prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2",
                "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6",
                "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-gray-900 prose-strong:font-semibold",
                "prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
                "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:rounded-xl",
                "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:not-italic prose-blockquote:text-gray-700",
                "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6",
                "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6",
                "prose-li:text-gray-700 prose-li:mb-2",
                "prose-img:rounded-xl prose-img:my-8 prose-img:shadow-md",
                "prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:text-sm",
                "prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-700 prose-th:uppercase prose-th:text-xs prose-th:tracking-wider",
                "prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-3 prose-td:text-gray-700",
                "prose-tr:even:bg-gray-50",
                "prose-hr:border-gray-200 prose-hr:my-12"
              )}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12" dangerouslySetInnerHTML={{ __html: finalHtml }} />

              {/* 태그 목록 */}
              {post.tags && post.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-6">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag.slug} href={`/blog/posts?scope=tags&q=${tag.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors no-underline">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* TOC (Table of Contents) - 데스크탑 사이드바 */}
            {!compact && toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contents</h2>
                    <nav className="space-y-1">
                      {toc.map((item) => (
                        <a key={item.id} href={`#${item.id}`} className={cn("block py-2 text-sm transition-colors", "text-gray-600 hover:text-blue-600", "border-l-2 border-transparent hover:border-blue-600", item.level === 2 && "pl-3 font-medium", item.level === 3 && "pl-6", item.level > 3 && "pl-9")}>
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}

        {/* 모바일 TOC */}
        {!post.mapOnly && !compact && toc.length > 0 && (
          <div className="lg:hidden mt-8">
            <details className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 flex items-center justify-between hover:bg-gray-50 transition text-sm uppercase tracking-wider">
                <span>Contents</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <nav className="px-6 pb-4 space-y-1 border-t border-gray-100">
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={cn("block py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors", item.level === 2 && "pl-0 font-medium", item.level === 3 && "pl-4", item.level > 3 && "pl-8")}>
                    {item.text}
                  </a>
                ))}
              </nav>
            </details>
          </div>
        )}
      </div>

      {/* ✅ 지도: 헤더 바로 아래 */}
      {hasCoord && !compact && (
        <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", post.mapOnly ? "" : "py-2")}>
          <div className={cn(post.mapOnly ? "" : "mt-6")}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">위치 정보</h2>
            <div className="relative rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
              <OsmMapClient lat={lat} lng={lng} zoom={20} height={340} placeLabel={post.placeName} />
              <div className="pt-3 pb-4 px-5 flex flex-col flex-wrap text-xs text-gray-500">
                {post.placeName && <div className="text-xl font-bold text-black">{post.placeName}</div>}
                {post.address && (
                  <div className="flex flex-col lg:flex-row lg:justify-between">
                    <div className="text-md">{post.address}</div>
                    <div>
                      <span>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </span>
                      <span> · </span>
                      <a className="underline hover:text-gray-700" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lng))}#map=17/${encodeURIComponent(String(lat))}/${encodeURIComponent(String(lng))}`}>
                        Openstreet Map
                      </a>
                      <span> · </span>
                      <a className="underline hover:text-gray-700" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`}>
                        Google Maps
                      </a>
                      <span> · </span>
                      <a className="underline hover:text-gray-700" target="_blank" rel="noreferrer" href={`https://map.naver.com/p/search/${encodeURIComponent(post.address)}`}>
                        Naver Maps
                      </a>
                      <span> · </span>
                      <a className="underline hover:text-gray-700" target="_blank" rel="noreferrer" href={`https://map.kakao.com/?map_type=TYPE_MAP&q=${encodeURIComponent(`${lat},${lng}`)}&urlLevel=10`}>
                        Kakao Maps
                      </a>
                    </div>
                  </div>
                )}
                {!post.placeName && !post.address && (
                  <div>
                    <a className="underline hover:text-gray-700" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lng))}#map=17/${encodeURIComponent(String(lat))}/${encodeURIComponent(String(lng))}`}>
                      OSM에서 열기
                    </a>
                    <span>·</span>
                    <a className="underline hover:text-gray-700" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`}>
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
    </div>
  );
};

export default PostViewClient;
