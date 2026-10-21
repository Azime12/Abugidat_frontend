"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Save, RotateCcw, RefreshCw, ChevronDown, ChevronRight,
  Loader2, GripVertical, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import adminClient from "@/lib/api-client";

// ─── Local types (mirror lib/curriculum.ts but editable) ─────────────────
type GradeOption = { id: string; label: string; order: number };
type Curriculum = {
  id: string;
  category: string;
  label: string;
  description: string;
  grades: GradeOption[];
  subjectsByGrade: Record<string, string[]>;
};
type Category = { id: string; label: string; description: string; order: number };
type CurriculumConfig = {
  success: true;
  source: "code" | "db";
  categories: Category[];
  curriculums: Curriculum[];
};

// ─── Utils ───────────────────────────────────────────────────────────────
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "item";
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function nextOrder(items: { order: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.order)) + 1;
}

// ─── Component ───────────────────────────────────────────────────────────
export function CurriculumEditor() {
  const qc = useQueryClient();

  const { data: remote, isLoading, refetch, isFetching } = useQuery<CurriculumConfig>({
    queryKey: ["admin", "curriculum-config"],
    queryFn: async () => {
      const res = await adminClient.get<CurriculumConfig>("/public/curriculum");
      return res.data;
    },
  });

  // Local editable copy
  const [categories, setCategories] = useState<Category[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Hydrate local state from remote
  useEffect(() => {
    if (!remote) return;
    setCategories(deepClone(remote.categories));
    setCurriculums(deepClone(remote.curriculums));
  }, [remote]);

  const dirty = useMemo(() => {
    if (!remote) return false;
    const a = JSON.stringify(remote.categories);
    const b = JSON.stringify(categories);
    const c = JSON.stringify(remote.curriculums);
    const d = JSON.stringify(curriculums);
    return a !== b || c !== d;
  }, [remote, categories, curriculums]);

  // ─── Mutations ─────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await adminClient.patch("/config", {
        curricula: curriculums,
        grade_categories: categories,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Curriculum saved. Public site updates within 60 seconds.");
      qc.invalidateQueries({ queryKey: ["admin", "curriculum-config"] });
      qc.invalidateQueries({ queryKey: ["public", "curriculum"] });
      refetch();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save curriculum")),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await adminClient.patch("/config", {
        curricula: null,
        grade_categories: null,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Reset to code defaults.");
      qc.invalidateQueries({ queryKey: ["admin", "curriculum-config"] });
      qc.invalidateQueries({ queryKey: ["public", "curriculum"] });
      refetch();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to reset curriculum")),
  });

  // ─── Category ops ──────────────────────────────────────────────────────
  const addCategory = () => {
    const label = window.prompt("New category name (e.g. Vocational)");
    if (!label || !label.trim()) return;
    const base = slugify(label);
    let id = base;
    let n = 1;
    while (categories.some((c) => c.id === id)) id = `${base}-${++n}`;
    setCategories([
      ...categories,
      { id, label: label.trim(), description: "", order: nextOrder(categories) },
    ]);
  };

  const renameCategory = (id: string, label: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, label } : c)));
  };

  const removeCategory = (id: string) => {
    const used = curriculums.some((c) => c.category === id);
    if (used) {
      toast.error("Move or delete this category's curriculums first.");
      return;
    }
    if (!window.confirm(`Delete category "${categories.find((c) => c.id === id)?.label}"?`)) return;
    setCategories(categories.filter((c) => c.id !== id));
  };

  // ─── Curriculum ops ────────────────────────────────────────────────────
  const addCurriculum = (categoryId: string) => {
    const label = window.prompt("New curriculum name (e.g. French Bac)");
    if (!label || !label.trim()) return;
    const base = slugify(label);
    let id = base;
    let n = 1;
    while (curriculums.some((c) => c.id === id)) id = `${base}-${++n}`;
    setCurriculums([
      ...curriculums,
      {
        id,
        category: categoryId,
        label: label.trim(),
        description: "",
        grades: [],
        subjectsByGrade: {},
      },
    ]);
  };

  const updateCurriculumLabel = (id: string, label: string) => {
    setCurriculums(curriculums.map((c) => (c.id === id ? { ...c, label } : c)));
  };

  const removeCurriculum = (id: string) => {
    const c = curriculums.find((x) => x.id === id);
    if (!c) return;
    if (!window.confirm(`Delete curriculum "${c.label}"? This removes ${c.grades.length} grade(s).`)) return;
    setCurriculums(curriculums.filter((x) => x.id !== id));
  };

  // ─── Grade ops ─────────────────────────────────────────────────────────
  const addGrade = (curriculumId: string) => {
    const label = window.prompt("New grade label (e.g. Grade 5)");
    if (!label || !label.trim()) return;
    setCurriculums(
      curriculums.map((c) => {
        if (c.id !== curriculumId) return c;
        const base = slugify(label);
        let id = base;
        let n = 1;
        while (c.grades.some((g) => g.id === id)) id = `${base}-${++n}`;
        const newGrade = { id, label: label.trim(), order: nextOrder(c.grades) };
        const newSubjects = { ...c.subjectsByGrade, [label.trim()]: [] };
        return { ...c, grades: [...c.grades, newGrade], subjectsByGrade: newSubjects };
      })
    );
  };

  const renameGrade = (curriculumId: string, gradeId: string, newLabel: string) => {
    setCurriculums(
      curriculums.map((c) => {
        if (c.id !== curriculumId) return c;
        const oldGrade = c.grades.find((g) => g.id === gradeId);
        if (!oldGrade || oldGrade.label === newLabel) return c;
        const newGrades = c.grades.map((g) =>
          g.id === gradeId ? { ...g, label: newLabel } : g
        );
        // Move subjects from old label key to new label key
        const newSubjects: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(c.subjectsByGrade)) {
          if (k === oldGrade.label) newSubjects[newLabel] = v;
          else newSubjects[k] = v;
        }
        return { ...c, grades: newGrades, subjectsByGrade: newSubjects };
      })
    );
  };

  const removeGrade = (curriculumId: string, gradeId: string) => {
    const c = curriculums.find((x) => x.id === curriculumId);
    const g = c?.grades.find((x) => x.id === gradeId);
    if (!c || !g) return;
    if (!window.confirm(`Delete grade "${g.label}" and its subjects?`)) return;
    setCurriculums(
      curriculums.map((cur) => {
        if (cur.id !== curriculumId) return cur;
        const newSubjects = { ...cur.subjectsByGrade };
        delete newSubjects[g.label];
        return {
          ...cur,
          grades: cur.grades.filter((x) => x.id !== gradeId),
          subjectsByGrade: newSubjects,
        };
      })
    );
  };

  const moveGrade = (curriculumId: string, gradeId: string, delta: number) => {
    setCurriculums(
      curriculums.map((c) => {
        if (c.id !== curriculumId) return c;
        const idx = c.grades.findIndex((g) => g.id === gradeId);
        if (idx < 0) return c;
        const newIdx = Math.max(0, Math.min(c.grades.length - 1, idx + delta));
        if (newIdx === idx) return c;
        const copy = [...c.grades];
        const [moved] = copy.splice(idx, 1);
        copy.splice(newIdx, 0, moved);
        // Re-order
        const reordered = copy.map((g, i) => ({ ...g, order: i + 1 }));
        return { ...c, grades: reordered };
      })
    );
  };

  // ─── Subject ops ───────────────────────────────────────────────────────
  const addSubject = (curriculumId: string, gradeLabel: string) => {
    const value = window.prompt(`New subject for "${gradeLabel}"`);
    if (!value || !value.trim()) return;
    setCurriculums(
      curriculums.map((c) => {
        if (c.id !== curriculumId) return c;
        const list = c.subjectsByGrade[gradeLabel] || [];
        if (list.includes(value.trim())) return c;
        return {
          ...c,
          subjectsByGrade: {
            ...c.subjectsByGrade,
            [gradeLabel]: [...list, value.trim()],
          },
        };
      })
    );
  };

  const removeSubject = (curriculumId: string, gradeLabel: string, subject: string) => {
    setCurriculums(
      curriculums.map((c) => {
        if (c.id !== curriculumId) return c;
        const list = c.subjectsByGrade[gradeLabel] || [];
        return {
          ...c,
          subjectsByGrade: {
            ...c.subjectsByGrade,
            [gradeLabel]: list.filter((s) => s !== subject),
          },
        };
      })
    );
  };

  // ─── Toggle helpers ────────────────────────────────────────────────────
  const toggleGrade = (key: string) => {
    const next = new Set(expandedGrades);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedGrades(next);
  };
  const toggleSubjects = (key: string) => {
    const next = new Set(expandedSubjects);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedSubjects(next);
  };

  // ─── Render ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0096D6]" />
      </div>
    );
  }

  const sourceBadge =
    remote?.source === "db" ? (
      <span className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
        Customized (DB)
      </span>
    ) : (
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700">
        Code defaults
      </span>
    );

  return (
    <div className="space-y-4">
      {/* Header / actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black text-[#2D2A32]">Curriculums &amp; Grades</h3>
          {sourceBadge}
          {dirty && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("Reset to code defaults? Any customizations will be lost.")) return;
              resetMutation.mutate();
            }}
            disabled={resetMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {resetMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!dirty || saveMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0096D6] px-4 py-2 text-xs font-bold text-white hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save changes
          </button>
        </div>
      </div>

      {/* Category list */}
      {categories.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No categories yet. Add one below.
        </div>
      )}

      {categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((cat) => {
          const catCurriculums = curriculums
            .filter((c) => c.category === cat.id)
            .sort((a, b) => a.label.localeCompare(b.label));

          return (
            <div key={cat.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              {/* Category header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => renameCategory(cat.id, e.target.value)}
                    className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-sm font-black text-[#2D2A32] outline-none hover:border-gray-200 focus:border-[#0096D6] focus:bg-white"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => addCurriculum(cat.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#0096D6] hover:bg-[#0096D6]/20"
                  >
                    <Plus size={12} /> Curriculum
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Curriculums within category */}
              <div className="mt-3 space-y-3">
                {catCurriculums.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No curriculums in this category yet.</p>
                )}

                {catCurriculums.map((cur) => (
                  <div key={cur.id} className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                    {/* Curriculum header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleGrade(cur.id)}
                          className="shrink-0 rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700"
                        >
                          {expandedGrades.has(cur.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <input
                          type="text"
                          value={cur.label}
                          onChange={(e) => updateCurriculumLabel(cur.id, e.target.value)}
                          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1 text-sm font-bold text-[#2D2A32] outline-none hover:border-gray-200 focus:border-[#0096D6] focus:bg-white"
                        />
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                          {cur.grades.length} grade{cur.grades.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => addGrade(cur.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#0096D6] hover:bg-[#0096D6]/20"
                        >
                          <Plus size={12} /> Grade
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCurriculum(cur.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete curriculum"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Grades + subjects (collapsible) */}
                    {expandedGrades.has(cur.id) && (
                      <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                        {cur.grades.length === 0 && (
                          <p className="text-xs text-gray-400 italic">No grades yet. Add one to start.</p>
                        )}

                        {cur.grades
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((g) => {
                            const subjectKey = `${cur.id}::${g.label}`;
                            const subjects = cur.subjectsByGrade[g.label] || [];
                            return (
                              <div key={g.id} className="rounded-lg bg-white border border-gray-200 p-2.5">
                                <div className="flex items-center gap-2">
                                  <GripVertical size={13} className="text-gray-300 shrink-0" />
                                  <input
                                    type="text"
                                    value={g.label}
                                    onChange={(e) => renameGrade(cur.id, g.id, e.target.value)}
                                    className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-bold text-[#2D2A32] outline-none hover:border-gray-200 focus:border-[#0096D6] focus:bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleSubjects(subjectKey)}
                                    className="text-[10px] font-bold text-[#0096D6] hover:underline"
                                  >
                                    {subjects.length} subject{subjects.length === 1 ? "" : "s"}
                                  </button>
                                  <div className="flex gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => moveGrade(cur.id, g.id, -1)}
                                      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 text-[10px]"
                                      title="Move up"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveGrade(cur.id, g.id, +1)}
                                      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 text-[10px]"
                                      title="Move down"
                                    >
                                      ▼
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeGrade(cur.id, g.id)}
                                      className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                      title="Delete grade"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>

                                {expandedSubjects.has(subjectKey) && (
                                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
                                    {subjects.length === 0 && (
                                      <span className="text-[10px] text-gray-400 italic">No subjects.</span>
                                    )}
                                    {subjects.map((s) => (
                                      <span
                                        key={s}
                                        className="inline-flex items-center gap-1 rounded-full bg-[#E8F4F8] px-2 py-0.5 text-[11px] font-semibold text-[#006A9B]"
                                      >
                                        {s}
                                        <button
                                          type="button"
                                          onClick={() => removeSubject(cur.id, g.label, s)}
                                          className="text-[#006A9B]/60 hover:text-red-600"
                                          title="Remove subject"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addSubject(cur.id, g.label)}
                                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[10px] font-bold text-gray-500 hover:border-[#0096D6] hover:text-[#0096D6]"
                                    >
                                      <Plus size={10} /> Add
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Add category */}
      <button
        type="button"
        onClick={addCategory}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-xs font-bold text-gray-500 hover:border-[#0096D6] hover:text-[#0096D6]"
      >
        <Plus size={13} className="mr-1 inline" /> Add category
      </button>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-[#E8F4F8]/60 p-3 text-xs text-[#006A9B]">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <div>
          <strong>Changes go live within 60 seconds.</strong> The public site,
          tutor registration, and parent intake all read from this config. Removing
          a grade does not affect existing jobs/tutors that already reference it —
          they keep working via legacy aliases.
        </div>
      </div>
    </div>
  );
}
