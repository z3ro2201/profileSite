"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type MeResponse = {
  id: number;
  email: string;
  name: string | null;
};

const ProfileLayout = ({ users }: { users: MeResponse }) => {
  const [userName, setUserName] = useState<string>(users.name ?? "");
  const [userPassword, setUserPassword] = useState<string>("");
  const [newPassword1, setNewPassword1] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");
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
  return (
    <div>
      <div>
        이름: <input type="text" className="p-2 border border-gray-800/20" value={userName} onChange={(event) => setUserName(event.target.value)} />
        <button type="button" className="p-2 border border-gray-800/20 cursor-pointer" onClick={() => submitUpdateName()}>
          이름변경
        </button>
      </div>
      <div>이메일: {users.email}</div>
      <div>
        현재비밀번호 : <input type="password" className="p-2 border border-gray-800/20" value={userPassword} onChange={(event) => setUserPassword(event.target.value)} />
      </div>
      <div>
        변경할비밀번호 : <input type="password" className="p-2 border border-gray-800/20" value={newPassword1} onChange={(event) => setNewPassword1(event.target.value)} />
      </div>
      <div>
        변경할비밀번호(확인) : <input type="password" className="p-2 border border-gray-800/20" value={newPassword2} onChange={(event) => setNewPassword2(event.target.value)} />
      </div>
      <div>
        <button type="button" className="p-2 border border-gray-800/20 cursor-pointer" onClick={() => submitUpdatePassword()}>
          비밀번호 변경
        </button>
      </div>
    </div>
  );
};
export default ProfileLayout;
