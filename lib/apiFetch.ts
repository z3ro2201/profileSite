// lib/apiFetch.ts
type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown; // JSON | FormData | string | Blob | ArrayBuffer | ...
  next?: RequestInit["next"];
  cache?: RequestInit["cache"];
};

const isBodyInit = (v: any): v is BodyInit => {
  // BodyInit: Blob | BufferSource | FormData | URLSearchParams | ReadableStream | string
  if (!v) return false;
  if (typeof v === "string") return true;
  if (v instanceof FormData) return true;
  if (v instanceof URLSearchParams) return true;
  if (v instanceof Blob) return true;
  if (v instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(v)) return true; // TypedArray, DataView
  return false;
};

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = await toApiUrl(path);

  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  // ✅ 서버에서 호출이면: 현재 요청의 쿠키를 API 호출에 전달
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieHeader = (await cookies())
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    if (cookieHeader && !headers["cookie"]) {
      headers["cookie"] = cookieHeader;
    }
  }

  let body: BodyInit | undefined = undefined;

  // ✅ body 처리 규칙
  // 1) FormData/Blob/string/ArrayBuffer 등은 그대로 보낸다 (Content-Type 자동 설정 방해 금지)
  // 2) plain object는 JSON으로 보낸다
  if (options.body !== undefined) {
    const b: any = options.body;

    if (isBodyInit(b)) {
      body = b;

      // FormData는 boundary 포함 Content-Type을 fetch가 자동 설정해야 하므로
      // 여기서 Content-Type을 절대 강제로 넣지 않는다.
      if (b instanceof FormData) {
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
    } else if (typeof b === "object") {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = JSON.stringify(b);
    } else {
      // number/boolean 같은 게 들어오면 문자열로
      body = String(b);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const message = (isJson && data && typeof data === "object" && "message" in (data as any) && (data as any).message) || `API error (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data as T;
}

async function toApiUrl(path: string) {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  const apiPath = cleaned.startsWith("/api/") ? cleaned : `/api${cleaned}`;

  if (typeof window !== "undefined") return apiPath;

  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${apiPath}`;
}
