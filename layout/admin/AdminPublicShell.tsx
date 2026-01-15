import React from "react";

export default function AdminPublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* 여기서 public 헤더/푸터/경고문 등 */}
      {children}
    </div>
  );
}
