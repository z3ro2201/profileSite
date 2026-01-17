import { createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 4) {
    return { valid: false, message: "비밀번호는 4자 이상이어야 합니다" };
  }

  if (password.length > 20) {
    return { valid: false, message: "비밀번호는 20자 이하여야 합니다" };
  }

  return { valid: true };
}
