"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { startRegistration } from "@simplewebauthn/browser";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

type MeResponse = {
  id?: number;
  userId?: number;
  email: string;
  name: string | null;
};

type PasskeyCredential = {
  id: number;
  name: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

const isSixDigits = (v: string) => /^[0-9]{6}$/.test(v);

const ProfileLayout = ({ users }: { users: MeResponse }) => {
  const [userName, setUserName] = useState<string>(users.name ?? "");
  const [userPassword, setUserPassword] = useState<string>("");
  const [newPassword1, setNewPassword1] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");

  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // ✅ OTP
  const [otpQrDataUrl, setOtpQrDataUrl] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string>("");
  const [isOtpSettingUp, setIsOtpSettingUp] = useState(false);
  const [isOtpConfirming, setIsOtpConfirming] = useState(false);

  // ✅ OTP 해제(삭제)
  const [isOtpDisabling, setIsOtpDisabling] = useState(false);

  // ✅ Recovery codes (confirm 응답으로 1회 표시)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  // (현재 구조 유지) userId는 둘 중 하나
  const uid = users.id ?? users.userId ?? null;

  const submitUpdateName = async () => {
    if (!userName || userName.length < 2) {
      alert("이름이 입력되지 않았거나 2자리 미만입니다.");
      return false;
    }

    try {
      const res = await apiFetch("/admin/users/me", {
        method: "PATCH",
        body: { name: userName },
        cache: "no-store",
      });
      if (!res.ok) {
        return alert("이름 변경 실패");
      }
      alert("변경 완료");
      setUserPassword("");
      setNewPassword1("");
      setNewPassword2("");
    } catch (error) {
      console.error(error);
    }
  };

  const submitUpdatePassword = async () => {
    if (!userPassword || userPassword.length < 4) {
      alert("현재비밀번호가 입력되지 않았거나 4자리 미만입니다.");
      return false;
    }

    if (!newPassword1 || newPassword1.length < 8) {
      alert("변경할 비밀번호가 입력되지 않았거나 8자리 미만입니다.");
      return false;
    }
    if (!newPassword2 || newPassword2.length < 8) {
      alert("변경할 비밀번호(확인)가 입력되지 않았거나 8자리 미만입니다.");
      return false;
    }

    if (newPassword1 !== newPassword2) {
      alert("변경할 비밀번호와 변경할 비밀번호(확인)이 서로 다릅니다.");
      return false;
    }

    try {
      const res = await apiFetch("/admin/users/me/password", {
        method: "PATCH",
        body: {
          currentPassword: userPassword,
          newPassword: newPassword1,
          newPasswordConfirm: newPassword2,
        },
        cache: "no-store",
      });
      if (!res.ok) {
        alert("비밀번호 변경 실패");
      }
      alert("변경 완료");
    } catch (error) {
      console.error(error);
    }
  };

  // Passkey 목록
  const loadPasskeys = async () => {
    setIsLoadingPasskeys(true);
    try {
      const data = await apiFetch<{ passkeys: PasskeyCredential[] }>("/admin/users/me/passkeys", {
        cache: "no-store",
      });
      setPasskeys(data.passkeys || []);
    } catch (error) {
      console.error("Failed to load passkeys:", error);
    } finally {
      setIsLoadingPasskeys(false);
    }
  };

  useEffect(() => {
    loadPasskeys();
  }, []);

  // Passkey 등록
  const registerPasskey = async () => {
    setIsRegistering(true);
    try {
      const options = await apiFetch("/admin/auth/passkey/register/options", {
        method: "POST",
        body: { userId: users.id }, // 네 원래 코드 유지
      });

      const attResp: RegistrationResponseJSON = await startRegistration(options);

      const verifyRes = await apiFetch("/admin/auth/passkey/register/verify", {
        method: "POST",
        body: attResp,
      });

      if (verifyRes.ok) {
        alert("Passkey가 등록되었습니다!");
        loadPasskeys();
      } else {
        alert("Passkey 등록에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Passkey registration error:", error);

      if (error?.name === "NotAllowedError") {
        alert("Passkey 등록이 취소되었습니다.");
      } else if (error?.name === "NotSupportedError") {
        alert("이 브라우저는 Passkey를 지원하지 않습니다.");
      } else {
        alert(`Passkey 등록 중 오류가 발생했습니다: ${error?.message ?? String(error)}`);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // Passkey 삭제
  const deletePasskey = async (passkeyId: number) => {
    if (!confirm("이 Passkey를 삭제하시겠습니까?")) return;

    try {
      await apiFetch(`/admin/users/me/passkeys/${passkeyId}`, {
        method: "DELETE",
      });
      alert("Passkey가 삭제되었습니다.");
      loadPasskeys();
    } catch (error) {
      console.error("Failed to delete passkey:", error);
      alert("Passkey 삭제에 실패했습니다.");
    }
  };

  // ✅ OTP setup (QR 생성)
  const setupOtp = async () => {
    if (!uid) {
      alert("사용자 ID를 확인할 수 없습니다. 다시 로그인 해주세요.");
      return;
    }

    setIsOtpSettingUp(true);
    try {
      const data = await apiFetch<{ qrDataUrl: string }>("/admin/auth/otp/setup", {
        method: "POST",
        body: { userId: uid },
        cache: "no-store",
      });

      setOtpQrDataUrl(data.qrDataUrl);
      setOtpToken("");
      setRecoveryCodes(null);
      alert("QR을 OTP 앱에 등록한 뒤 6자리 코드를 입력해주세요.");
    } catch (error) {
      console.error(error);
      alert("OTP QR 생성에 실패했습니다.");
    } finally {
      setIsOtpSettingUp(false);
    }
  };

  // ✅ OTP confirm (활성화 + 복구코드 발급)
  const confirmOtp = async () => {
    if (!uid) {
      alert("사용자 ID를 확인할 수 없습니다. 다시 로그인 해주세요.");
      return;
    }

    const t = otpToken.trim();
    if (!isSixDigits(t)) {
      alert("OTP 6자리 숫자를 입력해주세요.");
      return;
    }

    setIsOtpConfirming(true);
    try {
      const res = await apiFetch<{ ok: boolean; alreadyEnabled?: boolean; recoveryCodes?: string[] }>("/admin/auth/otp/confirm", {
        method: "POST",
        body: { userId: uid, token: t },
        cache: "no-store",
      });

      if (res.ok) {
        if (res.recoveryCodes?.length) setRecoveryCodes(res.recoveryCodes);
        alert(res.alreadyEnabled ? "이미 OTP가 활성화되어 있습니다." : "OTP가 활성화되었습니다!");
        setOtpQrDataUrl(null);
        setOtpToken("");
      } else {
        alert("OTP 확인에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("OTP 확인 중 오류가 발생했습니다.");
    } finally {
      setIsOtpConfirming(false);
    }
  };

  // ✅ OTP 해제(삭제)
  const disableOtp = async () => {
    if (!uid) {
      alert("사용자 ID를 확인할 수 없습니다. 다시 로그인 해주세요.");
      return;
    }

    const ok = confirm("OTP를 해제(삭제)하시겠습니까?\n\n- OTP 설정이 삭제됩니다.\n- 비상 복구 코드도 모두 폐기됩니다.");
    if (!ok) return;

    setIsOtpDisabling(true);
    try {
      const res = await apiFetch<{ ok: boolean }>("/admin/auth/otp/disable", {
        method: "POST",
        body: { userId: uid },
        cache: "no-store",
      });

      if (res.ok) {
        alert("OTP가 해제(삭제)되었습니다.");
        setOtpQrDataUrl(null);
        setOtpToken("");
        setRecoveryCodes(null);
      } else {
        alert("OTP 해제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("OTP 해제 중 오류가 발생했습니다.");
    } finally {
      setIsOtpDisabling(false);
    }
  };

  const copyRecoveryCodes = async () => {
    if (!recoveryCodes?.length) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
      alert("복구코드를 클립보드에 복사했습니다.");
    } catch {
      alert("복사에 실패했습니다. 직접 드래그해서 복사해주세요.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* 이름 변경 */}
      <div className="border border-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">프로필 정보</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="w-20">이름:</label>
            <input type="text" className="flex-1 p-2 border border-gray-300 rounded" value={userName} onChange={(event) => setUserName(event.target.value)} />
            <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => submitUpdateName()}>
              변경
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-20">이메일:</label>
            <span className="text-gray-700">{users.email}</span>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="border border-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">비밀번호 변경</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="w-40">현재 비밀번호:</label>
            <input type="password" className="flex-1 p-2 border border-gray-300 rounded" value={userPassword} onChange={(event) => setUserPassword(event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-40">새 비밀번호:</label>
            <input type="password" className="flex-1 p-2 border border-gray-300 rounded" value={newPassword1} onChange={(event) => setNewPassword1(event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-40">새 비밀번호 확인:</label>
            <input type="password" className="flex-1 p-2 border border-gray-300 rounded" value={newPassword2} onChange={(event) => setNewPassword2(event.target.value)} />
          </div>
          <div className="flex justify-end">
            <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => submitUpdatePassword()}>
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>

      {/* ✅ OTP 등록 + 해제 버튼 */}
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">OTP (Google Authenticator)</h2>

          <div className="flex gap-2">
            <button type="button" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50" onClick={setupOtp} disabled={isOtpSettingUp || !uid}>
              {isOtpSettingUp ? "QR 생성 중..." : "📱 OTP 등록 시작"}
            </button>

            <button type="button" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50" onClick={disableOtp} disabled={isOtpDisabling || !uid} title="OTP 해제(삭제)">
              {isOtpDisabling ? "해제 중..." : "🗑️ OTP 해제"}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">Google Authenticator 같은 TOTP 앱에 QR을 등록한 뒤, 생성되는 6자리 코드를 입력하면 활성화됩니다. 해제하면 OTP 설정과 비상 복구 코드가 모두 삭제됩니다.</p>

        {!uid && <p className="text-sm text-red-500">사용자 ID를 확인할 수 없습니다. 다시 로그인 해주세요.</p>}

        {otpQrDataUrl && (
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <img src={otpQrDataUrl} alt="OTP QR" className="w-40 h-40 border rounded" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm">6자리 코드:</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} className="flex-1 p-2 border border-gray-300 rounded" value={otpToken} onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" />
                  <button type="button" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50" onClick={confirmOtp} disabled={isOtpConfirming}>
                    {isOtpConfirming ? "확인 중..." : "확인"}
                  </button>
                </div>

                <button
                  type="button"
                  className="text-sm text-gray-500 hover:underline"
                  onClick={() => {
                    setOtpQrDataUrl(null);
                    setOtpToken("");
                  }}
                >
                  취소(닫기)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ 복구코드 1회 표시 */}
        {recoveryCodes && recoveryCodes.length > 0 && (
          <div className="mt-4 p-3 border rounded bg-yellow-50">
            <p className="font-semibold">비상 복구 코드 (한 번만 표시)</p>
            <p className="text-sm text-gray-600 mb-2">안전한 곳에 저장하세요. 각 코드는 1회만 사용됩니다. (OTP 앱 분실 시 이 코드로 로그인 가능)</p>
            <pre className="text-sm whitespace-pre-wrap">{recoveryCodes.join("\n")}</pre>
            <div className="mt-2 flex gap-2">
              <button type="button" className="px-3 py-1 text-sm bg-gray-800 text-white rounded" onClick={copyRecoveryCodes}>
                복사
              </button>
              <button type="button" className="px-3 py-1 text-sm bg-gray-200 rounded" onClick={() => setRecoveryCodes(null)}>
                닫기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Passkey 관리 */}
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Passkey 관리</h2>
          <button type="button" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50" onClick={registerPasskey} disabled={isRegistering}>
            {isRegistering ? "등록 중..." : "🔑 새 Passkey 등록"}
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Passkey를 사용하면 비밀번호 없이 얼굴인식, 지문 또는 PIN으로 안전하게 로그인할 수 있습니다.</p>

        <div className="space-y-2">
          <button type="button" className="text-sm text-blue-500 hover:underline" onClick={loadPasskeys} disabled={isLoadingPasskeys}>
            {isLoadingPasskeys ? "불러오는 중..." : "Passkey 목록 새로고침"}
          </button>

          {passkeys.length > 0 ? (
            <div className="space-y-2">
              {passkeys.map((pk) => (
                <div key={pk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <p className="font-medium">{pk.name || "Passkey"}</p>
                    <p className="text-xs text-gray-500">
                      등록: {new Date(pk.createdAt).toLocaleDateString()}
                      {pk.lastUsedAt && ` • 마지막 사용: ${new Date(pk.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button type="button" className="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded" onClick={() => deletePasskey(pk.id)}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">등록된 Passkey가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
