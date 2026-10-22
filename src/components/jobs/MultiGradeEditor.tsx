"use client";

import { useState } from "react";
import { Plus, Trash2, BookOpen, GraduationCap, Banknote } from "lucide-react";
import { useCurriculum } from "@/hooks/useCurriculum";

export interface MultiGradeLine {
  curriculum?: string;
  grade_level: string;
  subjects: string;
  hourly_salary?: number | string | null;
}

export interface MultiGradeEditorProps {
  value: MultiGradeLine[];
  onChange: (lines: MultiGradeLine[]) => void;
  error?: string;
}

/**
 * P3-6 — collect multiple (grade, subjects, price) rows for a single job.
 * Grades/subjects come from the live curriculum config; a line is added for
 * each student/grade the parent needs a tutor for.
 */
export function MultiGradeEditor({ value, onChange, error }: MultiGradeEditorProps) {
  const { data: config } = useCurriculum();
  const curriculums = config?.curriculums ?? [];

  const [curriculumId, setCurriculumId] = useState<string>(
    value[0]?.curriculum || "et-national"
  );
  const active = curriculums.find((c) => c.id === curriculumId) ?? curriculums[0];
  const grades = active?.grades.map((g) => g.label) ?? [];

  const subjectsFor = (grade: string): string[] =>
    active?.subjectsByGrade[grade] ?? [];

  const update = (i: number, patch: Partial<MultiGradeLine>) => {
    onChange(value.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const addLine = () => {
    onChange([
      ...value,
      { curriculum: curriculumId, grade_level: grades[0] || "", subjects: "", hourly_salary: "" },
    ]);
  };

  const removeLine = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {/* Curriculum */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <BookOpen className="h-4 w-4 text-[#0096D6]" />
          Curriculum
        </label>
        <div className="flex flex-wrap gap-2">
          {curriculums.map((c) => {
            const activeCur = c.id === curriculumId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCurriculumId(c.id);
                  onChange(value.map((l) => ({ ...l, curriculum: c.id })));
                }}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                  activeCur
                    ? "border-[#0096D6] bg-[#0096D6] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade lines */}
      <div className="space-y-3">
        {value.map((line, i) => {
          const lineSubjects = subjectsFor(line.grade_level);
          return (
            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Grade line {i + 1}
                </span>
                {value.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {/* Grade */}
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={line.grade_level}
                    onChange={(e) => update(i, { grade_level: e.target.value, subjects: "" })}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm outline-none focus:border-[#0096D6]"
                  >
                    <option value="">Select grade</option>
                    {grades.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Hourly salary */}
                <div className="relative">
                  <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    placeholder="ETB / hour"
                    value={line.hourly_salary ?? ""}
                    onChange={(e) => update(i, { hourly_salary: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-[#0096D6]"
                  />
                </div>

                {/* Subjects (comma-separated with datalist) */}
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    list={`multi-grade-subjects-${i}`}
                    placeholder="Subjects (comma-separated)"
                    value={line.subjects}
                    onChange={(e) => update(i, { subjects: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm outline-none focus:border-[#0096D6]"
                  />
                  <datalist id={`multi-grade-subjects-${i}`}>
                    {lineSubjects.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addLine}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm font-bold text-[#0096D6] transition hover:border-[#0096D6] hover:bg-white"
      >
        <Plus className="h-4 w-4" /> Add another grade / student
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
