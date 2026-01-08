type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  // Next fetch 옵션도 쓰고 싶으면 확장 가능:
  next?: RequestInit["next"];
  cache?: RequestInit["cache"];
};

/**
 * ✅ /api/** 전용 fetch 래퍼
 * - path: "/admin/blog/posts/list" 처럼 "/api" 이후만 넣어도 됨
 * - server 환경이면 absolute URL로 변환 (headers 기반)
 * - JSON body 자동 stringify
 * - JSON 응답 자동 파싱
 */
export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = await toApiUrl(path);

  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  let body: BodyInit | undefined = undefined;

  if (options.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // 응답 파싱
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const message = (isJson && data && typeof data === "object" && "message" in data && (data as any).message) || `API error (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data as T;
}

/**
 * ✅ 서버/클라에 맞게 "/api/..." 절대 URL로 변환
 */
async function toApiUrl(path: string) {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  const apiPath = cleaned.startsWith("/api/") ? cleaned : `/api${cleaned}`;

  // 브라우저면 상대경로로 OK
  if (typeof window !== "undefined") return apiPath;

  // 서버면 절대 URL 필요 (Next 버전 따라 headers()가 Promise일 수 있어 await)
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${apiPath}`;
}
