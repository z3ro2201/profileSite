import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Next 내부 데이터 요청은 그냥 패스
  if (pathname.startsWith("/_next/data")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // ✅ /admin 이외는 통과
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ✅ 관리자 공개 경로는 통과 (login, logout)
  if (ADMIN_PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = req.cookies.get(getAuthCookieName())?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await verifyAuthToken(token);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

// ✅ api 제외 (중요)
export const config = {
  // matcher: ["/admin/:path*", "/api/admin/:path*"],
  matcher: ["/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml).*)"],
};
