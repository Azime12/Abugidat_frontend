"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";

/**
 * Q1: Old /admin/applications route now redirects to /admin/jobs.
 * Applications are managed per-job at /admin/jobs/[id]/applicants.
 * This stub preserves bookmarks and external links.
 */
export default function ApplicationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success("Browse jobs to see applications", { icon: "💼" });
    router.replace("/admin/jobs");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0096D6] border-t-transparent" />
        Redirecting to Jobs...
      </div>
    </div>
  );
}