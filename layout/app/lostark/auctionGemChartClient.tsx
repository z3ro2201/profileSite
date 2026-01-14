"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import type { AuctionGemChartProp, GemChartResponse, GemChartRow, Tab } from "@/types/Lostark";
import { ALLOWED_UPDATETIME } from "@/lib/lostark";

const DEFAULT_LEVEL = "10";
const DEFAULT_UPDATETIME = "1d";
const DEFAULT_REFRESH_MS = 5 * 60 * 1000;

const clampLevel = (v?: string) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return DEFAULT_LEVEL;
  return String(Math.min(10, Math.max(1, Math.trunc(n))));
};

const clampUpdatetime = (v?: string) => {
  const s = (v ?? "").trim();
  return ALLOWED_UPDATETIME.has(s) ? s : DEFAULT_UPDATETIME;
};

const toMsFromUpdatetime = (u?: string) => {
  const v = clampUpdatetime(u);
  const m = v.match(/^(\d+)([dhm])$/);
  if (!m) return DEFAULT_REFRESH_MS;

  const n = Number(m[1]);
  const unit = m[2] as "d" | "h" | "m";
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_REFRESH_MS;

  if (unit === "d") return n * 24 * 60 * 60 * 1000;
  if (unit === "h") return n * 60 * 60 * 1000;
  return n * 60 * 1000;
};

const buildApiPath = (gemStone: string, level: string, updatetime: string) => {
  const itemName = `${clampLevel(level)}레벨 ${gemStone}의 보석`;
  const base = `/api/app/game/onstove/lostark/auction-chart/gemStone/${encodeURIComponent(itemName)}`;
  const u = clampUpdatetime(updatetime);
  return `${base}?updatetime=${encodeURIComponent(u)}`;
};

const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");

const fmtUpLabel = (u: string) => {
  const v = clampUpdatetime(u);
  if (v.endsWith("d")) return `${v.slice(0, -1)}일`;
  if (v.endsWith("h")) return `${v.slice(0, -1)}시간`;
  if (v.endsWith("m")) return `${v.slice(0, -1)}분`;
  return v;
};

const AuctionGemChartClient: React.FC<AuctionGemChartProp> = ({ GEMSTONE_LIST, initialGemStone, initialLevel, UPDATETIME_LIST, initialData, initialUpdatetime }) => {
  const router = useRouter();
  const sp = useSearchParams();

  const updatetimeParam = sp.get("updatetime") ?? undefined;
  const firstGemFromList = (GEMSTONE_LIST?.[0] ?? "").trim();

  const fallbackUp = clampUpdatetime(updatetimeParam ?? initialUpdatetime ?? UPDATETIME_LIST?.[0] ?? DEFAULT_UPDATETIME);

  const [gemStone, setGemStone] = useState<string>(initialGemStone ?? "작열");
  const [level, setLevel] = useState<string>(initialLevel ?? "10");
  const [updatetime, setUpdatetime] = useState<string>(fallbackUp);

  const [activeTab, setActiveTab] = useState<Tab>("CHANGE");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GemChartRow[]>(initialData?.data ?? []);
  const [error, setError] = useState<string | null>(null);

  const [bucketSeconds, setBucketSeconds] = useState<number>(initialData?.bucketSeconds ?? 300);
  const [rangeSeconds, setRangeSeconds] = useState<number>(initialData?.rangeSeconds ?? 24 * 60 * 60);

  const [refreshKey, setRefreshKey] = useState(0);

  const [refreshMs, setRefreshMs] = useState<number>(() => {
    const u = updatetimeParam ?? initialUpdatetime ?? fallbackUp;
    return toMsFromUpdatetime(u);
  });

  const [remainSec, setRemainSec] = useState<number>(Math.floor(refreshMs / 1000));
  const nextRefreshAtRef = useRef<number>(Date.now() + refreshMs);

  const [ChartComp, setChartComp] = useState<null | React.ComponentType<{ rows: GemChartRow[]; bucketSeconds?: number; rangeSeconds?: number; updatetimeLabel?: string }>>(null);

  const didSkipFirstFetch = useRef(false);

  useEffect(() => {
    let alive = true;

    import("@/components/GemStockChart")
      .then((m) => {
        if (!alive) return;
        setChartComp(() => m.default);
      })
      .catch(() => {
        if (!alive) return;
        setError("차트 모듈 로딩에 실패했습니다.");
        setChartComp(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const safeDecode = (s: string) => {
    try {
      return decodeURI(s);
    } catch {
      return s;
    }
  };

  const upList = useMemo(() => {
    const src = (UPDATETIME_LIST?.length ? UPDATETIME_LIST : Array.from(ALLOWED_UPDATETIME)) as string[];
    const uniq: string[] = [];
    const seen = new Set<string>();

    for (const raw of src) {
      const v = clampUpdatetime((raw ?? "").trim());
      if (!v || seen.has(v)) continue;
      seen.add(v);
      uniq.push(v);
    }

    return uniq.length ? uniq : [DEFAULT_UPDATETIME];
  }, [UPDATETIME_LIST]);

  const updateQuery = (g: string, l: string, u: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("updatetime", clampUpdatetime(u));
    router.replace(`/tools/game/onstove/lostark/auction-chart/gemstone/${g}/${l}?${params.toString()}`, { scroll: false });
  };

  const effectiveUp = clampUpdatetime(updatetimeParam ?? updatetime ?? DEFAULT_UPDATETIME);

  useEffect(() => {
    updateQuery(gemStone, level, effectiveUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gemStone, level, firstGemFromList]);

  useEffect(() => {
    if (updatetimeParam != null) setUpdatetime(clampUpdatetime(updatetimeParam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatetimeParam]);

  useEffect(() => {
    setRefreshMs(toMsFromUpdatetime(effectiveUp));
  }, [effectiveUp]);

  const apiPath = useMemo(() => {
    return buildApiPath(gemStone, level, effectiveUp);
  }, [gemStone, level, effectiveUp]);

  const ready = !!effectiveUp;

  const resetCountdown = () => {
    const ms = refreshMs > 0 ? refreshMs : DEFAULT_REFRESH_MS;
    nextRefreshAtRef.current = Date.now() + ms;
    setRemainSec(Math.floor(ms / 1000));
  };

  useEffect(() => {
    if (!apiPath || !ready) return;

    resetCountdown();

    if (initialData && !didSkipFirstFetch.current) return;

    setRefreshKey((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, ready, initialData, refreshMs]);

  useEffect(() => {
    if (!apiPath || !ready) return;

    if (initialData && !didSkipFirstFetch.current) {
      didSkipFirstFetch.current = true;
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch<GemChartResponse>(apiPath, { cache: "no-store" });
        if (cancelled) return;

        setData(res?.data ?? []);
        setBucketSeconds(res?.bucketSeconds ?? 300);
        setRangeSeconds(res?.rangeSeconds ?? 24 * 60 * 60);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "오류");
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiPath, refreshKey, ready, initialData]);

  useEffect(() => {
    if (!apiPath || !ready) return;

    const tickId = window.setInterval(() => {
      const ms = nextRefreshAtRef.current - Date.now();
      const sec = Math.ceil(ms / 1000);

      if (sec <= 0) {
        resetCountdown();
        setRefreshKey((v) => v + 1);
        return;
      }

      setRemainSec(sec);
    }, 1000);

    return () => window.clearInterval(tickId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, ready, refreshMs]);

  const handleManualRefresh = () => {
    if (loading) return;
    resetCountdown();
    setRefreshKey((v) => v + 1);
  };

  const handleCopy = async () => {
    if (!apiPath) return;
    const text = `https://2er0.io${safeDecode(apiPath)}`;
    await navigator.clipboard?.writeText?.(text);
  };

  const changeRows = useMemo(() => {
    if (!data.length) return [];
    const sorted = [...data].sort((a, b) => (a.halfhour_registDateTime > b.halfhour_registDateTime ? 1 : -1));

    return sorted
      .map((cur, i) => {
        const prev = sorted[i - 1];
        const curAmt = cur.item_amount == null ? null : num(cur.item_amount);
        const prevAmt = prev?.item_amount == null ? null : num(prev.item_amount);
        const diff = curAmt != null && prevAmt != null ? curAmt - prevAmt : null;
        return { time: cur.halfhour_registDateTime, price: curAmt, diff };
      })
      .filter((r) => r.diff != null && r.diff !== 0)
      .reverse();
  }, [data]);

  const remainText = useMemo(() => {
    const m = Math.floor(remainSec / 60);
    const s = remainSec % 60;
    return `${pad2(m)}분 ${pad2(s)}초`;
  }, [remainSec]);

  const refreshInfoText = useMemo(() => {
    const sec = Math.floor((refreshMs > 0 ? refreshMs : DEFAULT_REFRESH_MS) / 1000);
    return sec % 60 === 0 ? `${sec / 60}분 단위로 자동 새로고침` : `${sec}초 단위로 자동 새로고침`;
  }, [refreshMs]);

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={gemStone}
            onChange={(e) => {
              const next = e.target.value;
              setGemStone(next);
              updateQuery(next, level, updatetime);
            }}
            className="p-2 bg-white/80 border border-black/20 rounded-lg text-[.8rem]"
          >
            {(GEMSTONE_LIST ?? []).map((stone) => (
              <option value={stone} key={stone}>
                {stone}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => {
              const next = clampLevel(e.target.value);
              setLevel(next);
              updateQuery(gemStone, next, updatetime);
            }}
            className="p-2 bg-white/80 border border-black/20 rounded-lg text-[.8rem]"
          >
            {Array.from({ length: 10 }, (_, i) => String(10 - i)).map((lv) => (
              <option value={lv} key={lv}>
                {lv}레벨
              </option>
            ))}
          </select>

          <select
            value={updatetime}
            onChange={(e) => {
              const next = clampUpdatetime(e.target.value);
              setUpdatetime(next);
              setRefreshMs(toMsFromUpdatetime(next));
              updateQuery(gemStone, level, next);
            }}
            className="p-2 bg-white/80 border border-black/20 rounded-lg text-[.8rem]"
          >
            {upList.map((u) => (
              <option value={u} key={u}>
                {fmtUpLabel(u)}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={handleManualRefresh} disabled={loading} className="px-3 py-2 rounded-lg text-[.8rem] border border-black/20 bg-white/80 hover:bg-white disabled:opacity-40">
          새로고침
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2 text-[.75rem] text-gray-700">
        <div className="px-2 py-1 rounded-md bg-white/70 border border-black/10">
          {refreshInfoText} / 조회범위: {fmtUpLabel(effectiveUp)}
        </div>
        <div className="px-2 py-1 rounded-md bg-white/70 border border-black/10 font-mono">다음 갱신까지 {remainText}</div>
      </div>

      {loading && <div className="p-3">로딩중</div>}
      {error && <div className="p-3 text-red-600">{error}</div>}

      {!error && (
        <>
          {ChartComp ? (
            <ChartComp rows={data} bucketSeconds={bucketSeconds} rangeSeconds={rangeSeconds} updatetimeLabel={fmtUpLabel(effectiveUp)} />
          ) : (
            <div className="h-[320px] rounded-xl border border-white/20 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center text-sm text-gray-600">차트 로딩중</div>
          )}

          <div className="w-full mt-4 rounded-xl border border-white/20 bg-white/80 backdrop-blur-md shadow-sm">
            <ol className="flex gap-2 border-b border-black/10 px-2 pt-2 mb-3">
              <li>
                <button type="button" onClick={() => setActiveTab("CHANGE")} className={["px-3 py-2 cursor-pointer text-[.85rem] rounded-t-lg transition", activeTab === "CHANGE" ? "bg-white text-gray-900 shadow-sm border border-black/10" : "text-gray-700 hover:text-gray-900"].join(" ")}>
                  변동 목록
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActiveTab("OPEN_API")} className={["px-3 py-2 cursor-pointer text-[.85rem] rounded-t-lg transition", activeTab === "OPEN_API" ? "bg-white text-gray-900 shadow-sm border border-black/10" : "text-gray-700 hover:text-gray-900"].join(" ")}>
                  OpenAPI
                </button>
              </li>
            </ol>

            <div className="px-3 pb-3 max-h-[250px] overflow-auto">
              {activeTab === "CHANGE" && (
                <div className="rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm p-3">
                  {changeRows.length === 0 ? (
                    <div className="text-sm text-gray-500">데이터 없음</div>
                  ) : (
                    <ul className="space-y-2 max-h-[200px] text-[.85rem] overflow-auto">
                      <li className="flex justify-between items-center">
                        <span className="font-mono opacity-70">변동시간</span>
                        <div className="flex gap-3 items-center">
                          <span className="font-mono w-[100px] text-center">골드</span>
                          <span className="font-mono w-[80px] text-center text-[.8rem]">변동 폭</span>
                        </div>
                      </li>
                      {changeRows.slice(0, 80).map((r, i) => {
                        const up = (r.diff ?? 0) > 0;
                        const down = (r.diff ?? 0) < 0;
                        return (
                          <li key={i} className="flex justify-between items-center">
                            <span className="font-mono opacity-70">{r.time}</span>
                            <div className="flex gap-3 items-center">
                              <span className="font-mono w-[100px] text-right">{r.price == null ? "-" : `${r.price.toLocaleString()} G`}</span>
                              <span className={["font-mono w-[80px] text-[.8rem] text-right", up ? "text-red-600" : "", down ? "text-blue-600" : "", !up && !down ? "opacity-50" : ""].join(" ")}>{r.diff == null ? "" : up ? `+${r.diff.toLocaleString()}` : r.diff.toLocaleString()}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === "OPEN_API" && (
                <div className="rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm p-3 space-y-2">
                  <div className="text-sm">
                    API 주소:{" "}
                    <span className="underline cursor-pointer" onClick={handleCopy}>
                      {apiPath && `https://2er0.io${safeDecode(apiPath)}`}
                    </span>
                  </div>
                  <div className="h-[150px] bg-black/60 overflow-auto text-white rounded-lg">
                    <pre className="p-3 text-xs">{JSON.stringify(data.slice(0, 10), null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuctionGemChartClient;
