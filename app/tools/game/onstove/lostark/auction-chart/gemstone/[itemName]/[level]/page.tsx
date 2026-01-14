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

  // 다양한 검색 키워드 조합
  const keywords = [
    // 핵심 키워드
    "보석시세",
    "로아보석",
    "보석차트",
    "시세차트",
    // 보석명 조합
    `${gemStone}`,
    `${gemStone}보석`,
    `${gemStone}시세`,
    `${gemStone}차트`,
    `${gemStone}가격`,
    // 로아 조합
    "로아",
    "로스트아크",
    "로아시세",
    "로아차트",
    // 레벨 조합
    `${gemStone}${level}`,
    `${gemStone}${level}렙`,
    `${gemStone}${level}레벨`,
    `${level}렙${gemStone}`,
    `${level}레벨${gemStone}`,
    // 경매장
    "경매장",
    "경매장시세",
    "로아경매장",
    // 전체 조합
    `로아${gemStone}`,
    `로아${gemStone}시세`,
    `로스트아크${gemStone}`,
    `로아보석시세`,
    `로아보석차트`,
    `로아시세차트`,
  ].join(", ");

  const title = `로아 ${gemStone} ${level}렙 보석시세 - 실시간 차트 | 로스트아크`;
  const description = `로아 ${gemStone} ${level}렙 보석시세 실시간 확인! ` + `1분/5분/15분/30분/1일/7일 데이터 제공. ` + `경매장 기준 ${gemStone}보석 가격 변동차트, OpenAPI 제공. ` + `작열/겁화/멸화/홍염 1~10레벨 시세비교.`;

  const shouldIndex = INDEX_LEVELS.has(level) && INDEX_UPDATETIMES.has(updatetime);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: shouldIndex, follow: true },
    openGraph: {
      type: "website",
      title: `로아 ${gemStone} ${level}렙 보석시세`,
      description: `${gemStone}보석 실시간 시세차트 - 경매장 기준`,
      url: baseUrl,
      siteName: "2ER0",
      images: [
        { url: "/app/LostArkGemChart.webp", width: 1200, height: 630, alt: `로아 ${gemStone} ${level}렙 시세` },
        { url: "/app/LostArkGemChart.png", width: 1200, height: 630, alt: `${gemStone}보석 차트` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `로아 ${gemStone} ${level}렙 시세`,
      description: `${gemStone}보석 실시간 차트`,
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
    name: `로아 ${gemStone} ${level}렙 보석시세`,
    alternateName: [`${gemStone}보석`, `${gemStone}시세`, `${gemStone}차트`, `로아${gemStone}`],
    applicationCategory: "GameApplication",
    description: `로스트아크 ${gemStone}보석 ${level}레벨 실시간 시세차트`,
    operatingSystem: "Any",
    featureList: ["실시간 시세 (1분/5분/15분/30분)", "장기 추세 (1일/7일/30일)", "변동 목록", "OpenAPI 제공"],
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
          <h1 className="text-2xl font-extrabold text-center">
            로아 {gemStone} {level}렙 보석시세 차트
          </h1>

          <div className="mt-2 mb-2 p-4 w-full bg-white rounded-lg">
            <h2 className="mb-2 text-lg font-bold">무엇을 제공하나요?</h2>
            <p className="leading-6">
              <strong>
                {gemStone}보석 {level}렙
              </strong>{" "}
              경매장 시세를 실시간으로 확인할 수 있습니다.
            </p>
            <ul className="list-disc pl-5 leading-6 mt-2">
              <li>
                <strong>실시간 데이터</strong>: 1분/5분/15분/30분 단위
              </li>
              <li>
                <strong>장기 추세</strong>: 1일/7일/30일 단위
              </li>
              <li>
                <strong>변동 목록</strong>: 가격 변화 이력
              </li>
              <li>
                <strong>OpenAPI</strong>: 데이터 연동 가능
              </li>
            </ul>

            <h2 className="mt-4 text-lg font-bold">기간별 추천</h2>
            <ul className="list-disc pl-5 leading-6">
              <li>
                <strong>1분~30분</strong>: 초단기 급등락 포착, 즉시 거래 타이밍
              </li>
              <li>
                <strong>1일</strong>: 당일 시세 흐름 파악, 단기 매매
              </li>
              <li>
                <strong>7일~30일</strong>: 평균 시세 확인, 장기 투자 판단
              </li>
            </ul>

            <h2 className="mt-4 text-lg font-bold">지원 보석</h2>
            <p className="leading-6 text-gray-700">
              <strong>작열</strong>, <strong>겁화</strong>, <strong>멸화</strong>, <strong>홍염</strong> 보석의 1~10레벨 시세를 모두 제공합니다.
            </p>
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
