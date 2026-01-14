import type { Metadata } from "next";
import InvenSasaClient from "@/layout/app/lostark/invenSasaClient";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  characterName?: string;
  category?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const characterName = sp.characterName?.trim();
  const category = sp.category;
  const isQueryPage = Boolean(characterName);

  const categoryLabelMap: Record<string, string> = {
    subject: "제목",
    content: "내용",
    subjcont: "제목+내용",
    nickname: "닉네임",
  };

  const siteName = "로스트아크 사사게 검색기 | 캐릭터명으로 게시글 찾기";

  let title = siteName;
  let description = "로스트아크 인벤 사사게 게시글을 캐릭터명으로 빠르게 검색할 수 있는 도구입니다.";

  if (characterName) {
    const categoryLabel = categoryLabelMap[category ?? ""] ?? "전체";
    title = `로스트아크 사사게 검색 결과 – ${characterName}`;
    description = `로스트아크 인벤 사사게에서 "${characterName}" 관련 게시글을 ${categoryLabel} 기준으로 검색한 결과입니다.`;
  }

  return {
    title,
    description,

    alternates: {
      canonical: "/tools/game/onstove/lostark/sasaFind",
    },

    robots: isQueryPage ? { index: false, follow: true } : { index: true, follow: true },

    openGraph: {
      title,
      description,
      type: "website",
      siteName,
      images: [
        { url: "/app/LostArkSasaFind.webp", width: 1200, height: 630, alt: "로스트아크 사사게 검색기", type: "image/webp" },
        { url: "/app/LostArkSasaFind.png", width: 1200, height: 630, alt: "로스트아크 사사게 검색기", type: "image/png" },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/app/LostArkSasaFind.webp", "/app/LostArkSasaFind.png"],
    },
  };
}

export default async function SasaFindPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};

  return (
    <div className="relative pt-[calc(64px+2rem)] min-h-dvh px-2 flex flex-col w-full items-center justify-center text-[0.9rem] overflow-x-hidden">
      <div className="p-4 flex flex-col gap-2 w-full max-w-2xl bg-white rounded-lg">
        <h1 className="mb-2 text-3xl font-bold text-center">로스트아크 사사게 검색기</h1>
        <p className="mb-4">
          이 도구는 <strong>로스트아크 인벤 사사게</strong>에 등록된 게시글을 <strong>캐릭터명 기준</strong>으로 검색할 수 있도록 도와줍니다.
        </p>

        <h2 className="mb-2 font-bold">사용 방법</h2>
        <ol className="mb-4">
          <li>1) 캐릭터명을 입력합니다.</li>
          <li>2) 검색 버튼을 누릅니다.</li>
          <li>3) 사사게 관련 게시글 목록을 확인합니다.</li>
        </ol>
        <p className="mb-4">
          관련 도구:{" "}
          <Link href="/tools/game/onstove/lostark/auction-chart" prefetch={false} className="font-bold underline">
            로스트아크 경매 시세 도구
          </Link>
        </p>
        <h4 className="mb-4 font-extrabold bg-white rounded-lg underline text-red-500">** 주의: 인벤 게시물 조회이므로 관계되지 않은 캐릭터가 나올 수 있습니다.</h4>
        <InvenSasaClient category={sp.category} characterName={sp.characterName} />
      </div>
    </div>
  );
}
