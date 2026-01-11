import type { Metadata } from "next";
import AuctionGemChartClient from "@/layout/app/lostark/auctionGemChartClient";

type SearchParams = {
  gemStone?: string;
  level?: string;
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

export const generateMetadata = async ({ searchParams }: Props): Promise<Metadata> => {
  const sp = (await searchParams) ?? {};
  const gemStone = toSafeGemStone(sp.gemStone);
  const level = toSafeLevel(sp.level);

  const baseTitle = "로스트아크 보석 시세 차트";
  const title = gemStone ? `로스트아크 ${level}레벨 ${gemStone} 보석 시세 차트` : baseTitle;

  const description = gemStone
    ? `로스트아크 ${level}레벨 ${gemStone} 보석 시세를 30분 단위 차트로 확인하고 변동 흐름을 분석할 수 있습니다. 5분 단위 자동 새로고침을 지원하며 OpenAPI를 제공합니다.`
    : "로스트아크 보석 시세를 30분 단위 차트로 확인하고 변동 흐름을 분석할 수 있습니다. 5분 단위 자동 새로고침을 지원하며 OpenAPI를 제공합니다.";

  const baseUrl = "https://2er0.io/tools/game/onstove/lostark/auction-chart";

  const canonical = gemStone || sp.level ? `${baseUrl}?gemStone=${encodeURIComponent(gemStone || "")}&level=${encodeURIComponent(level)}` : baseUrl;

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

  const GEMSTONE_LIST = ["작열", "겁화", "멸화", "홍염"];

  return <AuctionGemChartClient GEMSTONE_LIST={GEMSTONE_LIST} initialGemStone={initialGemStone} initialLevel={initialLevel} />;
}
