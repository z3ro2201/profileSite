import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { prisma } from "@/lib/prisma";

type CredId = string | Uint8Array | Buffer;

type AuthenticatorTransportFuture = "usb" | "nfc" | "ble" | "internal" | "hybrid" | "smart-card";

function isAuthenticatorTransportFuture(v: unknown): v is AuthenticatorTransportFuture {
  return v === "usb" || v === "nfc" || v === "ble" || v === "internal" || v === "hybrid" || v === "smart-card";
}

type PasskeyRow = {
  credentialId: CredId;
  transports: string | null;
};

function toBase64UrlString(v: CredId): string {
  if (typeof v === "string") return v;
  return isoBase64URL.fromBuffer(Buffer.from(v));
}

function parseTransports(v: string | null): AuthenticatorTransportFuture[] | undefined {
  if (!v) return undefined;

  const s = v.trim();

  // JSON 문자열: '["usb","nfc"]'
  if (s.startsWith("[")) {
    try {
      const arr: unknown = JSON.parse(s);
      if (Array.isArray(arr)) {
        return arr.filter(isAuthenticatorTransportFuture);
      }
    } catch {
      return undefined;
    }
  }

  // CSV 문자열: "usb,nfc,ble"
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(isAuthenticatorTransportFuture);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    // 입력 검증
    if (!userId || typeof userId !== "number") {
      return NextResponse.json({ error: "userId is required and must be a number" }, { status: 400 });
    }

    // 환경 변수 (register와 동일하게)
    const rpID = process.env.RP_ID;

    if (!rpID) {
      console.error("Missing RP_ID environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Passkey 조회
    const creds: PasskeyRow[] = await prisma.passkeyCredential.findMany({
      where: { userId },
      select: { credentialId: true, transports: true },
    });

    // Passkey가 없으면
    if (creds.length === 0) {
      return NextResponse.json({ error: "No passkeys found for this user" }, { status: 404 });
    }

    // 인증 옵션 생성
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: creds.map((c) => ({
        id: toBase64UrlString(c.credentialId),
        type: "public-key",
        transports: parseTransports(c.transports),
      })),
      userVerification: "preferred",
      timeout: 300000, // 5분
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey login options error:", error);
    return NextResponse.json({ error: "Failed to generate authentication options" }, { status: 500 });
  }
}
