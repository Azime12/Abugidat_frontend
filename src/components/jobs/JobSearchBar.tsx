"use client";

import { useMemo } from "react";
import { Search, MapPin, BookOpen, GraduationCap, X } from "lucide-react";
import { useCurriculum } from "@/hooks/useCurriculum";
import type { CurriculumConfig } from "@/lib/curriculum";

export interface JobSearchFilters {
  query?: string;
  curriculum?: string;
  grade?: string;
  subject?: string;
  location?: string;
}

export interface JobSearchBarProps {
  filters: JobSearchFilters;
  onChange: (filters: JobSearchFilters) => void;
}

function subjectOptions(config: CurriculumConfig | undefined, curriculumId: string, grade: string): string[] {
  const c = config?.curriculums.find((x) => x.id === curriculumId);
  if (!c) return [];
  if (grade) return c.subjectsByGrade[grade] ?? [];
  return [...new Set(Object.values(c.subjectsByGrade).flat())];
}

export function JobSearchBar({ filters, onChange }: JobSearchBarProps) {
  const { data: config } = useCurriculum();
  const curriculums = config?.curriculums ?? [];

  const grades = useMemo(() => {
    const c = curriculums.find((x) => x.id === (filters.curriculum || "et-national"));
    return c?.grades.map((g) => g.label) ?? [];
  }, [curriculums, filters.curriculum]);

  const subjects = useMemo(
    () => subjectOptions(config, filters.curriculum || "et-national", filters.grade || ""),
    [config, filters.curriculum, filters.grade]
  );

  const set = (patch: Partial<JobSearchFilters>) => onChange({ ...filters, ...patch });
  const hasActive = Boolean(filters.query || filters.curriculum || filters.grade || filters.subject || filters.location);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Text search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.query ?? ""}
            onChange={(e) => set({ query: e.target.value })}
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
          />
        </div>

        {/* Curriculum */}
        <div className="relative">
          <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={filters.curriculum ?? ""}
            onChange={(e) => set({ curriculum: e.target.value, grade: "", subject: "" })}
            className="appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm outline-none focus:border-[#0096D6]"
          >
            <option value="">All curriculums</option>
            {curriculums.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Grade */}
        <div className="relative">
          <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={filters.grade ?? ""}
            onChange={(e) => set({ grade: e.target.value, subject: "" })}
            disabled={grades.length === 0}
            className="appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm outline-none focus:border-[#0096D6] disabled:opacity-50"
          >
            <option value="">All grades</option>
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="relative">
          <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={filters.subject ?? ""}
            onChange={(e) => set({ subject: e.target.value })}
            disabled={subjects.length === 0}
            className="appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm outline-none focus:border-[#0096D6] disabled:opacity-50"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="relative min-w-[160px]">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Location..."
            value={filters.location ?? ""}
            onChange={(e) => set({ location: e.target.value })}
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
          />
        </div>

        {hasActive && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
