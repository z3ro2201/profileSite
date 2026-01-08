import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { prisma } from "@/lib/prisma";

type CredId = string | Uint8Array | Buffer;

type AuthenticatorTransportFuture = "usb" | "nfc" | "ble" | "internal" | "hybrid" | "smart-card";

function isAuthenticatorTransportFuture(v: unknown): v is AuthenticatorTransportFuture {
  return v === "usb" || v === "nfc" || v === "ble" || v === "internal" || v === "hybrid" || v === "smart-card";
}

// ✅ DB 실체에 맞춤: transports = string | null
type PasskeyRow = {
  credentialId: CredId;
  transports: string | null;
};

function toBase64UrlString(v: CredId): string {
  if (typeof v === "string") return v; // 이미 base64url로 저장했다고 가정
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
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";

  const creds: PasskeyRow[] = await prisma.passkeyCredential.findMany({
    where: { userId },
    select: { credentialId: true, transports: true },
  });

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: creds.map((c) => ({
      id: toBase64UrlString(c.credentialId),
      transports: parseTransports(c.transports), // ✅ any 없음
    })),
    userVerification: "preferred",
  });

  return NextResponse.json(options);
}
