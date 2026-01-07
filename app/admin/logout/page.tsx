"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.replace("/admin/login");
    });
  }, [router]);

  return null;
}
