"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { Loader2, Map, List } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { JobCard } from "@/components/jobs/JobCard";
import { JobSearchBar, type JobSearchFilters } from "@/components/jobs/JobSearchBar";

const JobMap = dynamic(
  () => import("@/components/jobs/JobMap").then((m) => m.JobMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-100 text-sm font-semibold text-gray-400">
        Loading job map...
      </div>
    ),
  }
);

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
  const [filters, setFilters] = useState<JobSearchFilters>({});
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
    if (filters.query) {
      const text = `${j.subjects} ${j.student_level} ${j.location} ${j.schedule}`.toLowerCase();
      if (!text.includes(filters.query.toLowerCase())) return false;
    }
    if (filters.location) {
      if (!(j.location || "").toLowerCase().includes(filters.location.toLowerCase())) return false;
    }
    if (filters.curriculum) {
      const cur = j.curriculum || j.grade_lines?.[0]?.curriculum;
      if (cur !== filters.curriculum) return false;
    }
    if (filters.grade) {
      const grades = Array.isArray(j.grade_levels_json)
        ? j.grade_levels_json
        : j.grade_lines?.map((l: any) => l.grade_level) || (j.student_level ? [j.student_level] : []);
      if (!grades.includes(filters.grade)) return false;
    }
    if (filters.subject) {
      const subs = [
        ...(j.subjects || "").split(",").map((s: string) => s.trim()),
        ...(j.grade_lines || []).flatMap((l: any) => String(l.subjects || "").split(",").map((s: string) => s.trim())),
      ];
      if (!subs.includes(filters.subject)) return false;
    }
    return true;
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

      <div className="flex flex-col gap-3">
        <JobSearchBar filters={filters} onChange={setFilters} />

        {/* View Switcher Button Group */}
        <div className="flex items-center self-start rounded-xl border border-gray-300 bg-white p-0.5 shadow-sm">
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
                <JobCard
                  key={j.id}
                  job={j}
                  onApply={(job) => setConfirmApply({ job })}
                  isApplying={applyMutation.isPending}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── JOBS LIST VIEW ── */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((j: any) => (
            <JobCard
              key={j.id}
              job={j}
              onApply={(job) => setConfirmApply({ job })}
              isApplying={applyMutation.isPending}
            />
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
