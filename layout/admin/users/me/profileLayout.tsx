"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { startRegistration } from "@simplewebauthn/browser";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

type MeResponse = {
  id?: number; // optional로 변경
  userId?: number; // 추가
  email: string;
  name: string | null;
};

type PasskeyCredential = {
  id: number;
  name: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

const ProfileLayout = ({ users }: { users: MeResponse }) => {
  const [userName, setUserName] = useState<string>(users.name ?? "");
  const [userPassword, setUserPassword] = useState<string>("");
  const [newPassword1, setNewPassword1] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const submitUpdateName = async () => {
    if (!userName || userName.length < 2) {
      alert("이름이 입력되지 않았거나 2자리 미만입니다.");
      return false;
    }

    try {
      const res = await apiFetch("/admin/users/me", {
        method: "PATCH",
        body: {
          name: userName,
        },
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

  // 🆕 Passkey 목록 불러오기
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

  // 🆕 Passkey 등록
  const registerPasskey = async () => {
    setIsRegistering(true);
    try {
      // 1. 등록 옵션 가져오기
      const options = await apiFetch("/admin/auth/passkey/register/options", {
        method: "POST",
        body: { userId: users.id },
      });

      // 2. 브라우저에서 Passkey 생성
      const attResp: RegistrationResponseJSON = await startRegistration(options);

      // 3. 서버에 검증 요청
      const verifyRes = await apiFetch("/admin/auth/passkey/register/verify", {
        method: "POST",
        body: attResp,
      });

      if (verifyRes.ok) {
        alert("Passkey가 등록되었습니다!");
        loadPasskeys(); // 목록 새로고침
      } else {
        alert("Passkey 등록에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Passkey registration error:", error);

      if (error.name === "NotAllowedError") {
        alert("Passkey 등록이 취소되었습니다.");
      } else if (error.name === "NotSupportedError") {
        alert("이 브라우저는 Passkey를 지원하지 않습니다.");
      } else {
        alert(`Passkey 등록 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsRegistering(false);
    }
  };
  // const registerPasskey = async () => {
  //   setIsRegistering(true);
  //   try {
  //     console.log("Sending userId:", users.id); // 🔍 디버깅

  //     const options = await apiFetch("/admin/auth/passkey/register/options", {
  //       method: "POST",
  //       body: { userId: users.id }, // users.id가 number인지 확인
  //     });

  //     // ...
  //   } catch (error: any) {
  //     console.error("Full error:", error); // 🔍 자세한 에러 확인
  //     alert(`오류: ${error.message}`);
  //   }
  // };

  // 🆕 Passkey 삭제
  const deletePasskey = async (passkeyId: number) => {
    if (!confirm("이 Passkey를 삭제하시겠습니까?")) return;

    try {
      await apiFetch(`/admin/users/me/passkeys/${passkeyId}`, {
        method: "DELETE",
      });
      alert("Passkey가 삭제되었습니다.");
      loadPasskeys(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to delete passkey:", error);
      alert("Passkey 삭제에 실패했습니다.");
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

      {/* 🆕 Passkey 관리 */}
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
