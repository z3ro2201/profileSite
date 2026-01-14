"use client";

import { useMemo } from "react";
import Link from "next/link";

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

type Props = {
  characterName: string;
  categoryLabel: string;
  apiPath: string;
  data: ApiRes;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightText = ({ text, query }: { text: string; query: string }) => {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  const parts = text.split(re);

  return (
    <>
      {parts.map((p, i) => {
        const isHit = p.toLowerCase() === q.toLowerCase();
        if (!isHit) return <span key={i}>{p}</span>;
        return (
          <mark key={i} className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded">
            {p}
          </mark>
        );
      })}
    </>
  );
};

const SasaResultList = ({ characterName, categoryLabel, apiPath, data }: Props) => {
  const handleCopy = async () => {
    if (!apiPath) return;

    try {
      await navigator.clipboard.writeText(apiPath);
      alert("복사되었습니다");
    } catch {
      alert("복사 실패");
    }
  };

  return (
    <>
      {/* 검색 정보 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            <span className="text-blue-600">"{characterName}"</span> 검색 결과
            <span className="ml-2 text-sm font-normal text-gray-600">({categoryLabel})</span>
          </h2>
          <span className="text-sm text-gray-500">{data.list?.length || 0}개 발견</span>
        </div>

        {data.message && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">{data.message}</div>}

        {apiPath && (
          <details className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs">
            <summary className="cursor-pointer font-medium text-gray-700 select-none">OpenAPI 주소 보기</summary>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 bg-white px-2 py-1 rounded border border-gray-300 overflow-x-auto">{apiPath}</code>
              <button onClick={handleCopy} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                복사
              </button>
            </div>
          </details>
        )}
      </div>

      {/* 결과 목록 */}
      {!data.list || data.list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</p>
          <p className="text-gray-400 text-sm mb-1">해당 캐릭터의 비매너 이력이 없거나 검색 범위를 변경해보세요</p>
          <p className="text-gray-400 text-xs mt-2">※ 결과가 없다고 해서 100% 안전하다고 보장할 수는 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.list.map((item, index) => (
            <div key={item.link || `${item.title}-${index}`} className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
              {item.link ? (
                <Link href={item.link} target="_blank" rel="noopener noreferrer" className="block p-4 text-gray-900 hover:text-blue-600">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-1 text-xs font-semibold text-gray-400 w-6">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <HighlightText text={item.title} query={characterName} />
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <div className="p-4 text-gray-900">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-1 text-xs font-semibold text-gray-400 w-6">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <HighlightText text={item.title} query={characterName} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SasaResultList;
