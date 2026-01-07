import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { toBase64Url } from "@/lib/base64url";

/**
 * DB에서 가져온 credentialId를
 * WebAuthn이 요구하는 Uint8Array로 정규화
 */
function asUint8Array(v: string | Uint8Array | Buffer): Uint8Array {
  // Buffer, Uint8Array는 그대로 사용 가능
  if (typeof v !== "string") {
    return v;
  }

  /**
   * 문자열로 저장된 경우 (base64url 기준)
   * - WebAuthn credentialId는 보통 base64url
   */
  const base64 = v.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((v.length + 3) % 4);

  return Buffer.from(base64, "base64");
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";

    /**
     * Passkey(credential) 조회
     * credentialId 타입:
     *   Buffer | Uint8Array | string (환경/이전 데이터에 따라)
     */
    const creds = await prisma.passkeyCredential.findMany({
      where: { userId },
      select: {
        credentialId: true,
      },
    });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: creds.map((c) => ({
        id: toBase64Url(asUint8Array(c.credentialId)),
      })),
      userVerification: "preferred",
    });

    return NextResponse.json(options);
  } catch (err) {
    console.error("[PASSKEY_LOGIN_OPTIONS_ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
