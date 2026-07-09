"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { startAuthentication } from "@simplewebauthn/browser";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { ChevronLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { TEAL, mono } from "@/lib/nav-shared";
import { PROFILE } from "@/lib/profile";

type PwLoginRes = {
  ok: boolean;
  requiresOtp?: boolean;
  userId?: number;
  error?: string;
};

const isSixDigits = (v: string) => /^[0-9]{6}$/.test(v);

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.10), 0 1.5px 0 rgba(255,255,255,1) inset",
};

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = useMemo(() => searchParams.get("next") ?? "/admin", [searchParams]);

  // "main" = passkey 우선 화면, "email" = 이메일/비밀번호 폼
  const [mode, setMode] = useState<"main" | "email">("main");
  const [passkeyState, setPasskeyState] = useState<"idle" | "waiting" | "success" | "error">("idle");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // OTP 활성화 계정용 2단계
  const [step, setStep] = useState<"login" | "otp">("login");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [otpToken, setOtpToken] = useState("");
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    try {
      const res = await apiFetch<PwLoginRes>("/admin/auth/login/password", {
        method: "POST",
        body: { email, password },
      });

      if (res.requiresOtp) {
        if (!res.userId) {
          setEmailError("OTP 인증이 필요하지만 사용자 식별에 실패했습니다.");
          return;
        }
        setPendingUserId(res.userId);
        setOtpToken("");
        setStep("otp");
        return;
      }

      router.replace(nextUrl);
    } catch (err) {
      console.error(err);
      setEmailError(getErrorMessage(err, "이메일 또는 비밀번호가 올바르지 않습니다."));
    } finally {
      setEmailLoading(false);
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
      await apiFetch("/admin/auth/otp/verify", {
        method: "POST",
        body: { userId: pendingUserId, token },
      });
      router.replace(nextUrl);
    } catch (err) {
      console.error(err);
      alert(getErrorMessage(err, "OTP 인증 실패"));
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const onPasskeyLogin = async () => {
    setPasskeyState("waiting");
    try {
      const options = await apiFetch("/admin/auth/passkey/login/options", { method: "POST" });
      const authResp: AuthenticationResponseJSON = await startAuthentication(options);

      await apiFetch("/admin/auth/passkey/login/verify", {
        method: "POST",
        body: authResp,
      });

      setPasskeyState("success");
      router.replace(nextUrl);
    } catch (err) {
      console.error("Passkey login error:", err);
      setPasskeyState("error");
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError") alert("인증이 취소되었습니다.");
      else if (name === "NotSupportedError") alert("이 브라우저는 Passkey를 지원하지 않습니다.");
      else alert(getErrorMessage(err, "Passkey 로그인 중 오류가 발생했습니다."));
      setPasskeyState("idle");
    }
  };

  const backToLogin = () => {
    setStep("login");
    setPendingUserId(null);
    setOtpToken("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 30%, rgba(35,198,169,0.10) 0%, #f0f0ec 60%)" }}
    >
      {/* back */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        style={mono}
      >
        <ChevronLeft size={14} /> 사이트로
      </Link>

      <div className="w-full max-w-sm rounded-3xl p-8" style={glassCard}>
        {/* logo */}
        <div className="text-center mb-8">
          <p className="text-2xl font-light text-foreground mb-1">
            {PROFILE.name}
            <span style={{ color: TEAL }}>.</span>
          </p>
          <p className="text-xs text-muted-foreground" style={mono}>
            관리자 로그인
          </p>
        </div>

        {/* ── OTP step ── */}
        {step === "otp" && (
          <form onSubmit={onOtpVerify} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              OTP가 활성화된 계정입니다. Authenticator 앱의 6자리 코드를 입력해주세요.
            </p>
            <input
              className="w-full rounded-xl border border-border px-4 py-2.5 text-center text-sm tracking-widest text-foreground focus:outline-none focus:border-[#23c6a9] transition-colors"
              style={{ background: "rgba(0,0,0,0.03)" }}
              placeholder="123456"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <button
              type="submit"
              disabled={isOtpVerifying}
              className="w-full py-3 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: TEAL }}
            >
              {isOtpVerifying ? "인증 중..." : "OTP 인증"}
            </button>
            <button
              type="button"
              onClick={backToLogin}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              style={mono}
            >
              ← 이메일/비밀번호 다시 입력
            </button>
          </form>
        )}

        {/* ── passkey-first main ── */}
        {step === "login" && mode === "main" && (
          <div className="space-y-3">
            <button
              onClick={onPasskeyLogin}
              disabled={passkeyState === "waiting" || passkeyState === "success"}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-medium text-sm transition-all duration-200"
              style={{
                background:
                  passkeyState === "success"
                    ? "rgba(35,198,169,0.15)"
                    : passkeyState === "waiting"
                      ? "rgba(0,0,0,0.04)"
                      : TEAL,
                color: passkeyState === "idle" ? "#fff" : passkeyState === "success" ? TEAL : "var(--muted-foreground)",
                border:
                  passkeyState !== "idle" ? `1px solid ${passkeyState === "success" ? TEAL : "var(--border)"}` : "none",
              }}
            >
              {passkeyState === "idle" && (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <ellipse cx="12" cy="9" rx="4" ry="5" />
                    <path d="M3 20c0-4 4-7 9-7s9 3 9 7" opacity=".4" />
                    <path d="M15 8.5a3 3 0 0 0 4 0" />
                    <path d="M19 6V4" />
                    <path d="M21 8h2" />
                    <path d="M19 10l1.5 1.5" />
                  </svg>
                  Passkey로 로그인
                </>
              )}
              {passkeyState === "waiting" && (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${TEAL} transparent transparent transparent` }}
                  />
                  <span>인증 대기 중…</span>
                </>
              )}
              {passkeyState === "success" && (
                <>
                  <CheckCircle size={16} />
                  <span>인증 완료</span>
                </>
              )}
            </button>

            {passkeyState === "idle" && (
              <>
                <p className="text-center text-[10px] text-muted-foreground" style={mono}>
                  지문·Face ID·보안 키로 빠르게 로그인
                </p>
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span className="text-[10px] text-muted-foreground" style={mono}>
                    또는
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>
                <button
                  onClick={() => setMode("email")}
                  className="w-full py-3 rounded-2xl text-sm text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30 transition-all"
                >
                  이메일로 로그인
                </button>
              </>
            )}
          </div>
        )}

        {/* ── email/password form ── */}
        {step === "login" && mode === "email" && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block" style={mono}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                autoComplete="username"
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#23c6a9] transition-colors"
                style={{ background: "rgba(0,0,0,0.03)" }}
              />
            </div>

            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block" style={mono}>
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEmailError("");
                  }}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#23c6a9] transition-colors"
                  style={{ background: "rgba(0,0,0,0.03)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {emailError && (
              <div
                className="flex items-center gap-2 text-xs text-rose-500 rounded-xl px-3 py-2"
                style={{ background: "rgba(239,68,68,0.08)" }}
              >
                <XCircle size={13} /> {emailError}
              </div>
            )}

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90 mt-1 disabled:opacity-50"
              style={{ background: TEAL }}
            >
              {emailLoading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "rgba(255,255,255,0.5) transparent transparent transparent" }}
                  />
                  확인 중…
                </>
              ) : (
                "로그인"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("main");
                setEmailError("");
              }}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              style={mono}
            >
              ← Passkey로 로그인
            </button>
          </form>
        )}
      </div>

      {/* subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.4,
          zIndex: -1,
        }}
      />
    </div>
  );
}
