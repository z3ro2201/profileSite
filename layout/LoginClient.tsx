"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { apiFetch } from "@/lib/apiFetch";

type PwLoginRes = {
  ok: boolean;
  requiresOtp?: boolean;
  userId?: number;
  error?: string;
};

const isSixDigits = (v: string) => /^[0-9]{6}$/.test(v);

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => searchParams.get("next") ?? "/admin", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  // ✅ OTP step for password login only
  const [step, setStep] = useState<"login" | "otp">("login");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [otpToken, setOtpToken] = useState("");
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<PwLoginRes>("/admin/auth/login/password", {
        method: "POST",
        body: { email, password },
      });

      // ✅ OTP required: move to OTP step (no cookie yet)
      if (res.requiresOtp) {
        if (!res.userId) {
          alert("OTP 인증이 필요하지만 사용자 식별에 실패했습니다.");
          return;
        }
        setPendingUserId(res.userId);
        setOtpToken("");
        setStep("otp");
        return;
      }

      // ✅ Normal password login (cookie already set on server)
      router.replace(nextUrl);
    } catch (error: any) {
      console.error(error);
      alert(error?.message ?? "로그인 실패");
    }
  };

  const onOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingUserId) {
      alert("OTP 인증 세션이 없습니다. 다시 로그인 해주세요.");
      setStep("login");
      return;
    }

    const token = otpToken.trim();
    if (!isSixDigits(token)) {
      alert("OTP 6자리 숫자를 입력해주세요.");
      return;
    }

    setIsOtpVerifying(true);
    try {
      // ✅ This endpoint issues the JWT cookie on success
      await apiFetch("/admin/auth/otp/verify", {
        method: "POST",
        body: { userId: pendingUserId, token },
      });

      router.replace(nextUrl);
    } catch (error: any) {
      console.error(error);
      alert(error?.message ?? "OTP 인증 실패");
    } finally {
      setIsOtpVerifying(false);
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

      // ✅ Passkey login does NOT require OTP in your policy
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

  const backToLogin = () => {
    setStep("login");
    setPendingUserId(null);
    setOtpToken("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-xl font-semibold mb-4">블로그 관리자 로그인</h1>

          {step === "login" ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
              <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

              <button className="w-full bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600 transition" type="submit">
                비밀번호로 로그인
              </button>
            </form>
          ) : (
            <form onSubmit={onOtpVerify} className="space-y-3">
              <p className="text-sm text-gray-600">OTP가 활성화된 계정입니다. Authenticator 앱의 6자리 코드를 입력해주세요.</p>

              <input
                className="w-full border border-gray-300 rounded px-3 py-2 tracking-widest text-center"
                placeholder="123456"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              <button className="w-full bg-purple-500 text-white rounded px-3 py-2 hover:bg-purple-600 transition disabled:opacity-50" type="submit" disabled={isOtpVerifying}>
                {isOtpVerifying ? "인증 중..." : "OTP 인증"}
              </button>

              <button type="button" className="w-full text-sm text-gray-500 hover:underline" onClick={backToLogin}>
                이메일/비밀번호 다시 입력
              </button>
            </form>
          )}
        </div>

        {/* Passkey 영역은 login step에서만 노출 */}
        {step === "login" && (
          <>
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
                <button
                  className="w-full bg-green-500 text-white rounded px-3 py-2 hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isPasskeyLoading}
                >
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
          </>
        )}
      </div>
    </div>
  );
}
