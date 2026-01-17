"use client";

import React from "react";

import AdminUiProvider from "@/layout/admin/AdminUiProvider";
import AdminMain from "@/layout/admin/mainLayout";

export default function AdminAuthedShell({ user, children }: { user: { id: string; email?: string; name?: string | null }; children: React.ReactNode }) {
  return (
    <AdminUiProvider>
      <AdminMain isLoggedIn={true} user={user}>
        {children}
      </AdminMain>
    </AdminUiProvider>
  );
}
