import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ /admin 이외는 통과
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ✅ 관리자 공개 경로는 통과 (login, logout)
  if (ADMIN_PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
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
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

// ✅ api 제외 (중요)
export const config = {
  // matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
