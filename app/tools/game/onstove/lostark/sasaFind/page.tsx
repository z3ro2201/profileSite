import type { Metadata } from "next";
import InvenSasaClient from "@/layout/app/lostark/invenSasaClient";

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

  const categoryLabelMap: Record<string, string> = {
    subject: "제목",
    content: "내용",
    subjcont: "제목+내용",
    nickname: "닉네임",
  };

  const siteName = "로스트아크 사사게 검색기";

  let title = siteName;
  let description = "로스트아크 인벤 사사게 게시판을 캐릭터명 기준으로 빠르게 검색합니다.";

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

    robots: { index: true, follow: true },

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
      <div className="flex flex-row lg:flex-col gap-2 w-full max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold text-center">로스트아크 사사게 검색기</h1>
        <h4 className="p-2 mb-4 font-extrabold bg-white rounded-lg underline text-red-500">** 주의: 인벤 게시물 조회이므로 관계되지 않은 캐릭터가 나올 수 있습니다.</h4>
        <InvenSasaClient category={sp.category} characterName={sp.characterName} />
      </div>
    </div>
  );
}
