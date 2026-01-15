import { ReactNode } from "react";
import { cookies } from "next/headers";

import { verifyAuthToken, getAuthCookieName } from "@/lib/auth/jwt";

import AdminMain from "@/layout/admin/mainLayout";
import AdminPublicShell from "@/layout/admin/AdminPublicShell";
import AdminAuthedShell from "@/layout/admin/AdminAuthedShell";

const AdminPageLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  let isLoggedIn = false;
  let user: { id: string; email?: string; name?: string | null } | null = null;

  if (!token) {
    return <AdminPublicShell>{children}</AdminPublicShell>;
  }

  try {
    const payload = await verifyAuthToken(token);
    isLoggedIn = true;
    user = {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string | null,
    };
    return <AdminAuthedShell user={user}>{children}</AdminAuthedShell>;
  } catch (error) {
    // 토큰 만료/위조 -> 로그인 아님
    return <AdminPublicShell>{children}</AdminPublicShell>;
  }
};
export default AdminPageLayout;
