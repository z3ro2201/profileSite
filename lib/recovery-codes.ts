// lib/recovery-codes.ts
import crypto from "crypto";

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const buf = crypto.randomBytes(9); // 72bit
    const base = buf.toString("base64url").toUpperCase();
    const cleaned = base.replace(/[^A-Z0-9]/g, "").slice(0, 12);
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  });
}

export function hashRecoveryCode(code: string) {
  const pepper = (process.env.RECOVERY_CODE_PEPPER ?? "").trim();
  if (!pepper) throw new Error("RECOVERY_CODE_PEPPER is missing");
  return crypto.createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}

export function normalizeRecoveryCode(input: string) {
  return input.trim().toUpperCase();
}
