// (클라이언트) LoginClient.tsx - Passkey username-less 버전
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { apiFetch } from "@/lib/apiFetch";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => searchParams.get("next") ?? "/admin", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/auth/login/password", {
        method: "POST",
        body: { email, password },
      });
      router.replace(nextUrl);
    } catch (error: any) {
      console.error(error);
      alert(error?.message ?? "로그인 실패");
    }
  };

  const onPasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasskeyLoading(true);

    try {
      const options = await apiFetch("/admin/auth/passkey/login/options", {
        method: "POST",
      });

      const authResp: AuthenticationResponseJSON = await startAuthentication(options);

      await apiFetch("/admin/auth/passkey/login/verify", {
        method: "POST",
        body: authResp,
      });

      router.replace(nextUrl);
    } catch (error: any) {
      console.error("Passkey login error:", error);
      if (error?.name === "NotAllowedError") alert("인증이 취소되었습니다.");
      else if (error?.name === "NotSupportedError") alert("이 브라우저는 Passkey를 지원하지 않습니다.");
      else alert(error?.message ?? "Passkey 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-xl font-semibold mb-4">블로그 관리자 로그인</h1>

          <form onSubmit={onSubmit} className="space-y-3">
            <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

            <button className="w-full bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600 transition" type="submit">
              비밀번호로 로그인
            </button>
          </form>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">또는</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Passkey로 로그인</h2>
          <p className="text-sm text-gray-600 mb-4">얼굴인식, 지문 또는 PIN으로 빠르고 안전하게 로그인하세요.</p>

          <form onSubmit={onPasskeyLogin} className="space-y-3">
            <button className="w-full bg-green-500 text-white rounded px-3 py-2 hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" type="submit" disabled={isPasskeyLoading}>
              {isPasskeyLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  인증 중...
                </>
              ) : (
                <>🔑 Passkey로 로그인</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
