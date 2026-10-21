"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/auth-context";

export type AppRole = "parent" | "tutor" | "admin";

interface RequireRoleProps {
  roles: AppRole[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export function RequireRole({
  roles,
  children,
  fallbackPath = "/403",
}: RequireRoleProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const resolvedRoles: AppRole[] = (() => {
    if (!user) return [];
    const out: AppRole[] = [];
    const u = user as any;
    if (Array.isArray(u.roles) && u.roles.includes("admin")) out.push("admin");
    if (u.tutorId) out.push("tutor");
    if (u.userId && !u.tutorId && !out.includes("admin")) out.push("parent");
    return out;
  })();

  const allowed = roles.some((r) => resolvedRoles.includes(r));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!allowed) {
      router.replace(fallbackPath);
    }
  }, [isLoading, isAuthenticated, allowed, router, fallbackPath]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#0096D6]/20 border-t-[#0096D6]" />
      </div>
    );
  }

  if (!isAuthenticated || !allowed) return null;
  return <>{children}</>;
}
