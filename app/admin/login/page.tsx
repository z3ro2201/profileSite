import { Suspense } from "react";
import LoginClient from "@/layout/LoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
