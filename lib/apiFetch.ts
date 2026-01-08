type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  next?: RequestInit["next"];
  cache?: RequestInit["cache"];
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

  if (options.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    body = JSON.stringify(options.body);
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
    const message = (isJson && data && typeof data === "object" && "message" in data && (data as any).message) || `API error (${res.status})`;
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
