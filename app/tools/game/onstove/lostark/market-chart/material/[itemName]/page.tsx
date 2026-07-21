import type { Metadata } from "next";
import { MATERIAL_ITEM_LIST, UPDATETIME_LIST } from "@/lib/lostark";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import MaterialChartClient from "@/layout/app/lostark/materialChartClient";
import type { GemChartResponse } from "@/types/Lostark";

const INDEX_UPDATETIMES = new Set(["1d", "7d", "30d"]);

type Props = {
  params: Promise<{ itemName: string }>;
  searchParams?: Promise<{ updatetime?: string }>;
};

function toSafeMaterial(input?: string) {
  // Next.js 동적 세그먼트 params가 항상 자동으로 디코딩되는 게 아니라서(%20 등이
  // 그대로 남아있는 경우가 있었음), 명시적으로 디코딩한 뒤 비교한다.
  // 안 그러면 이미 유효한 값인데도 무효 처리 → 리다이렉트 → 다시 무효 처리… 무한루프에 빠짐(실제 발생했던 버그).
  let decoded = input ?? "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // 이미 디코딩된 문자열이라 %XX 패턴이 깨진 걸로 보이는 경우 등 — 원본 그대로 사용
  }
  const s = decoded.trim();
  return (MATERIAL_ITEM_LIST as readonly string[]).includes(s) ? s : null;
}

function toSafeUpdatetime(input?: string): string {
  const v = (input ?? "").trim();
  const allowed = new Set(["30d", "15d", "7d", "1d", "12h", "6h", "3h", "2h", "1h", "30m", "15m", "10m", "5m", "1m"]);
  return allowed.has(v) ? v : "1d";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { itemName } = await params;
  const sp = (await searchParams) ?? {};
  const material = toSafeMaterial(itemName);

  if (!material) {
    return { title: "요청하신 아이템을 찾을 수 없습니다", robots: { index: false, follow: false } };
  }

  const updatetime = toSafeUpdatetime(sp.updatetime);
  const canonical = `https://2er0.io/tools/game/onstove/lostark/market-chart/material/${encodeURIComponent(material)}`;
  const shouldIndex = INDEX_UPDATETIMES.has(updatetime);

  const keywords = [
    "로아재료시세",
    "로스트아크거래소",
    "로아거래소",
    `${material}`,
    `${material}시세`,
    `${material}가격`,
    `${material}시세차트`,
    `로아${material}`,
    `로스트아크${material}`,
  ].join(", ");

  return {
    title: `로아 ${material} 시세 - 실시간 거래소 차트 | 2ER0`,
    description: `로스트아크 ${material} 거래소 시세를 실시간 차트로 확인하세요. 1분~30일 단위 데이터, OpenAPI 제공.`,
    keywords,
    alternates: { canonical },
    robots: { index: shouldIndex, follow: true },
    openGraph: {
      type: "website",
      title: `로아 ${material} 시세`,
      description: `${material} 거래소 실시간 시세차트`,
      url: canonical,
      siteName: "2ER0",
      images: [{ url: "/app/LostArkGemChart.webp", width: 1200, height: 630, alt: `${material} 시세` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `로아 ${material} 시세`,
      description: `${material} 거래소 실시간 시세차트`,
      images: ["/app/LostArkGemChart.webp"],
    },
  };
}

const MaterialChartPage = async ({ params, searchParams }: Props) => {
  const { itemName } = await params;
  const sp = (await searchParams) ?? {};
  const material = toSafeMaterial(itemName);

  // 유효하지 않은 재료면 기본값으로 리다이렉트.
  // ⚠️ 한글/공백을 URL 인코딩 없이 그대로 Location 헤더에 넣으면 Node가
  // "Invalid character in header content"로 거부함(500 에러) — encodeURIComponent 필수.
  //
  // ⚠️ 안전장치: 디코딩 처리를 거쳤는데도 "이미 기본값인데 무효로 판정"되는 예상 못한
  // 케이스가 생기면 무한루프에 빠질 수 있음(실제로 겪었던 버그) — 그럴 땐 리다이렉트 대신
  // 에러 화면을 보여줘서 루프를 끊는다.
  if (!material) {
    const defaultItem = MATERIAL_ITEM_LIST[0];
    let decodedInput = itemName;
    try {
      decodedInput = decodeURIComponent(itemName);
    } catch {
      // no-op
    }

    if (decodedInput.trim() === defaultItem) {
      return (
        <div className="pt-[calc(64px+2rem)] px-2 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">일시적인 오류</h1>
          <p className="text-gray-600 mb-6">
            아이템 목록을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <Link href="/tools/game/onstove/lostark/market-chart/material" className="text-blue-600 hover:underline">
            ← 목록으로 돌아가기
          </Link>
        </div>
      );
    }

    const { redirect } = await import("next/navigation");
    redirect(`/tools/game/onstove/lostark/market-chart/material/${encodeURIComponent(defaultItem)}`);
  }

  const initialUpdatetime = toSafeUpdatetime(sp.updatetime);
  const isInvalidMaterial = !material;

  const url = `/api/app/game/onstove/lostark/market-chart/material/${encodeURIComponent(material as string)}?updatetime=${encodeURIComponent(initialUpdatetime)}`;
  const res = await apiFetch<GemChartResponse>(url, { cache: "no-store" });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `로아 ${material} 시세`,
    alternateName: [`${material}시세`, `${material}가격`, `로아${material}`],
    applicationCategory: "GameApplication",
    description: `로스트아크 ${material} 거래소 실시간 시세차트`,
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
        {isInvalidMaterial && (
          <div className="mb-4 w-full lg:max-w-3xl">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <p className="text-sm text-yellow-800">유효하지 않은 재료명입니다.</p>
            </div>
          </div>
        )}

        <div className="mb-2 w-full lg:max-w-3xl">
          <h1 className="text-2xl font-extrabold text-center">로아 {material} 거래소 시세 차트</h1>

          <div className="mt-2 mb-2 p-4 w-full bg-white rounded-lg">
            <h2 className="mb-2 text-lg font-bold">무엇을 제공하나요?</h2>
            <p className="leading-6">
              <strong>{material}</strong> 거래소 시세를 실시간으로 확인할 수 있습니다.
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
          </div>
        </div>

        <MaterialChartClient
          MATERIAL_ITEM_LIST={MATERIAL_ITEM_LIST}
          initialItemName={material ?? undefined}
          initialUpdatetime={initialUpdatetime}
          initialData={res}
          UPDATETIME_LIST={UPDATETIME_LIST as unknown as readonly string[]}
        />

        <div className="mb-4 pb-4 w-full lg:max-w-3xl">
          <h2 className="mt-4 text-lg font-bold">다른 재료 시세 보기</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {MATERIAL_ITEM_LIST.filter((m) => m !== material)
              .slice(0, 6)
              .map((m) => (
                <Link
                  key={m}
                  href={`/tools/game/onstove/lostark/market-chart/material/${encodeURIComponent(m)}`}
                  className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200 text-center"
                >
                  <span className="font-medium">{m}</span>
                </Link>
              ))}
          </div>

          <h2 className="mt-4 text-lg font-bold">관련 도구</h2>
          <p>
            <Link
              className="underline text-blue-600 hover:text-blue-800"
              href="/tools/game/onstove/lostark/auction-chart"
            >
              로스트아크 보석 시세
            </Link>
            {" · "}
            <Link className="underline text-blue-600 hover:text-blue-800" href="/tools/game/onstove/lostark/sasaFind">
              로스트아크 사사게 검색기
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default MaterialChartPage;
