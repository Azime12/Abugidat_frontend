"use client";

import { MapPin, Clock, Banknote, Navigation, Loader2, BookOpen } from "lucide-react";
import { getMapLocationUrl } from "@/lib/map-utils";

// ─── Curriculum label map (mirrors backend/src/config/curriculum.js) ────
const CURRICULUM_LABELS: Record<string, string> = {
  "et-national": "Ethiopian National",
  igcse: "IGCSE / Cambridge",
  ib: "IB",
  american: "American / SAT",
  skill: "Skill / Extracurricular",
};

export interface JobGradeLine {
  id?: number;
  curriculum?: string | null;
  grade_level: string;
  subjects: string;
  hourly_salary?: number | string | null;
}

export interface JobCardData {
  id: number | string;
  student_level?: string | null;
  subjects?: string | null;
  location?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  schedule?: string | null;
  hourly_salary?: number | string | null;
  gender_requirement?: string | null;
  curriculum?: string | null;
  grade_levels_json?: string[] | null;
  subjects_json?: string[] | null;
  grade_lines?: JobGradeLine[] | null;
}

export interface JobCardProps {
  job: JobCardData;
  onApply?: (job: JobCardData) => void;
  isApplying?: boolean;
  applyLabel?: string;
}

export function curriculumLabel(id?: string | null): string {
  if (!id) return "";
  return CURRICULUM_LABELS[id] || id;
}

export function formatBirr(value: string | number | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(num)) return "Negotiable";
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
  return `${formatted} ብር`;
}

/** Normalize a job into one-or-more grade lines (multi-grade aware). */
export function jobGradeLines(job: JobCardData): JobGradeLine[] {
  if (Array.isArray(job.grade_lines) && job.grade_lines.length > 0) {
    return job.grade_lines;
  }
  const grades: string[] = Array.isArray(job.grade_levels_json) && job.grade_levels_json.length > 0
    ? job.grade_levels_json
    : (job.student_level ? [job.student_level] : []);

  if (grades.length === 0 && !job.subjects) return [];

  return grades.map((grade, i) => ({
    curriculum: job.curriculum ?? "et-national",
    grade_level: grade || "General",
    subjects: i === 0 ? (job.subjects ?? "") : "",
    hourly_salary: i === 0 ? job.hourly_salary : null,
  }));
}

export function JobCard({ job, onApply, isApplying = false, applyLabel = "Apply for this job" }: JobCardProps) {
  const lines = jobGradeLines(job);
  const primary = lines[0];
  const badge = curriculumLabel(job.curriculum ?? primary?.curriculum);

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#0096D6] hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {badge && (
              <span className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                {badge}
              </span>
            )}
            {job.gender_requirement && (
              <span className="rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5B21B6]">
                {job.gender_requirement}
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base font-bold text-[#2D2A32] line-clamp-2">
            {lines.length > 1 ? "Multiple students" : (primary?.subjects || job.subjects || "Tutoring request")}
          </h3>
        </div>
      </div>

      {/* Multi-grade lines */}
      <div className="mt-3 space-y-2">
        {lines.map((line, i) => (
          <div key={`${line.grade_level}-${i}`} className="rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0096D6]">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>{line.grade_level}</span>
              {line.hourly_salary != null && line.hourly_salary !== "" && (
                <span className="ml-auto font-semibold text-gray-500">
                  {formatBirr(line.hourly_salary)}/hr
                </span>
              )}
            </div>
            {line.subjects && (
              <p className="mt-0.5 text-sm text-gray-700">{line.subjects}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-gray-600">
        {job.location && (
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>{job.location}</span>
            </p>
            <a
              href={getMapLocationUrl({
                lat: job.latitude,
                lng: job.longitude,
                locationName: job.location,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#E8F4F8] px-1.5 py-0.5 text-[11px] font-bold text-[#006A9B] transition hover:bg-[#d0eaf5]"
              title="View road and exact location coordinates"
            >
              <Navigation className="h-2.5 w-2.5 text-[#0096D6]" />
              <span>Road ↗</span>
            </a>
          </div>
        )}
        {job.schedule && (
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {job.schedule}
          </p>
        )}
        {primary?.hourly_salary != null && (
          <p className="flex items-center gap-1.5 font-bold text-[#0096D6]">
            <Banknote className="h-3.5 w-3.5 shrink-0" />
            {formatBirr(primary.hourly_salary)} / ሰዓት
          </p>
        )}
      </div>

      {onApply && (
        <div className="mt-auto pt-4">
          <button
            onClick={() => onApply(job)}
            disabled={isApplying}
            className="w-full rounded-lg bg-[#0096D6] py-2.5 text-sm font-bold text-white transition hover:bg-[#007FB8] disabled:opacity-50"
          >
            {isApplying ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Applying...
              </span>
            ) : (
              applyLabel
            )}
          </button>
        </div>
      )}
    </div>
  );
}
