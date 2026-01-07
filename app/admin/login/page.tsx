"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

type Step = "PASSWORD" | "OTP";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin";

  const [step, setStep] = useState<Step>("PASSWORD");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // 비번 로그인 후 OTP가 필요할 때 서버가 식별할 수 있도록 userId 유지
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  // ✅ SSR/CSR mismatch 방지: canPasskey는 mount 후에만 계산
  const [canPasskey, setCanPasskey] = useState(false);
  useEffect(() => {
    setCanPasskey(!!window.PublicKeyCredential);
  }, []);

  async function handlePasskeyLogin() {
    setLoading(true);
    try {
      if (!email) throw new Error("이메일을 입력해줘");

      // 1) 서버에서 authentication options 받기
      const optRes = await fetch("/api/auth/passkey/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const optJson = await optRes.json();
      if (!optRes.ok) throw new Error(optJson?.error ?? "Passkey options 실패");

      // 2) 브라우저 WebAuthn 시작
      const assertion = await startAuthentication(optJson);

      // 3) 서버 verify (성공 시 서버가 JWT 쿠키 발급)
      const verRes = await fetch("/api/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });

      const verJson = await verRes.json();
      if (!verRes.ok) throw new Error(verJson?.error ?? "Passkey verify 실패");

      router.replace(nextPath);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Passkey 로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin() {
    setLoading(true);
    try {
      if (!email || !password) throw new Error("이메일 혹은 비밀번호가 입력되지 않았어요.");

      // 기대 응답:
      // - { ok: true }                            -> 로그인 완료 (JWT 쿠키 발급)
      // - { ok: false, requiresOtp: true, userId } -> OTP 단계로
      const res = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "비밀번호 로그인 실패");

      if (json?.requiresOtp && json?.userId) {
        setPendingUserId(json.userId);
        setStep("OTP");
        setPassword(""); // 보안/UX: 비밀번호 입력값은 지워두기
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "비밀번호 로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify() {
    setLoading(true);
    try {
      if (!pendingUserId) throw new Error("OTP 로그인 대상이 아니에요.");
      if (otp.length !== 6) throw new Error("OTP 6자리를 입력해주세요.");

      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId, token: otp }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "OTP 검증 실패");

      // ✅ 성공 시 서버가 JWT 쿠키 발급
      router.replace(nextPath);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "OTP 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">관리자 로그인</h1>
        <p className="text-sm text-gray-500 mt-1">Passkey / Password / OTP</p>

        <div className="mt-6 space-y-3">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || step === "OTP"} // OTP 단계에서는 이메일 변경 막기
              autoComplete="username"
            />
          </div>

          {/* PASSWORD */}
          {step !== "OTP" && (
            <div>
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="mt-1 w-full rounded-xl border px-3 py-2 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" />
            </div>
          )}

          {/* OTP */}
          {step === "OTP" && (
            <div>
              <label className="text-sm font-medium">OTP (6 digits)</label>
              <input inputMode="numeric" className="mt-1 w-full rounded-xl border px-3 py-2 outline-none" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} disabled={loading} autoComplete="one-time-code" />
              <p className="text-xs text-gray-500 mt-1">Google Authenticator / 2FA code</p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="pt-2 space-y-2">
            {step !== "OTP" && (
              <>
                <button className="w-full rounded-xl border px-3 py-2 disabled:opacity-50" onClick={handlePasswordLogin} disabled={loading}>
                  {loading ? "..." : "Login with Password"}
                </button>

                <button className="w-full rounded-xl border px-3 py-2 disabled:opacity-50" onClick={handlePasskeyLogin} disabled={loading || !canPasskey} title={!canPasskey ? "이 브라우저는 Passkey를 지원하지 않을 수 있어" : ""}>
                  {loading ? "..." : "Login with Passkey"}
                </button>
              </>
            )}

            {step === "OTP" && (
              <>
                <button className="w-full rounded-xl border px-3 py-2 disabled:opacity-50" onClick={handleOtpVerify} disabled={loading || otp.length !== 6}>
                  {loading ? "..." : "Verify OTP"}
                </button>

                <button
                  className="w-full rounded-xl border px-3 py-2 disabled:opacity-50"
                  onClick={() => {
                    setStep("PASSWORD");
                    setOtp("");
                    setPendingUserId(null);
                  }}
                  disabled={loading}
                >
                  Back
                </button>
              </>
            )}
          </div>

          {/* UX 작은 안내 */}
          {step !== "OTP" && <p className="text-xs text-gray-500 pt-2">Passkey는 브라우저/OS 환경에 따라 비활성화될 수 있어요.</p>}
        </div>
      </div>
    </div>
  );
}
