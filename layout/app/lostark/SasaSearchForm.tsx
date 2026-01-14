"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SASA_SEARCH_CATEGORY = [
  { category: "제목+내용", value: "subjcont" },
  { category: "제목", value: "subject" },
  { category: "내용", value: "content" },
  { category: "닉네임", value: "nickname" },
] as const;

type CategoryValue = (typeof SASA_SEARCH_CATEGORY)[number]["value"];

const normalizeCategory = (v?: string): CategoryValue => {
  const ok = SASA_SEARCH_CATEGORY.some((x) => x.value === v);
  return ok ? (v as CategoryValue) : "subjcont";
};

type Props = {
  initialCategory?: string;
  initialCharacterName?: string;
};

const SasaSearchForm = ({ initialCategory, initialCharacterName }: Props) => {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryValue>(() => normalizeCategory(initialCategory));
  const [characterName, setCharacterName] = useState(initialCharacterName ?? "");

  const inputId = useId();
  const categoryId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = characterName.trim();
    if (!name) return;

    const params = new URLSearchParams({
      category,
      characterName: name,
    });
    router.push(`/tools/game/onstove/lostark/sasaFind/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        {/* 검색바 */}
        <div className="relative w-full mb-4">
          <div className="flex items-center w-full h-14 rounded-full border border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:shadow-lg transition-all bg-white px-6">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <label htmlFor={inputId} className="sr-only">
              캐릭터명 검색
            </label>
            <input id={inputId} type="text" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="로스트아크 캐릭터명을 입력하세요" className="flex-1 text-base outline-none bg-transparent" autoComplete="off" />
          </div>
        </div>

        {/* 검색 옵션 & 버튼 */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor={categoryId} className="text-sm text-gray-600">
              검색 범위:
            </label>
            <select id={categoryId} value={category} onChange={(e) => setCategory(normalizeCategory(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:border-blue-500 transition-colors">
              {SASA_SEARCH_CATEGORY.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              비매너 유저 검색
            </button>
            <button
              type="button"
              onClick={() => {
                setCharacterName("");
                setCategory("subjcont");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </form>

      {/* 빠른 링크 (선택사항) */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-4">
          <Link href="/tools/game/onstove/lostark/auction-chart/gemstone/작열/10?updatetime=5m" className="hover:text-blue-600 hover:underline transition-colors">
            보석 시세 차트
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/tools" className="hover:text-blue-600 hover:underline transition-colors">
            다른 도구
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SasaSearchForm;
