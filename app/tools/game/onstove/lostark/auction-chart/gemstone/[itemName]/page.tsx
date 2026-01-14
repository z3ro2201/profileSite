import { GEMSTONE_LIST } from "@/lib/lostark";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ itemName: string }>;
};

function toSafeGemStone(input?: string) {
  const s = (input ?? "").trim();
  return (GEMSTONE_LIST as readonly string[]).includes(s) ? s : null;
}

export async function generateMetadata({ params }: Props) {
  const { itemName } = await params;
  const gemStone = toSafeGemStone(itemName);

  if (!gemStone) {
    return { title: "보석을 찾을 수 없습니다" };
  }

  return {
    title: `${gemStone} 보석 시세 - 로스트아크`,
    description: `${gemStone} 보석의 레벨별 시세를 확인하세요`,
  };
}

const GemStoneSelectPage = async ({ params }: Props) => {
  const { itemName } = await params;
  const gemStone = toSafeGemStone(itemName);

  // 유효하지 않은 보석이면 기본값으로 리다이렉트
  if (!gemStone) {
    redirect("/tools/game/onstove/lostark/auction-chart/gemstone/작열/10");
  }

  const levels = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="pt-[calc(64px+2rem)] px-2 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{gemStone} 보석 시세</h1>

      <p className="mb-6 text-gray-700">확인하실 레벨을 선택하세요.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {levels.map((level) => (
          <Link key={level} href={`/tools/game/onstove/lostark/auction-chart/gemstone/${encodeURIComponent(gemStone)}/${level}`} className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition text-center">
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-sm text-gray-500 mt-1">레벨</div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/tools/game/onstove/lostark/auction-chart/gemstone" className="text-blue-600 hover:underline">
          ← 다른 보석 보기
        </Link>
      </div>
    </div>
  );
};

export default GemStoneSelectPage;
