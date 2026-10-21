"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import {
  Briefcase, MapPin, BookOpen, Banknote, Clock, CheckCircle2,
  AlertCircle, Loader2, Search, Navigation, Map, List,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { getMapLocationUrl } from "@/lib/map-utils";

const JobMap = dynamic(
  () => import("@/components/jobs/JobMap").then((m) => m.JobMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-400">
        Loading job map...
      </div>
    ),
  }
);

// ─── Ethiopian currency formatter ────────────────────────────────
function formatBirr(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ብር";
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
  return `${formatted} ብር`;
}

function formatEthNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

interface ApplyError {
  reason?: string;
  message?: string;
  current_balance?: number;
  required_threshold?: number;
  required_gender?: string;
}

export default function TutorJobsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const qc = useQueryClient();
  const [confirmApply, setConfirmApply] = useState<{ job: any } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tutor", "jobs"],
    queryFn: async () => (await tutorDashboardService.listJobs()).data,
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => tutorDashboardService.apply(jobId),
    onSuccess: () => {
      toast.success("Application submitted!");
      qc.invalidateQueries({ queryKey: ["tutor", "applications"] });
      qc.invalidateQueries({ queryKey: ["tutor", "jobs"] });
    },
    onError: (err: any) => {
      const structured: ApplyError | undefined = err?.response?.data?.error;
      if (structured?.reason) {
        switch (structured.reason) {
          case "profile_incomplete":
            toast.error("Complete your profile first. Go to Profile →");
            break;
          case "insufficient_invites":
            toast.error(`You need ${structured.required_threshold} invites. You have ${structured.current_balance}.`);
            break;
          case "gender_mismatch":
            toast.error(`This job requires a ${structured.required_gender?.toLowerCase()} tutor.`);
            break;
          case "previously_rejected":
            toast.error("You were previously rejected for this job.");
            break;
          case "already_applied":
            toast.error("You already applied to this job.");
            break;
          default:
            toast.error(structured.message || "Application failed");
        }
        return;
      }
      toast.error(getApiErrorMessage(err, "Application failed"));
    },
  });

  const jobs = (data?.jobs ?? []).filter((j: any) => {
    if (!search) return true;
    const text = `${j.subjects} ${j.student_level} ${j.location} ${j.schedule}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">
            Available Jobs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading ? "Loading..." : `${formatEthNumber(jobs.length)} open jobs`}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject, level, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
          />
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center rounded-xl border border-gray-300 bg-white p-0.5 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              view === "list"
                ? "bg-[#0096D6] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              view === "map"
                ? "bg-[#0096D6] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <h3 className="text-lg font-bold text-[#2D2A32]">No jobs match your search</h3>
          <p className="mt-2 text-sm text-gray-500">Try a different search or check back later.</p>
        </div>
      ) : view === "map" ? (
        /* ── JOBS MAP VIEW ── */
        <div className="space-y-6">
          <JobMap
            jobs={jobs}
            onApply={(job) => setConfirmApply({ job })}
            heightClass="h-[560px]"
          />
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              All Available Jobs ({jobs.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((j: any) => (
                <div
                  key={j.id}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#0096D6] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0096D6]">
                        {j.student_level}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-[#2D2A32]">
                        {j.subjects}
                      </h3>
                    </div>
                    {j.gender_requirement && (
                      <span className="shrink-0 rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                        {j.gender_requirement}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{j.location}</span>
                      </p>
                      <a
                        href={getMapLocationUrl({
                          lat: j.latitude,
                          lng: j.longitude,
                          locationName: j.location,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-[#E8F4F8] px-1.5 py-0.5 text-[11px] font-bold text-[#006A9B] hover:bg-[#d0eaf5] transition shrink-0"
                        title="View road and exact location coordinates"
                      >
                        <Navigation className="h-2.5 w-2.5 text-[#0096D6]" />
                        <span>Road ↗</span>
                      </a>
                    </div>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {j.schedule}
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-[#0096D6]">
                      <Banknote className="h-3.5 w-3.5" />
                      {formatBirr(j.hourly_salary)} / ሰዓት
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => setConfirmApply({ job: j })}
                      disabled={applyMutation.isPending}
                      className="w-full rounded-lg bg-[#0096D6] py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
                    >
                      {applyMutation.isPending ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Applying...
                        </span>
                      ) : (
                        "Apply for this job"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── JOBS LIST VIEW ── */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((j: any) => (
            <div
              key={j.id}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#0096D6] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0096D6]">
                    {j.student_level}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[#2D2A32]">
                    {j.subjects}
                  </h3>
                </div>
                {j.gender_requirement && (
                  <span className="shrink-0 rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                    {j.gender_requirement}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>{j.location}</span>
                  </p>
                  <a
                    href={getMapLocationUrl({
                      lat: j.latitude,
                      lng: j.longitude,
                      locationName: j.location,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-[#E8F4F8] px-1.5 py-0.5 text-[11px] font-bold text-[#006A9B] hover:bg-[#d0eaf5] transition shrink-0"
                    title="View road and exact location coordinates"
                  >
                    <Navigation className="h-2.5 w-2.5 text-[#0096D6]" />
                    <span>Road ↗</span>
                  </a>
                </div>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {j.schedule}
                </p>
                <p className="flex items-center gap-1.5 font-bold text-[#0096D6]">
                  <Banknote className="h-3.5 w-3.5" />
                  {formatBirr(j.hourly_salary)} / ሰዓት
                </p>
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => setConfirmApply({ job: j })}
                  disabled={applyMutation.isPending}
                  className="w-full rounded-lg bg-[#0096D6] py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
                >
                  {applyMutation.isPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Applying...
                    </span>
                  ) : (
                    "Apply for this job"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {confirmApply && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmApply(null)}
          onConfirm={() => {
            applyMutation.mutate(confirmApply.job.id);
            setConfirmApply(null);
          }}
          title="Apply for this job?"
          message={`You are about to apply to "${confirmApply.job.subjects}" for ${confirmApply.job.student_level} at ${confirmApply.job.location}.`}
          variant="info"
          isLoading={applyMutation.isPending}
          confirmText="Apply"
        />
      )}
    </div>
  );
}
