"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

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

const DEFAULT_CATEGORY: CategoryValue = "subjcont";

const normalizeCategory = (v?: string): CategoryValue => {
  const ok = SASA_SEARCH_CATEGORY.some((x) => x.value === v);
  return ok ? (v as CategoryValue) : DEFAULT_CATEGORY;
};

export default function InvenSasaClient({ category, characterName }: { category?: string; characterName?: string }) {
  const router = useRouter();

  const [qCategory, setQCategory] = useState<CategoryValue>(() => normalizeCategory(category));
  const [qCharacterName, setQCharacterName] = useState(characterName ?? "");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [apiPath, setApiPath] = useState<string>("");

  const categoryId = useId();
  const inputId = useId();

  const didAutoRunRef = useRef(false);
  const requestIdRef = useRef(0);

  const runSearch = async (catRaw: string, rawName: string, syncUrl = true) => {
    const cat = normalizeCategory(catRaw);
    const name = rawName.trim();
    if (!name) return;

    setResults([]);
    setResultMsg("");

    if (syncUrl) {
      const qs = new URLSearchParams({
        category: cat,
        characterName: name,
      }).toString();
      router.replace(`?${qs}`, { scroll: false });
    }

    const myId = ++requestIdRef.current;
    setLoading(true);

    try {
      const qs = new URLSearchParams({ category: cat }).toString();
      const data = await apiFetch<ApiRes>(`/app/game/onstove/lostark/sasaFind/${encodeURIComponent(name)}?${qs}`, { cache: "no-store" });
      setApiPath(`https://2er0.io/api/app/game/onstove/lostark/sasaFind/${encodeURIComponent(name)}?${qs}`);

      if (myId !== requestIdRef.current) return;

      setResults(data.list ?? []);
      setResultMsg(data.message ?? "");
    } finally {
      if (myId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (didAutoRunRef.current) return;
    if (!characterName?.trim()) return;

    didAutoRunRef.current = true;
    void runSearch(category ?? DEFAULT_CATEGORY, characterName, false);
  }, [category, characterName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(qCategory, qCharacterName, true);
  };

  const handleCopy = async () => {
    if (!apiPath) return;
    if (!navigator?.clipboard?.writeText) {
      alert("이 브라우저에서는 클립보드 복사를 지원하지 않습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(apiPath);
      alert("복사되었습니다.");
    } catch {
      alert("복사 실패");
    }
  };

  return (
    <div
      className="
        mx-auto max-w-3xl
        rounded-2xl
        bg-white/90 backdrop-blur
        border border-black/30
        shadow-[0_12px_32px_rgba(0,0,0,0.2)]
        p-4
      "
    >
      <form role="search" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <label htmlFor={categoryId} className="sr-only">
            검색 범주
          </label>

          <select
            id={categoryId}
            value={qCategory}
            onChange={(e) => setQCategory(normalizeCategory(e.target.value))}
            className="
              h-10 min-w-[120px]
              rounded-lg
              border border-black/40
              bg-white
              px-3 text-sm
              outline-none
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-black focus-visible:outline-offset-2
            "
          >
            {SASA_SEARCH_CATEGORY.map((item) => (
              <option key={item.value} value={item.value}>
                {item.category}
              </option>
            ))}
          </select>

          <label htmlFor={inputId} className="sr-only">
            캐릭터명
          </label>

          <input
            id={inputId}
            type="search"
            value={qCharacterName}
            onChange={(e) => setQCharacterName(e.target.value)}
            placeholder="캐릭터명을 입력하세요"
            className="
              h-10 flex-1
              rounded-lg
              border border-black/40
              bg-white
              px-3 text-sm
              outline-none
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-black focus-visible:outline-offset-2
            "
          />

          <button
            type="submit"
            className="
              h-10
              rounded-lg
              border border-black/40
              bg-white
              px-4 text-sm font-medium
              hover:bg-black/10
              outline-none
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-black focus-visible:outline-offset-2
            "
          >
            검색
          </button>
        </div>
      </form>

      <div className="mt-4 max-h-[400px] space-y-3 overflow-auto">
        {loading && <div className="text-sm text-black/70">검색중…</div>}

        {!!resultMsg && !loading && (
          <>
            <div
              className="
              rounded-xl
              border border-black/30
              bg-white/95 backdrop-blur
              px-4 py-3
              text-sm text-black
              shadow-[0_4px_14px_rgba(0,0,0,0.15)]
            "
              role="status"
              aria-live="polite"
            >
              <span className="block underline cursor-pointer" onClick={handleCopy}>
                OpenApi: {apiPath}
              </span>
            </div>
            <div
              className="
              rounded-xl
              border border-black/30
              bg-white/95 backdrop-blur
              px-4 py-3
              text-sm text-black
              shadow-[0_4px_14px_rgba(0,0,0,0.15)]
            "
              role="status"
              aria-live="polite"
            >
              {resultMsg}
            </div>
          </>
        )}

        {results.map((item) => (
          <div
            key={`${item.link ?? item.title}`}
            className="
              rounded-lg
              border border-black/30
              bg-white/95 backdrop-blur
              p-3
              shadow-[0_3px_10px_rgba(0,0,0,0.12)]
            "
          >
            {item.link ? (
              <a href={item.link} target="_blank" rel="noreferrer" className="underline text-black">
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
