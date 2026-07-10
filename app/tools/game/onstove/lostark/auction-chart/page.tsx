import type { Metadata } from "next";
import { GEMSTONE_LIST } from "@/lib/lostark";
import Link from "next/link";

const CANONICAL = "https://2er0.io/tools/game/onstove/lostark/auction-chart";

export const metadata: Metadata = {
  title: "로스트아크 보석 시세 차트 - 전체 보석 실시간 경매장 시세 | 2ER0",
  description: "로스트아크 작열/겁화/멸화/홍염 등 전체 보석의 경매장 시세를 실시간 차트로 확인하세요. 레벨별 시세 비교, OpenAPI 데이터 제공.",
  keywords: "로스트아크 보석 시세, 로아 보석 시세, 로아 경매장, 보석 시세 차트, 작열 시세, 겁화 시세, 멸화 시세, 홍염 시세, 로스트아크 경매장",
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "로스트아크 보석 시세 차트",
    description: "전체 보석 경매장 시세를 실시간으로 확인하세요.",
    url: CANONICAL,
    siteName: "2ER0",
    images: [{ url: "/LostArkGemChart.webp", width: 1200, height: 630, alt: "로스트아크 보석 시세 차트" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "로스트아크 보석 시세 차트",
    description: "전체 보석 경매장 시세를 실시간으로 확인하세요.",
    images: ["/LostArkGemChart.webp"],
  },
};

const GemstonePage = () => {
  return (
    <div className="pt-[calc(64px+2rem)] px-2 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">보석 시세 차트</h1>

      <p className="mb-6 text-gray-700">보석 종류를 선택하세요. 기본적으로 10레벨 시세를 보여드립니다.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {GEMSTONE_LIST.map((stone) => (
          <Link key={stone} href={`/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(stone)}/10`} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
            <div className="text-center font-medium">{stone}</div>
            <div className="text-center text-sm text-gray-500 mt-1">10레벨</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GemstonePage;
