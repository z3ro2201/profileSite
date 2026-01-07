"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 예: /admin/login?next=/admin
  const nextUrl = useMemo(() => {
    return searchParams.get("next") ?? "/admin";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // TODO: 로그인 API 호출 (너 프로젝트 로직에 맞게 교체)
    // 성공하면:
    router.replace(nextUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Admin Login</h1>

        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />

        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

        <button className="w-full border rounded px-3 py-2" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
