import ProfileLayout from "@/layout/admin/users/me/profileLayout";
import { apiFetch } from "@/lib/apiFetch";

type MeResponse = {
  id: number;
  email: string;
  name: string | null;
};

const ProfilePage = async () => {
  const res = await apiFetch<MeResponse>("/api/admin/users/me", { cache: "no-store" });

  return <ProfileLayout users={res} />;
};

export default ProfilePage;
