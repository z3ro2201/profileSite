// lib/auth/server.ts
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

/**
 * 서버 컴포넌트/API에서 관리자 확인
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value;

    if (!token) return false;

    // JWT 검증 (미들웨어에서 사용하는 동일한 함수)
    await verifyAuthToken(token);
    return true;
  } catch {
    return false;
  }
}

/**
 * 관리자가 아니면 에러 throw
 * API 라우트에서 사용
 */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

/**
 * JWT에서 사용자 정보 추출 (필요시)
 */
export async function getCurrentUser(): Promise<{ userId: number; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value;

    if (!token) return null;

    const payload = await verifyAuthToken(token);
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
