"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { Lock, Loader2, MapPin, Clock, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function TutorOpenRequestsPage() {
  const t = useTranslations("Kulf");
  const tc = useTranslations("Common");
  const [unlockTarget, setUnlockTarget] = useState<any>(null);
  const [unlockedContact, setUnlockedContact] = useState<any>(null);
  const qc = useQueryClient();

  const { data: balanceData } = useQuery({
    queryKey: ["kulf", "balance"],
    queryFn: async () => (await tutorDashboardService.kulfBalance()).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tutor", "open-requests"],
    queryFn: async () => (await tutorDashboardService.openRequests()).data,
  });

  const unlockMutation = useMutation({
    mutationFn: (requestId: string) => tutorDashboardService.unlockRequest(requestId),
    onSuccess: (res) => {
      setUnlockedContact(res.data);
      qc.invalidateQueries({ queryKey: ["tutor", "open-requests"] });
      qc.invalidateQueries({ queryKey: ["kulf", "balance"] });
      toast.success(t("unlockSuccess"));
    },
    onError: (err) => {
      const data = (err as any)?.response?.data;
      if (data?.message?.includes("insufficient") || data?.message?.includes("no_kulf")) {
        toast.error(t("notEnoughKulf"));
      } else {
        toast.error(getApiErrorMessage(err, t("unlockFailed")));
      }
    },
  });

  const balance = balanceData?.balance ?? 0;
  const requests = data?.requests ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">{t("openRequests")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("openRequestsSubtitle", { balance })}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <h3 className="text-lg font-bold text-[#2D2A32]">{t("noOpenRequests")}</h3>
          <p className="mt-2 text-sm text-gray-500">{t("noOpenRequestsDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((r: any) => (
            <div key={r.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#0096D6] hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0096D6]">
                    {r.grade_level}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[#2D2A32]">
                    {r.subjects || "General Tutoring"}
                  </h3>
                </div>
                {r.unlock_count >= r.max_unlocks && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                    {t("full")}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {r.area_name || "Addis Ababa"}
                </p>
                {r.preferred_time && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {r.preferred_time}
                  </p>
                )}
                {r.note && (
                  <p className="text-xs text-gray-500 line-clamp-2">{r.note}</p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{r.unlock_count || 0} {t("tutorsUnlocked")}</span>
                <span>{r.max_unlocks - (r.unlock_count || 0)} {t("slotsLeft")}</span>
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => setUnlockTarget(r)}
                  disabled={unlockMutation.isPending || balance < 1 || r.unlock_count >= r.max_unlocks}
                  className="w-full rounded-lg bg-[#0096D6] py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {unlockMutation.isPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("unlocking")}
                    </span>
                  ) : balance < 1 ? (
                    t("notEnoughKulf")
                  ) : r.unlock_count >= r.max_unlocks ? (
                    t("allSlotsTaken")
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Lock size={14} />
                      {t("unlock")}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unlock confirmation */}
      {unlockTarget && (
        <ConfirmationModal
          isOpen
          onClose={() => setUnlockTarget(null)}
          onConfirm={() => {
            unlockMutation.mutate(unlockTarget.id);
            setUnlockTarget(null);
          }}
          title={t("unlockConfirmTitle")}
          message={
            <div className="space-y-2">
              <p>{t("unlockConfirmMsg")}</p>
              <p className="text-xs text-gray-500">{t("balanceAfter", { from: balance, to: balance - 1 })}</p>
              <p className="text-xs text-gray-500">{t("refundHint")}</p>
            </div>
          }
          variant="info"
          isLoading={unlockMutation.isPending}
          confirmText={t("unlock")}
        />
      )}

      {/* Success reveal */}
      {unlockedContact && (
        <ConfirmationModal
          isOpen
          onClose={() => setUnlockedContact(null)}
          onConfirm={() => setUnlockedContact(null)}
          title={t("unlockSuccess")}
          message={
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-bold text-[#2D2A32]">
                <Phone className="h-4 w-4 text-[#0096D6]" />
                {unlockedContact.parent_name}
              </p>
              <p className="font-mono text-lg font-black text-[#0096D6]">
                {unlockedContact.parent_phone}
              </p>
              {unlockedContact.preferred_time && (
                <p className="text-xs text-gray-500">{t("preferredTime", { time: unlockedContact.preferred_time })}</p>
              )}
              <p className="text-xs text-gray-500">
                {t("callWithin24h")}
              </p>
            </div>
          }
          variant="success"
          confirmText={tc("gotIt")}
        />
      )}
    </div>
  );
}
