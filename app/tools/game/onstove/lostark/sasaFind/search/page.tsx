import type { Metadata } from "next";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import SasaSearchForm from "@/layout/app/lostark/SasaSearchForm";
import SasaResultList from "@/layout/app/lostark/SasaResultList";

const SASA_SEARCH_CATEGORY = [
  { category: "제목", value: "subject" },
  { category: "내용", value: "content" },
  { category: "제목+내용", value: "subjcont" },
  { category: "닉네임", value: "nickname" },
] as const;

type CategoryValue = (typeof SASA_SEARCH_CATEGORY)[number]["value"];

type ResultItem = {
  title: string;
  link?: string;
};

type ApiRes = {
  ok: boolean;
  characterName: string;
  message: string;
  list: ResultItem[];
};

const normalizeCategory = (v?: string): CategoryValue => {
  const ok = SASA_SEARCH_CATEGORY.some((x) => x.value === v);
  return ok ? (v as CategoryValue) : "subjcont";
};

type PageProps = {
  searchParams?: Promise<{ category?: string; characterName?: string }>;
};

export const generateMetadata = async ({ searchParams }: PageProps): Promise<Metadata> => {
  const sp = (await searchParams) ?? {};
  const characterName = sp.characterName?.trim() || "";
  const category = normalizeCategory(sp.category);

  const categoryLabel = SASA_SEARCH_CATEGORY.find((c) => c.value === category)?.category ?? "제목+내용";

  const title = characterName ? `"${characterName}" 검색 결과 - 로스트아크 서버 사건/사고 검색` : "로스트아크 서버 사건/사고 검색기";

  const description = characterName ? `로스트아크 캐릭터 '${characterName}'의 인벤 서버 사건/사고 게시판 검색 결과 (${categoryLabel})` : "로스트아크 인벤 서버 사건/사고 게시판 검색";

  return {
    title,
    description,
    robots: {
      index: false, // 검색 결과 페이지는 인덱싱 제외
      follow: true,
    },
  };
};

const SearchResultPage = async ({ searchParams }: PageProps) => {
  const sp = (await searchParams) ?? {};
  const characterName = sp.characterName?.trim() || "";
  const category = normalizeCategory(sp.category);

  let data: ApiRes | null = null;
  let error: string | null = null;

  // 캐릭터명이 있으면 서버에서 검색
  if (characterName) {
    try {
      const qs = new URLSearchParams({ category }).toString();
      data = await apiFetch<ApiRes>(`/app/game/onstove/lostark/sasaFind/${encodeURIComponent(characterName)}?${qs}`, { cache: "no-store" });
    } catch (e: any) {
      error = e?.message || "검색 중 오류가 발생했습니다";
    }
  }

  const categoryLabel = SASA_SEARCH_CATEGORY.find((c) => c.value === category)?.category ?? "제목+내용";
  const apiPath = characterName ? `https://2er0.io/api/app/game/onstove/lostark/sasaFind/${encodeURIComponent(characterName)}?category=${category}` : "";

  return (
    <div className="w-screen min-h-screen lg:pt-[68px] bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/tools/game/onstove/lostark/sasaFind" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            새로 검색하기
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">로스트아크 서버 사건/사고 검색</h1>

          <SasaSearchForm initialCategory={category} initialCharacterName={characterName} />
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!characterName ? (
          <div className="text-center py-12 text-gray-500">캐릭터명을 입력하고 검색해주세요</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        ) : !data ? (
          <div className="text-center py-12 text-gray-500">검색 중...</div>
        ) : (
          <>
            <SasaResultList characterName={characterName} categoryLabel={categoryLabel} apiPath={apiPath} data={data} />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
