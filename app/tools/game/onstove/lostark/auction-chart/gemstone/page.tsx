import type { Metadata } from "next";
import AuctionGemChartClient from "@/layout/app/lostark/auctionGemChartClient";

type SearchParams = {
  gemStone?: string;
  level?: string;
  updatetime?: string; // 추가
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

function toSafeLevel(input?: string) {
  const n = Number(input);
  if (!Number.isFinite(n)) return "1";
  const v = Math.min(Math.max(Math.trunc(n), 1), 10);
  return String(v);
}

function toSafeGemStone(input?: string) {
  const s = (input ?? "").trim();
  if (!s) return "";
  return s.slice(0, 20);
}

function toSafeUpdatetime(input?: string) {
  const v = (input ?? "").trim();
  const allowed = new Set(["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m"]);
  return allowed.has(v) ? v : "1d";
}

export const generateMetadata = async ({ searchParams }: Props): Promise<Metadata> => {
  const sp = (await searchParams) ?? {};
  const gemStone = toSafeGemStone(sp.gemStone ?? "작열");
  const level = toSafeLevel(sp.level ?? "1");
  const updatetime = toSafeUpdatetime(sp.updatetime);

  const baseTitle = "로스트아크 보석 시세 차트";
  const title = gemStone ? `로스트아크 ${level}레벨 ${gemStone} 보석 시세 차트` : baseTitle;

  const description = gemStone ? `로스트아크 ${level}레벨 ${gemStone} 보석 시세를 차트로 확인하고 변동 흐름을 분석할 수 있습니다. updatetime(${updatetime}) 조회를 지원하며 OpenAPI를 제공합니다.` : `로스트아크 보석 시세를 차트로 확인하고 변동 흐름을 분석할 수 있습니다. updatetime(${updatetime}) 조회를 지원하며 OpenAPI를 제공합니다.`;

  const baseUrl = "https://2er0.io/tools/game/onstove/lostark/auction-chart/gemstone";

  const qs: string[] = [];
  if (gemStone) qs.push(`gemStone=${encodeURIComponent(gemStone)}`);
  if (level) qs.push(`level=${encodeURIComponent(level)}`);
  if (updatetime && updatetime !== "1d") qs.push(`updatetime=${encodeURIComponent(updatetime)}`);

  const canonical = qs.length ? `${baseUrl}?${qs.join("&")}` : baseUrl;

  return {
    title,
    description,
    metadataBase: new URL("https://2er0.io"),

    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "2ER0",
      images: [
        {
          url: "/app/LostArkGemChart.webp",
          width: 1200,
          height: 630,
          alt: gemStone ? `${level}레벨 ${gemStone} 보석 시세 차트` : "로스트아크 보석 시세 차트",
        },
        {
          url: "/app/LostArkGemChart.png",
          width: 1200,
          height: 630,
          alt: gemStone ? `${level}레벨 ${gemStone} 보석 시세 차트` : "로스트아크 보석 시세 차트",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/app/LostArkGemChart.webp", "/app/LostArkGemChart.png"],
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical,
    },
  };
};

export default async function AuctionChartPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const initialGemStone = toSafeGemStone(sp.gemStone);
  const initialLevel = toSafeLevel(sp.level);
  const initialUpdatetime = toSafeUpdatetime(sp.updatetime);

  const GEMSTONE_LIST = ["작열", "겁화", "멸화", "홍염"];
  const UPDATETIME_LIST = ["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m"];

  return <AuctionGemChartClient GEMSTONE_LIST={GEMSTONE_LIST} initialGemStone={initialGemStone} initialLevel={initialLevel} initialUpdatetime={initialUpdatetime} UPDATETIME_LIST={UPDATETIME_LIST} />;
}
