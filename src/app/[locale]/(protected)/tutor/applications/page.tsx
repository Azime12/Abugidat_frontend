"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { Briefcase, MapPin, BookOpen, Banknote, Calendar } from "lucide-react";

// ─── Ethiopian currency formatter ────────────────────────────────
function formatBirr(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ብር";
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
  return `${formatted} ብር`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  shortlisted: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-700",
};

export default function TutorApplicationsPage() {
  const [filter, setFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tutor", "applications"],
    queryFn: async () => (await tutorDashboardService.listApplications()).data,
  });

  const applications = data?.applications ?? [];

  const filtered = applications.filter((a: any) => {
    if (!filter) return true;
    return a.status === filter;
  });

  const stats = {
    pending: applications.filter((a: any) => a.status === "pending").length,
    shortlisted: applications.filter((a: any) => a.status === "shortlisted").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">
          My Applications
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          {isLoading ? "Loading..." : `${applications.length} total`}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-black text-amber-600">{stats.pending}</p>
          <p className="text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
            Pending
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-black text-blue-600">{stats.shortlisted}</p>
          <p className="text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
            Shortlisted
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-black text-red-600">{stats.rejected}</p>
          <p className="text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
            Rejected
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="-mx-3 sm:mx-0 overflow-x-auto">
        <div className="flex gap-2 px-3 sm:px-0 sm:flex-wrap">
          {["", "pending", "shortlisted", "rejected"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-3 sm:px-4 py-1.5 text-xs font-bold transition ${
                filter === s
                  ? "bg-[#0096D6] text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 sm:p-12 text-center">
          <h3 className="text-base sm:text-lg font-bold text-[#2D2A32]">
            {filter ? `No ${filter} applications` : "No applications yet"}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            {filter ? "Try a different filter." : "Browse jobs and apply to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a: any) => (
            <div
              key={a.id}
              className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#E8F4F8] px-2 sm:px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                  Job #{a.job_id}
                </span>
                <span
                  className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLES[a.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {a.status}
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>

              {a.Job ? (
                <div className="mt-3">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{a.Job.subjects}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {a.Job.student_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {a.Job.location}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#0096D6]">
                      <Banknote className="h-3.5 w-3.5 shrink-0" />
                      {formatBirr(a.Job.hourly_salary)} / ሰዓት
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs sm:text-sm text-gray-500">
                  Job details unavailable
                </p>
              )}

              {a.rejection_reason && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 sm:p-3 text-xs text-red-700">
                  <p className="font-bold">Rejection reason:</p>
                  <p className="mt-0.5 break-words">{a.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
