"use client";

import { useEffect, use } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function AdminDeepLinkLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Send through login, then resume the deep link
      const fullSlug = (slug || []).join("/");
      router.replace(`/login?redirect=/miniapp/admin/${fullSlug}` as any);
      return;
    }

    const u = user as any;
    if (!u?.roles?.includes("admin")) {
      router.replace("/403");
      return;
    }

    const [entity, id] = slug || [];
    if (!entity || !id) {
      router.replace("/admin");
      return;
    }

    // Map entity to admin route
    const allowed: Record<string, string> = {
      tutor: `/admin/tutors/${id}`,
      job: `/admin/jobs/${id}`,
      application: `/admin/applications/${id}`,
      match: `/admin/matches/${id}`,
    };
    const target = allowed[entity];
    if (!target) {
      setError(`Unknown admin entity: ${entity}`);
      return;
    }

    router.replace(target as any);
  }, [isLoading, isAuthenticated, user, router, slug]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-6">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-lg font-bold text-gray-800">{error}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Please open the record from the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
      <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-md">
        <Loader2 className="h-5 w-5 animate-spin text-[#0096D6]" />
        <span className="text-sm font-semibold text-gray-700">
          Loading admin record...
        </span>
      </div>
    </div>
  );
}
