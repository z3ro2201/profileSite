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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth/login/password", { method: "POST", body: JSON.stringify({ email, password }) });
      const json = await res.json();

      if (!res.ok) {
        return alert(json?.error ?? "로그인 실패");
      }

      router.replace(nextUrl);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">블로그 관리자 로그인</h1>

        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />

        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

        <button className="w-full border rounded px-3 py-2" type="submit">
          로그인
        </button>
      </form>
    </div>
  );
}
