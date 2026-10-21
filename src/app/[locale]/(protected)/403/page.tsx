"use client";

import { Link } from "@/i18n/routing";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function AccessDeniedPage() {
  const { user } = useAuth();
  const u = user as any;

  // Pick target based on roles — all paths are LOCALE-FREE.
  // Link from @/i18n/routing adds the /en or /am automatically.
  let backHref: "/admin" | "/tutor/dashboard" | "/dashboard" = "/dashboard";
  if (u?.roles?.includes("admin")) backHref = "/admin";
  else if (u?.tutorId || u?.roles?.includes("tutor")) backHref = "/tutor/dashboard";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="mt-6 text-2xl font-black text-[#2D2A32]">403</h1>
        <p className="mt-1 text-sm font-bold text-red-600">Access Denied</p>
        <p className="mt-3 text-sm text-gray-600">
          You don't have permission to view this page. Please contact your
          administrator if you believe this is a mistake.
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-block rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white hover:bg-[#007FB8]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
