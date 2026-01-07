import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);
const cookieName = process.env.AUTH_COOKIE_NAME ?? "auth";
const maxAge = Number(process.env.AUTH_COOKIE_MAXAGE ?? "1209600"); // 14d

export type AuthTokenPayload = {
  sub: string; // userId
  email: string;
  name?: string | null;
};

export function getAuthCookieName() {
  return cookieName;
}

export function getAuthMaxAge() {
  return maxAge;
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return await new SignJWT({ email: payload.email, name: payload.name ?? null })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(payload.sub)
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(secret);
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
