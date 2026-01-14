import type { Metadata } from "next";
import AuctionGemChartClient from "@/layout/app/lostark/auctionGemChartClient";

const GEMSTONE_LIST = ["작열", "겁화", "멸화", "홍염"] as const;
type GemStone = (typeof GEMSTONE_LIST)[number];

const INDEX_LEVELS = new Set(["10"]); // ✅ 상단 노릴 레벨만
const INDEX_UPDATETIMES = new Set(["1d", "7d", "30d"]); // ✅ 너무 많으면 얇아짐

function toSafeLevel(input?: string) {
  const n = Number(input);
  if (!Number.isFinite(n)) return "10";
  const v = Math.min(Math.max(Math.trunc(n), 1), 10);
  return String(v);
}

function toSafeGemStone(input?: string): GemStone | "" {
  const s = (input ?? "").trim();
  if (!s) return "";
  return (GEMSTONE_LIST as readonly string[]).includes(s) ? (s as GemStone) : "";
}

function toSafeUpdatetime(input?: string) {
  const v = (input ?? "").trim();
  const allowed = new Set(["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m"]);
  return allowed.has(v) ? v : "1d";
}

type SearchParams = { gemStone?: string; level?: string; updatetime?: string };
type Props = { searchParams?: Promise<SearchParams> };

export const generateMetadata = async ({ searchParams }: Props): Promise<Metadata> => {
  const sp = (await searchParams) ?? {};

  // ✅ 대표값(검색용) 기준: 작열 10레벨 1d
  const gemStone = toSafeGemStone(sp.gemStone) || "작열";
  const level = toSafeLevel(sp.level ?? "10");
  const updatetime = toSafeUpdatetime(sp.updatetime);

  const baseUrl = "https://2er0.io/tools/game/onstove/lostark/auction-chart/gemstone";

  // ✅ canonical은 항상 대표 페이지(쿼리 없음)
  const canonical = baseUrl;

  // ✅ 색인 허용(화이트리스트)
  const isIndexable = GEMSTONE_LIST.includes(gemStone) && INDEX_LEVELS.has(level) && INDEX_UPDATETIMES.has(updatetime);

  const baseTitle = "로스트아크 보석 시세 차트 (경매장)";
  const title = `${baseTitle} - ${level}레벨 ${gemStone}`;
  const description = `로스트아크 경매장 기준 ${level}레벨 ${gemStone} 보석 시세를 차트로 확인하세요. ` + `기간(${updatetime})별 변동 추이와 OpenAPI를 제공합니다.`;

  return {
    title,
    description,

    alternates: { canonical },

    // ✅ 대부분 조합은 noindex로 사이트 품질 보호
    robots: isIndexable ? { index: true, follow: true } : { index: false, follow: true },

    openGraph: {
      type: "website",
      title,
      description,
      url: isIndexable ? baseUrl : canonical,
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

export default async function AuctionChartPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const initialGemStone = toSafeGemStone(sp.gemStone);
  const initialLevel = toSafeLevel(sp.level);
  const initialUpdatetime = toSafeUpdatetime(sp.updatetime);

  const gemStone = toSafeGemStone(sp.gemStone ?? "작열");
  const level = toSafeLevel(sp.level ?? "1");

  const GEMSTONE_LIST = ["작열", "겁화", "멸화", "홍염"];
  const UPDATETIME_LIST = ["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m"];

  return (
    <div className="pt-[calc(64px+2rem)] px-2 flex flex-col w-full max-h-full items-center justify-center text-[0.9rem] overflow-auto">
      <h1 className="p-4 mt-10 mb-4 w-full max-w-3xl bg-white/20 text-xl font-bold text-left underline rounded-lg">
        로아 {gemStone}의 보석 ({level}레벨) 시세 차트
      </h1>
      <AuctionGemChartClient GEMSTONE_LIST={GEMSTONE_LIST} initialGemStone={initialGemStone} initialLevel={initialLevel} initialUpdatetime={initialUpdatetime} UPDATETIME_LIST={UPDATETIME_LIST} />
    </div>
  );
}
