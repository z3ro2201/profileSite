import ProfileLayout from "@/layout/admin/users/me/profileLayout";
import { apiFetch } from "@/lib/apiFetch";

type MeResponse = {
  id?: number; // optional로 변경
  userId?: number; // 추가
  email: string;
  name: string | null;
};
const ProfilePage = async () => {
  const res = await apiFetch<MeResponse>("/admin/users/me", { cache: "no-store" });

  const users = {
    id: res.userId ?? res.id ?? 0,
    email: res.email,
    name: res.name,
  };

  return <ProfileLayout users={users} />;
};

export default ProfilePage;
