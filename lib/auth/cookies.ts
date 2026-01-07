// 쿠키 옵션 공통
import { getAuthCookieName, getAuthMaxAge } from "./jwt";

export function authCookieOptions() {
  const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const secure = origin.startsWith("https://");

  return {
    name: getAuthCookieName(),
    options: {
      httpOnly: true as const,
      secure,
      sameSite: "lax" as const,
      path: "/",
      maxAge: getAuthMaxAge(),
    },
  };
}
