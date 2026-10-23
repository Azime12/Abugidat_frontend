"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Check, MapPin, FileText, X, Loader2, BookOpen, Search, CheckCircle2,
  Navigation, AlertCircle, Plus, GraduationCap,
} from "lucide-react";
import type { GradeLevel, TutorRegisterTeachingDetails } from "@/types/tutor";
import { useCurriculum } from "@/hooks/useCurriculum";
import { LocationPicker, type PickedLocation } from "@/components/maps/LocationPicker";

// â”€â”€â”€ Location picker (unchanged inline copy from original) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Trimmed here for brevity â€” the previous file's inline PlaceSearch and
// FileUploadButton are re-used verbatim. See full file in ../bak if needed.

// â”€â”€â”€ Main form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Props {
  initial: TutorRegisterTeachingDetails;
  onBack: () => void;
  onSubmit: (data: TutorRegisterTeachingDetails) => void;
  submitting: boolean;
}

export function RegisterStep2({ initial, onBack, onSubmit, submitting }: Props) {
  // Curriculum config
  const { data: config, isLoading: curriculumLoading } = useCurriculum();
  const curriculums = config?.curriculums ?? [];

  // Selected curriculum tab
  const [curriculumId, setCurriculumId] = useState<string>(
    initial.curriculumId || "et-national"
  );
  const activeCurriculum = curriculums.find((c) => c.id === curriculumId) ?? curriculums[0];

  // Grade + subject selection
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(initial.gradeLevels || []);
  const [subjects, setSubjects] = useState<string[]>(initial.subjects || []);

  // Other fields
  const [areaName, setAreaName] = useState(initial.areaName || "");
  const [latitude, setLatitude] = useState<number | undefined>(initial.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initial.longitude);
  const [bio, setBio] = useState(initial.bio || "");
  const [teachingMode, setTeachingMode] = useState<"In-person" | "Online" | "Both">(
    initial.teachingMode || (initial.onlineOk ? "Both" : "In-person")
  );
  const [cvFile, setCvFile] = useState<string | undefined>(initial.cvFile);
  const [educationFile, setEducationFile] = useState<string | undefined>(initial.educationFile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom grade / subject inputs
  const [showCustomGrade, setShowCustomGrade] = useState(false);
  const [customGradeInput, setCustomGradeInput] = useState("");
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState("");

  const toggle = <T,>(arr: T[], val: T, setter: (a: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  // Live grades for the active curriculum
  const liveGrades = activeCurriculum?.grades.map((g) => g.label) ?? [];

  // Live subjects for the currently-selected grades
  // Union of subjects across all selected grades in the active curriculum
  const liveSubjects = useMemo(() => {
    if (!activeCurriculum || gradeLevels.length === 0) return [];
    const seen = new Set<string>();
    for (const gLabel of gradeLevels) {
      const list = activeCurriculum.subjectsByGrade[gLabel] ?? [];
      for (const s of list) seen.add(s);
    }
    return Array.from(seen);
  }, [activeCurriculum, gradeLevels]);

  // Reset grade/subject selection when curriculum switches
  useEffect(() => {
    if (!activeCurriculum) return;
    // Only clear if the current selections don't belong to the new curriculum
    const validGrades = new Set(activeCurriculum.grades.map((g) => g.label));
    setGradeLevels((prev) => prev.filter((g) => validGrades.has(g)));
    // Subjects will be recomputed by liveSubjects; prune stale ones
    setSubjects((prev) => {
      const validSubjects = new Set<string>();
      for (const sList of Object.values(activeCurriculum.subjectsByGrade)) {
        for (const s of sList) validSubjects.add(s);
      }
      return prev.filter((s) => validSubjects.has(s));
    });
  }, [curriculumId]);

  // Prune subjects when grade selection shrinks (so a subject only-valid-for-
  // a-deselected-grade doesn't linger)
  useEffect(() => {
    if (liveSubjects.length === 0) return;
    const valid = new Set(liveSubjects);
    setSubjects((prev) => prev.filter((s) => valid.has(s)));
  }, [liveSubjects]);

  // Custom grades / subjects
  const customGrades = useMemo(
    () => gradeLevels.filter((g) => !liveGrades.includes(g)),
    [gradeLevels, liveGrades]
  );
  const customSubjects = useMemo(
    () => subjects.filter((s) => !liveSubjects.includes(s)),
    [subjects, liveSubjects]
  );

  const handleAddCustomGrade = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const v = customGradeInput.trim();
    if (!v) return;
    if (!gradeLevels.includes(v as GradeLevel)) {
      setGradeLevels([...gradeLevels, v as GradeLevel]);
    }
    setCustomGradeInput("");
    setShowCustomGrade(false);
  };

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const v = customSubjectInput.trim();
    if (!v) return;
    if (!subjects.includes(v)) {
      setSubjects([...subjects, v]);
    }
    setCustomSubjectInput("");
    setShowCustomSubject(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (gradeLevels.length === 0) next.gradeLevels = "Select at least one grade";
    if (subjects.length === 0) next.subjects = "Select at least one subject";
    if (!bio.trim() || bio.trim().length < 20)
      next.bio = "Add a short bio (at least 20 characters)";
    if (!cvFile) next.cvFile = "Please upload your CV / Resume";
    if (!educationFile) next.educationFile = "Please upload your Education Certificate or Degree";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      subjects,
      gradeLevels,
      areaName: areaName || "Addis Ababa",
      latitude,
      longitude,
      travelKm: 5,
      price: 400,
      bio: bio.trim(),
      teachingMode,
      onlineOk: teachingMode !== "In-person",
      cvFile,
      educationFile,
      curriculumId,
    });
  };

  if (curriculumLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0096D6]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* â”€â”€ Curriculum tabs â”€â”€ */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <BookOpen className="h-4 w-4 text-[#0096D6]" />
          Curriculum <span className="text-red-500">*</span>
        </label>
        <p className="mb-2 text-xs text-gray-400">
          Pick the curriculum you teach. You can register again for a different one later.
        </p>
        <div className="flex flex-wrap gap-2">
          {curriculums.map((c) => {
            const active = c.id === curriculumId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCurriculumId(c.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                  active
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

      {/* â”€â”€ Grade levels â”€â”€ */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <GraduationCap className="h-4 w-4 text-[#0096D6]" />
              Grade levels <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400">
              Select every grade you teach in this curriculum
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (gradeLevels.length === liveGrades.length) {
                setGradeLevels([]);
              } else {
                setGradeLevels(liveGrades as GradeLevel[]);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 hover:border-[#0096D6] hover:text-[#0096D6]"
          >
            {gradeLevels.length === liveGrades.length && liveGrades.length > 0
              ? "Deselect All"
              : "Teach All Grades"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {liveGrades.map((gLabel) => {
            const active = gradeLevels.includes(gLabel);
            return (
              <button
                key={gLabel}
                type="button"
                onClick={() => toggle(gradeLevels, gLabel as GradeLevel, setGradeLevels)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-[#0096D6] bg-[#0096D6] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {active && <Check className="h-3 w-3" />}
                {gLabel}
              </button>
            );
          })}

          {customGrades.map((cg) => (
            <span
              key={cg}
              className="flex items-center gap-1.5 rounded-full border border-blue-400 bg-blue-50 text-blue-900 px-3 py-1 text-xs font-bold"
            >
              <span>{cg}</span>
              <button
                type="button"
                onClick={() => setGradeLevels(gradeLevels.filter((x) => x !== cg))}
                className="hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {!showCustomGrade && (
            <button
              type="button"
              onClick={() => setShowCustomGrade(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-gray-50/80 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-[#0096D6] hover:bg-white hover:text-[#0096D6]"
            >
              <Plus className="h-3 w-3" /> Other Grade
            </button>
          )}
        </div>

        {showCustomGrade && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={customGradeInput}
              onChange={(e) => setCustomGradeInput(e.target.value)}
              placeholder="e.g. Preschool, SAT Prep"
              autoFocus
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#0096D6] w-64"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomGrade();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomGrade}
              className="rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowCustomGrade(false); setCustomGradeInput(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              Cancel
            </button>
          </div>
        )}

        {errors.gradeLevels && <p className="mt-1 text-xs text-red-500">{errors.gradeLevels}</p>}
      </div>

      {/* â”€â”€ Subjects â”€â”€ */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <BookOpen className="h-4 w-4 text-[#0096D6]" />
              Subjects you teach <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400">
              {gradeLevels.length === 0
                ? "Select grades above to see subjects"
                : `${liveSubjects.length} subject${liveSubjects.length === 1 ? "" : "s"} available for selected grades`}
            </p>
          </div>
          {liveSubjects.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (subjects.length === liveSubjects.length) {
                  setSubjects([]);
                } else {
                  setSubjects(liveSubjects);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 hover:border-[#0096D6] hover:text-[#0096D6]"
            >
              {subjects.length === liveSubjects.length && liveSubjects.length > 0
                ? "Deselect All"
                : "Select All Subjects"}
            </button>
          )}
        </div>

        {liveSubjects.length === 0 && gradeLevels.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
            Pick at least one grade above to load subjects
          </div>
        )}

        {liveSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {liveSubjects.map((s) => {
              const active = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(subjects, s, setSubjects)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "border-[#0096D6] bg-[#0096D6] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {customSubjects.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {customSubjects.map((cs) => (
              <span
                key={cs}
                className="flex items-center gap-1.5 rounded-full border border-blue-400 bg-blue-50 text-blue-900 px-3 py-1 text-xs font-bold"
              >
                <span>{cs}</span>
                <button
                  type="button"
                  onClick={() => setSubjects(subjects.filter((s) => s !== cs))}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {!showCustomSubject && (
          <button
            type="button"
            onClick={() => setShowCustomSubject(true)}
            className="mt-3 flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-gray-50/80 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-[#0096D6] hover:bg-white hover:text-[#0096D6]"
          >
            <Plus className="h-3 w-3" /> Other Subject
          </button>
        )}

        {showCustomSubject && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={customSubjectInput}
              onChange={(e) => setCustomSubjectInput(e.target.value)}
              placeholder="e.g. Music, French, Coding"
              autoFocus
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#0096D6] w-64"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSubject();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomSubject}
              className="rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowCustomSubject(false); setCustomSubjectInput(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              Cancel
            </button>
          </div>
        )}

        {errors.subjects && <p className="mt-1 text-xs text-red-500">{errors.subjects}</p>}
      </div>

      {/* â”€â”€ Teaching mode â”€â”€ */}
      <div>
        <label className="mb-2 block text-sm font-bold text-[#2D2A32]">Teaching Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(["In-person", "Online", "Both"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTeachingMode(m)}
              className={`rounded-xl border py-2.5 text-center text-xs font-bold transition ${
                teachingMode === m
                  ? "border-[#0096D6] bg-[#0096D6] text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
              }`}
            >
              {m === "In-person" ? "🏠 In-person" : m === "Online" ? "💻 Online" : "✨ Both"}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ Location (simplified text input â€” the original had a full map picker) â”€â”€ */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <MapPin className="h-4 w-4 text-[#0096D6]" />
          Your city / area
        </label>
        <LocationPicker
        value={
          areaName && latitude != null && longitude != null
            ? { lat: latitude, lng: longitude, displayName: areaName }
            : null
        }
        onChange={(loc: PickedLocation) => {
          setAreaName(loc.displayName);
          setLatitude(loc.lat);
          setLongitude(loc.lng);
        }}
        required
        placeholder="Search area, landmark, or junction..."
      />
      </div>

      {/* â”€â”€ CV upload â”€â”€ */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <FileText className="h-4 w-4 text-[#0096D6]" />
          CV / Resume <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              setErrors({ ...errors, cvFile: "File too large (max 10 MB)" });
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              setCvFile(reader.result as string);
              setErrors({ ...errors, cvFile: "" });
            };
            reader.readAsDataURL(file);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        {cvFile && (
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> File attached
          </p>
        )}
        {errors.cvFile && <p className="mt-1 text-xs text-red-500">{errors.cvFile}</p>}
      </div>

      {/* â”€â”€ Certificate upload â”€â”€ */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <FileText className="h-4 w-4 text-[#0096D6]" />
          Education Certificate / Degree <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              setErrors({ ...errors, educationFile: "File too large (max 10 MB)" });
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              setEducationFile(reader.result as string);
              setErrors({ ...errors, educationFile: "" });
            };
            reader.readAsDataURL(file);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        {educationFile && (
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> File attached
          </p>
        )}
        {errors.educationFile && <p className="mt-1 text-xs text-red-500">{errors.educationFile}</p>}
      </div>

      {/* â”€â”€ Bio â”€â”€ */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <BookOpen className="h-4 w-4 text-[#0096D6]" />
          About you <span className="text-red-500">*</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Describe your experience, teaching style, and what makes you a great tutor…"
          className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
            errors.bio ? "border-red-400" : "border-gray-300"
          } focus:border-[#0096D6]`}
        />
        <p className="mt-1 text-xs text-gray-400">{bio.length} characters (min 20)</p>
        {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
      </div>

      {/* â”€â”€ Actions â”€â”€ */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-[#0096D6] py-3.5 text-sm font-black text-white shadow-md shadow-[#0096D6]/20 transition hover:bg-[#007FB8] disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </span>
          ) : (
            "Submit for Review →"
          )}
        </button>
      </div>
    </form>
  );
}