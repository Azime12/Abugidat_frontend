"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { configService } from "@/services/api/config";
import { Lock, Loader2, MapPin, Clock, Phone, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { RefundRequestModal } from "@/components/tutors/RefundRequestModal";

export default function TutorOpenRequestsPage() {
  const t = useTranslations("Kulf");
  const tc = useTranslations("Common");
  const [unlockTarget, setUnlockTarget] = useState<any>(null);
  const [unlockedContact, setUnlockedContact] = useState<any>(null);
  const [refundTarget, setRefundTarget] = useState<{ id: string } | null>(null);
  const qc = useQueryClient();

  const { data: balanceData } = useQuery({
    queryKey: ["kulf", "balance"],
    queryFn: async () => (await tutorDashboardService.kulfBalance()).data,
  });

  const { data: publicConfig } = useQuery({
    queryKey: ["public", "config"],
    queryFn: configService.getPublicConfig,
    staleTime: 60_000,
  });
  const unlockCost = Number(publicConfig?.kulf_unlock_cost ?? 1);

  const { data, isLoading } = useQuery({
    queryKey: ["tutor", "open-requests"],
    queryFn: async () => (await tutorDashboardService.openRequests()).data,
  });

  const { data: unlocksData, isLoading: unlocksLoading } = useQuery({
    queryKey: ["tutor", "my-unlocks"],
    queryFn: async () =>
      (await tutorDashboardService.myUnlockedRequests()).data,
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
                  disabled={unlockMutation.isPending || balance < unlockCost || r.unlock_count >= r.max_unlocks}
                  className="w-full rounded-lg bg-[#0096D6] py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {unlockMutation.isPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("unlocking")}
                    </span>
                  ) : balance < unlockCost ? (
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

      {/* ── My Unlocked Requests (refund eligible) ── */}
      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-lg font-black text-[#2D2A32]">Unlocked requests</h2>
          <p className="text-xs text-gray-500">
            If a parent didn&apos;t reply within 48 hours, request a Kulf refund here.
          </p>
        </div>

        {unlocksLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : !unlocksData?.unlocks?.length ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              You haven&apos;t unlocked any requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {unlocksData.unlocks.map((u: any) => {
              const r = u.request;
              if (!r) return null;
              const alreadyRefunded =
                u.refund_status === "pending" || u.refund_status === "approved";
              const canRefund = u.eligible_for_no_reply_refund && !alreadyRefunded;
              return (
                <div
                  key={u.unlock_id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                          {r.grade_level}
                        </span>
                        <span className="text-sm font-bold text-[#2D2A32]">
                          {r.subjects || "General Tutoring"}
                        </span>
                        {u.refund_status === "pending" && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                            Refund pending
                          </span>
                        )}
                        {u.refund_status === "approved" && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                            Refunded
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        📍 {r.area_name || "Addis Ababa"} · Unlocked{" "}
                        {new Date(u.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRefundTarget({ id: r.id })}
                      disabled={!canRefund}
                      title={
                        !u.eligible_for_no_reply_refund
                          ? "No-reply refund becomes available after 48 hours"
                          : alreadyRefunded
                            ? "A refund request already exists"
                            : "Report a problem"
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <AlertTriangle size={13} />
                      Report a problem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
              <p className="text-xs text-gray-500">{t("balanceAfter", { from: balance, to: balance - unlockCost })}</p>
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
      {refundTarget && (
        <RefundRequestModal
          requestId={refundTarget.id}
          onClose={() => setRefundTarget(null)}
          onSubmitted={() => {
            setRefundTarget(null);
            qc.invalidateQueries({ queryKey: ["tutor", "my-unlocks"] });
            qc.invalidateQueries({ queryKey: ["kulf", "balance"] });
            qc.invalidateQueries({ queryKey: ["kulf", "refunds"] });
          }}
        />
      )}    </div>
  );
}
