import { GEMSTONE_LIST } from "@/lib/lostark";
import Link from "next/link";

export const metadata = {
  title: "로스트아크 보석 시세 차트",
  description: "로스트아크 경매장 보석 시세를 확인하세요",
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
