import type { Metadata } from "next";
import AuctionGemChartClient from "@/layout/app/lostark/auctionGemChartClient";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";

import type { GemStone, GemChartResponse } from "@/types/Lostark";
import { GEMSTONE_LIST, UPDATETIME_LIST } from "@/lib/lostark";

const INDEX_LEVELS = new Set(["10"]);
const INDEX_UPDATETIMES = new Set(["1d", "7d", "30d"]);
const VALID_LEVELS = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);

const toSafeLevel = (input?: string): string => {
  const n = Number(input);
  if (!Number.isFinite(n)) return "10";
  const v = Math.min(Math.max(Math.trunc(n), 1), 10);
  return String(v);
};

const isValidLevel = (input?: string): boolean => {
  return VALID_LEVELS.has(String(input));
};

const toSafeGemStone = (input?: string): GemStone => {
  const s = (input ?? "").trim();
  return (GEMSTONE_LIST as readonly string[]).includes(s) ? (s as GemStone) : "작열";
};

const isValidGemStone = (input?: string): boolean => {
  const s = (input ?? "").trim();
  return (GEMSTONE_LIST as readonly string[]).includes(s);
};

const toSafeUpdatetime = (input?: string): string => {
  const v = (input ?? "").trim();
  const allowed = new Set(["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m", "1m"]);
  return allowed.has(v) ? v : "1d";
};

type PageProps = {
  params: Promise<{ itemName: string; level: string }>;
  searchParams?: Promise<{ updatetime?: string }>;
};

export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const ps = await params;
  const sp = (await searchParams) ?? {};

  const gemStone = toSafeGemStone(ps.itemName);
  const level = toSafeLevel(ps.level);
  const updatetime = toSafeUpdatetime(sp.updatetime);

  const baseUrl = `https://2er0.io/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(gemStone)}/${encodeURIComponent(level)}`;
  const canonical = baseUrl;

  const title = `로스트아크 보석 시세 차트 (경매장) - ${level}레벨 ${gemStone}`;
  const description = `로스트아크 경매장 기준 ${level}레벨 ${gemStone} 보석 시세를 차트로 확인하세요. ` + `기간(${updatetime})별 변동 추이와 OpenAPI를 제공합니다.`;

  const shouldIndex = INDEX_LEVELS.has(level) && INDEX_UPDATETIMES.has(updatetime);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: shouldIndex, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: baseUrl,
      siteName: "2ER0",
      images: [
        { url: "/app/LostArkGemChart.webp", width: 1200, height: 630, alt: `${level}레벨 ${gemStone} 보석 시세 차트` },
        { url: "/app/LostArkGemChart.png", width: 1200, height: 630, alt: `${level}레벨 ${gemStone} 보석 시세 차트` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/app/LostArkGemChart.webp", "/app/LostArkGemChart.png"],
    },
  };
};

const GemStoneChartPage = async ({ params, searchParams }: PageProps) => {
  const ps = await params;
  const sp = (await searchParams) ?? {};

  const rawItemName = decodeURI(ps.itemName);
  const rawLevel = ps.level;

  const gemStone = toSafeGemStone(rawItemName);
  const level = toSafeLevel(rawLevel);
  const initialUpdatetime = toSafeUpdatetime(sp.updatetime);

  // 유효하지 않은 입력 체크
  const isInvalidGemStone = !isValidGemStone(rawItemName);
  const isInvalidLevel = !isValidLevel(rawLevel);

  const apiItemName = `${level}레벨 ${gemStone}의 보석`;
  const url = `/api/app/game/onstove/lostark/auction-chart/gemStone/${encodeURIComponent(apiItemName)}` + `?updatetime=${encodeURIComponent(initialUpdatetime)}`;

  const res = await apiFetch<GemChartResponse>(url, { cache: "no-store" });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `로스트아크 ${level}레벨 ${gemStone} 보석 시세`,
    applicationCategory: "GameApplication",
    description: `로스트아크 경매장 ${level}레벨 ${gemStone} 보석 시세 차트`,
    operatingSystem: "Any",
    offers: res?.data?.[0]?.item_amount
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "KRW",
          lowPrice: Math.min(...res.data.map((d) => d.item_amount || 0)),
          highPrice: Math.max(...res.data.map((d) => d.item_amount || 0)),
        }
      : undefined,
    dateModified: new Date().toISOString(),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="pt-[calc(64px+2rem)] px-2 flex flex-col w-full max-h-full items-center justify-center text-[0.9rem] overflow-auto">
        {/* 유효하지 않은 입력 경고 메시지 */}
        {(isInvalidGemStone || isInvalidLevel) && (
          <div className="mb-4 w-full lg:max-w-3xl">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">입력 오류</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {isInvalidGemStone && (
                      <p className="mb-1">
                        ⚠️ '{rawItemName}'은(는) 유효하지 않은 보석 이름입니다. 유효한 보석: {GEMSTONE_LIST.join(", ")}
                        <br />
                        <strong className="ml-1">{gemStone}</strong>(으)로 표시합니다.
                      </p>
                    )}
                    {isInvalidLevel && (
                      <p>
                        ⚠️ '{rawLevel}'은(는) 유효하지 않은 레벨입니다. 레벨은 1~10 사이여야 합니다.
                        <br />
                        <strong className="ml-1">{level}레벨</strong>로 표시합니다.
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
                    <Link href={`/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(gemStone)}/${level}`} className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline">
                      올바른 URL로 이동하기 →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-2 w-full lg:max-w-3xl">
          <h1 className="text-2xl font-extrabold text-center">로아 {apiItemName} 시세 차트</h1>

          <div className="mt-2 mb-2 p-4 w-full bg-white rounded-lg">
            <h2 className="mb-2 text-lg font-bold">무엇을 보여주나요?</h2>
            <p className="leading-6">
              로스트아크 경매장 데이터를 기반으로 <strong>{gemStone}</strong>의 보석 <strong>{level}레벨</strong> 시세를 기간(<strong>{initialUpdatetime}</strong>)별로 집계해 추이를 시각화합니다.
            </p>

            <h2 className="mt-4 text-lg font-bold">추천 사용법</h2>
            <ul className="list-disc pl-5 leading-6">
              <li>
                <strong>1d (1일)</strong>: 단기 급등락 체크, 당일 거래 타이밍 확인
              </li>
              <li>
                <strong>7d (7일)</strong>: 주간 추세 파악, 중기 투자 판단
              </li>
              <li>
                <strong>30d (30일)</strong>: 장기 추세 확인, 시세 평균값 파악
              </li>
              <li>
                <strong>10레벨</strong>: 거래량이 가장 많아 정확한 시세 비교 가능
              </li>
            </ul>
          </div>
        </div>

        <AuctionGemChartClient GEMSTONE_LIST={GEMSTONE_LIST} initialGemStone={gemStone} initialLevel={level} initialUpdatetime={initialUpdatetime} initialData={res} UPDATETIME_LIST={UPDATETIME_LIST as unknown as readonly string[]} />

        <div className="mb-4 pb-4 w-full lg:max-w-3xl">
          <h2 className="mt-4 text-lg font-bold">다른 보석 시세 보기</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {GEMSTONE_LIST.filter((g) => g !== gemStone)
              .slice(0, 6)
              .map((g) => (
                <Link key={g} href={`/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(g)}/${level}`} className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200 text-center">
                  <span className="font-medium">{g}</span>
                  <span className="text-sm text-gray-600 ml-1">{level}레벨</span>
                </Link>
              ))}
          </div>

          <h2 className="mt-4 text-lg font-bold">다른 레벨 보기</h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[10, 9, 8, 7, 6, 5]
              .filter((l) => String(l) !== level)
              .map((l) => (
                <Link key={l} href={`/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(gemStone)}/${l}`} className="block px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200 font-medium">
                  {l}레벨
                </Link>
              ))}
          </div>

          <h2 className="mt-4 text-lg font-bold">관련 도구</h2>
          <p>
            <a className="underline text-blue-600 hover:text-blue-800" href="/tools/game/onstove/lostark/sasaFind">
              로스트아크 사사게 검색기
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default GemStoneChartPage;
