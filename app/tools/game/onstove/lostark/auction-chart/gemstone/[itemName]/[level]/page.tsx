import type { Metadata } from "next";
import AuctionGemChartClient from "@/layout/app/lostark/auctionGemChartClient";
import { apiFetch } from "@/lib/apiFetch";

const GEMSTONE_LIST = ["작열", "겁화", "멸화", "홍염"] as const;
type GemStone = (typeof GEMSTONE_LIST)[number];

const INDEX_LEVELS = new Set(["10"]);
const INDEX_UPDATETIMES = new Set(["1d", "7d", "30d"]);

function toSafeLevel(input?: string) {
  const n = Number(input);
  if (!Number.isFinite(n)) return "10";
  const v = Math.min(Math.max(Math.trunc(n), 1), 10);
  return String(v);
}

function toSafeGemStone(input?: string): GemStone {
  const s = (input ?? "").trim();
  return (GEMSTONE_LIST as readonly string[]).includes(s) ? (s as GemStone) : "작열";
}

function toSafeUpdatetime(input?: string) {
  const v = (input ?? "").trim();
  const allowed = new Set(["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m", "1m"]);
  return allowed.has(v) ? v : "1d";
}

type PageProps = {
  params: Promise<{ itemName: string; level: string }>;
  searchParams?: Promise<{ updatetime?: string }>;
};

type GemChartRow = {
  item_name: string;
  item_amount: number | null;
  halfhour_registDateTime: string;
};

type GemChartResponse = {
  code: number;
  message: string;
  updatetime?: string;
  rangeSeconds?: number;
  bucketSeconds?: number;
  data: GemChartRow[];
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
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
}

export default async function GemStoneChartPage({ params, searchParams }: PageProps) {
  const ps = await params;
  const sp = (await searchParams) ?? {};

  const gemStone = toSafeGemStone(ps.itemName);
  const level = toSafeLevel(ps.level);
  const initialUpdatetime = toSafeUpdatetime(sp.updatetime);

  const UPDATETIME_LIST = ["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m", "1m"] as const;

  const apiItemName = `${level}레벨 ${gemStone}의 보석`;
  const url = `/api/app/game/onstove/lostark/auction-chart/gemStone/${encodeURIComponent(apiItemName)}` + `?updatetime=${encodeURIComponent(initialUpdatetime)}`;

  const res = await apiFetch<GemChartResponse>(url, { cache: "no-store" });

  return (
    <div className="pt-[calc(64px+2rem)] px-2 flex flex-col w-full max-h-full items-center justify-center text-[0.9rem] overflow-auto">
      <h2 className="mt-6 text-lg font-bold">무엇을 보여주나요?</h2>
      <p className="leading-6">
        로스트아크 경매장 데이터를 기반으로 <strong>{gemStone}</strong>의 보석 <strong>{level}레벨</strong> 시세를 기간(<strong>{initialUpdatetime}</strong>)별로 집계해 추이를 시각화합니다.
      </p>

      <h2 className="mt-4 text-lg font-bold">추천 사용법</h2>
      <ul className="list-disc pl-5 leading-6">
        <li>1d는 단기 급등락 체크</li>
        <li>7d/30d는 추세 확인</li>
        <li>10레벨은 거래량이 많아 비교에 유리</li>
      </ul>

      <h2 className="mt-4 text-lg font-bold">관련 도구</h2>
      <p>
        <a className="underline" href="/tools/game/onstove/lostark/sasaFind">
          로스트아크 사사게 검색기
        </a>
      </p>

      <AuctionGemChartClient GEMSTONE_LIST={GEMSTONE_LIST} initialGemStone={gemStone} initialLevel={level} initialUpdatetime={initialUpdatetime} UPDATETIME_LIST={UPDATETIME_LIST as unknown as readonly string[]} />
    </div>
  );
}
