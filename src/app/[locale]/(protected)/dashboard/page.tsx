"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { parentRequestService } from "@/services/api/parent-requests";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/contexts/auth-context";
import {
  Plus, FileText, MapPin, Clock, Lock, AlertCircle,
} from "lucide-react";

export default function ParentDashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const u = user as any;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["parent", "requests"],
    queryFn: async () => (await parentRequestService.mine()).data,
  });

  const requests = data?.requests ?? [];
  const openCount = requests.filter((r: any) => r.status === "open").length;
  const totalUnlocks = requests.reduce((sum: number, r: any) => sum + (r.unlock_count || 0), 0);

  const statusBadge = (status: string) => {
    if (status === "closed") return { label: t("closed"), class: "bg-gray-100 text-gray-700 border-gray-200" };
    if (status === "expired") return { label: t("expired"), class: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: t("open"), class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A32]">
              {t("welcome", { name: u?.firstName || u?.first_name || "Parent" })}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("postRequest")}
            </p>
          </div>
          <Link
            href="/dashboard/requests/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0096D6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#007FB8]"
          >
            <Plus size={16} />
            {t("newRequest")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-[#2D2A32]">{requests.length}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("requests")}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{openCount}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("open")}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-[#0096D6]">{totalUnlocks}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("tutorUnlocks")}
            </p>
          </div>
        </div>

        {/* Request list */}
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            {t("myRequests")}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
              <p className="mt-3 text-sm font-bold text-red-700">
                {t("failedToLoad")}
              </p>
              <p className="mt-1 text-xs text-red-600">
                {(error as any)?.response?.data?.message || ""}
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 sm:p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F4F8]">
                <FileText className="h-7 w-7 text-[#0096D6]" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#2D2A32]">
                {t("noRequests")}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {t("noRequestsDesc")}
              </p>
              <Link
                href="/dashboard/requests/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#007FB8]"
              >
                <Plus size={16} />
                {t("createFirstRequest")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r: any) => {
                const badge = statusBadge(r.status);
                return (
                  <Link
                    key={r.id}
                    href={`/dashboard/requests/${r.id}`}
                    className="block rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 transition hover:border-[#0096D6] hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                            {r.grade_level}
                          </span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.class}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-[#2D2A32]">
                          {r.subjects || "General Tutoring"}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {r.area_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {r.area_name}
                            </span>
                          )}
                          {r.preferred_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {r.preferred_time}
                            </span>
                          )}
                        </div>
                        {r.note && (
                          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                            {r.note}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1.5 rounded-lg bg-[#E8F4F8] px-3 py-1.5">
                          <Lock className="h-3.5 w-3.5 text-[#0096D6]" />
                          <span className="text-sm font-black text-[#0096D6]">
                            {r.unlock_count || 0}
                          </span>
                          <span className="text-xs font-bold text-[#006A9B]">
                            / {r.max_unlocks || 7}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-gray-400">{t("tutorsUnlocked")}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-[10px] text-gray-400">
                      {t("posted")}{" "}
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
