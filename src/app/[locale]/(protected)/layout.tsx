"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FFF8F0]">
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
