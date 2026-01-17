import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value;
    if (!token) return false;
    await verifyAuthToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}
