"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";

/**
 * Mini App entry page.
 *
 * Telegram opens this URL when the user taps:
 *   https://t.me/<bot>/<miniapp>?startapp=<payload>
 *
 * The <payload> is available at `window.Telegram.WebApp.initDataUnsafe.start_param`.
 * We parse it and route to the right place:
 *   - "admin_<entity>_<id>" → /miniapp/admin/<entity>/<id>
 *   - "job_<id>"            → /tutor/jobs/<id>  (tutor applying to a specific job)
 *   - anything else         → /dashboard        (fallback)
 */
export default function MiniAppEntryPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"init" | "parsing" | "not-in-telegram">("init");

  useEffect(() => {
    // Give Telegram WebApp a tick to populate initDataUnsafe
    const timer = setTimeout(() => {
      const tg = (window as any)?.Telegram?.WebApp;
      const startParam: string | undefined = tg?.initDataUnsafe?.start_param;

      setStatus("parsing");

      if (!startParam) {
        // Not opened from a deep link — send to main dashboard
        router.replace("/dashboard");
        return;
      }

      // Payload 1: admin deep link (e.g. admin_tutor_42)
      const adminMatch = startParam.match(/^admin_([a-z]+)_(.+)$/);
      if (adminMatch) {
        const [, entity, id] = adminMatch;
        router.replace(`/miniapp/admin/${entity}/${id}` as any);
        return;
      }

      // Payload 2: tutor sees a specific job (e.g. job_12 or apply_job_12)
      const jobMatch = startParam.match(/^(?:job|apply_job)_(\d+)$/i);
      if (jobMatch) {
        router.replace(`/tutor/jobs/${jobMatch[1]}` as any);
        return;
      }

      // Payload 3: bare job id
      if (/^\d+$/.test(startParam)) {
        router.replace(`/tutor/jobs/${startParam}` as any);
        return;
      }

      // Fallback
      router.replace("/dashboard");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // If we somehow got here without Telegram after 3 seconds, show a hint
  useEffect(() => {
    const check = setTimeout(() => {
      const tg = (window as any)?.Telegram?.WebApp;
      if (!tg || !tg.initData) {
        setStatus("not-in-telegram");
      }
    }, 3000);
    return () => clearTimeout(check);
  }, []);

  if (status === "not-in-telegram") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-6">
        <div className="max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-4 text-lg font-bold text-[#2D2A32]">
            Open inside Telegram
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This page is a Telegram Mini App. Please open it from{" "}
            <a href="https://t.me/Abugidatutor_bot" className="font-bold text-[#0096D6] hover:underline">
              @Abugidatutor_bot
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F4F8]">
          <Sparkles className="h-7 w-7 text-[#0096D6]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Loader2 className="h-4 w-4 animate-spin text-[#0096D6]" />
          Opening Mini App...
        </div>
      </div>
    </div>
  );
}
