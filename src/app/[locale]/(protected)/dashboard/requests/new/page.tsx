"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parentRequestService } from "@/services/api/parent-requests";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft, MapPin, GraduationCap, BookOpen, Clock, MessageSquare,
  Phone, User, Loader2, Sparkles, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useCurriculum } from "@/hooks/useCurriculum";

const AREAS = [
  "Bole", "Kirkos", "Yeka", "Arada", "Gulele", "Lideta",
  "Akaki Kaliti", "Nifas Silk-Lafto", "Kolfe Keranio", "Addis Ketema",
];

export default function NewParentRequestPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const u = user as any;

  // Curriculum v2 — live grade & subject lists from /api/public/curriculum
  const { data: curriculumConfig } = useCurriculum();
  const ethiopian = curriculumConfig?.curriculums.find((c) => c.id === "et-national");
  const liveGrades = ethiopian?.grades ?? [];
  const liveSubjects = ethiopian?.subjectsByGrade ?? {};

  // Pick a sensible default grade once the live list arrives
  useEffect(() => {
    if (liveGrades.length > 0 && !liveGrades.some((g) => g.label === form.grade_level)) {
      setForm((prev) => ({ ...prev, grade_level: liveGrades[0].label }));
    }
  }, [liveGrades]);

  const [form, setForm] = useState({
    parent_name: u?.firstName || u?.first_name || "",
    parent_phone: u?.phone || u?.phone_number || "",
    grade_level: "",   // set from live curriculum on load (see effect below)
    subjects: "Mathematics",
    area_name: "Bole",
    preferred_time: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => parentRequestService.create(form),
    onSuccess: () => {
      toast.success("Request posted! Tutors will see it shortly.", { icon: "🎉" });
      qc.invalidateQueries({ queryKey: ["parent", "requests"] });
      router.push("/dashboard");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create request")),
  });

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.parent_name.trim()) next.parent_name = "Your name is required";
    else if (form.parent_name.trim().length < 2) next.parent_name = "Name is too short";

    if (!form.parent_phone.trim()) next.parent_phone = "Phone is required";
    else if (!/^(\+251|0)?9\d{8}$/.test(form.parent_phone.replace(/\s/g, "")))
      next.parent_phone = "Enter a valid Ethiopian phone number";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-[#0096D6]"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        {/* Hero header */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8F4F8]">
              <Sparkles className="h-7 w-7 text-[#0096D6]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A32]">
                Post a Tutoring Request
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Free for parents. Verified tutors will pay Kulf to unlock your contact.
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-gray-700">100% free</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <User className="h-4 w-4 text-[#0096D6]" />
              <span className="text-xs font-bold text-gray-700">Verified tutors</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 col-span-2 sm:col-span-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-gray-700">Reply in 24h</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1 — Contact info */}
          <FormSection
            step="1"
            title="Your contact info"
            description="Shared only with tutors who unlock your request."
          >
            <Field
              icon={User}
              label="Your name"
              required
              error={errors.parent_name}
            >
              <input
                type="text"
                value={form.parent_name}
                onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                placeholder="e.g. Meron Kebede"
                className={`input-base ${errors.parent_name ? "input-error" : ""}`}
              />
            </Field>

            <Field
              icon={Phone}
              label="Phone number"
              required
              hint="Used by the tutor to contact you"
              error={errors.parent_phone}
            >
              <input
                type="tel"
                value={form.parent_phone}
                onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
                placeholder="+251 9XX XXX XXX"
                className={`input-base ${errors.parent_phone ? "input-error" : ""}`}
              />
            </Field>
          </FormSection>

          {/* Section 2 — Request details */}
          <FormSection
            step="2"
            title="What do you need?"
            description="Help tutors match with your child's needs."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={GraduationCap} label="Grade level" required>
                <select
                  value={form.grade_level}
                  onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                  className="input-base appearance-none cursor-pointer"
                >
                  {liveGrades.map((g) => (
                    <option key={g.id} value={g.label}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field icon={BookOpen} label="Subject" required>
                <select
                  value={form.subjects}
                  onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                  className="input-base appearance-none cursor-pointer"
                >
                  {(liveSubjects[form.grade_level] ?? []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field icon={MapPin} label="Area (sub-city)" required>
              <select
                value={form.area_name}
                onChange={(e) => setForm({ ...form, area_name: e.target.value })}
                className="input-base appearance-none cursor-pointer"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </FormSection>

          {/* Section 3 — Optional */}
          <FormSection
            step="3"
            title="Additional details"
            description="Optional — helps tutors understand your needs better."
          >
            <Field
              icon={Clock}
              label="Preferred schedule"
              hint="e.g. Weekdays after 4 PM"
            >
              <input
                type="text"
                value={form.preferred_time}
                onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                placeholder="e.g. Weekdays after 4 PM"
                className="input-base"
              />
            </Field>

            <Field
              icon={MessageSquare}
              label="Additional notes"
              hint="Describe what your child needs help with"
            >
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={4}
                placeholder="e.g. My child needs help with fractions and algebra basics."
                className="input-base resize-none"
              />
            </Field>
          </FormSection>

          {/* Submit bar */}
          <div className="sticky bottom-0 -mx-4 sm:mx-0 rounded-t-2xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Your phone is only revealed to tutors who pay Kulf
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto rounded-lg bg-[#0096D6] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Posting...
                  </span>
                ) : (
                  "Post Request"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input-base {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #ffffff;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.15s;
        }
        .input-base:focus {
          border-color: #0096D6;
          box-shadow: 0 0 0 3px rgba(0, 150, 214, 0.15);
        }
        .input-base::placeholder {
          color: #9ca3af;
        }
        .input-error {
          border-color: #ef4444;
        }
        .input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
      `}</style>

      {confirmOpen && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            mutation.mutate();
            setConfirmOpen(false);
          }}
          title="Post this request?"
          message={
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Verified tutors will see your request and can unlock your contact with Kulf.
              </p>
              <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
                <p><strong>Grade:</strong> {form.grade_level}</p>
                <p><strong>Subject:</strong> {form.subjects}</p>
                <p><strong>Area:</strong> {form.area_name}</p>
                {form.preferred_time && <p><strong>Time:</strong> {form.preferred_time}</p>}
              </div>
              <p className="text-xs text-gray-500">
                You&apos;ll see the unlock count on your dashboard.
              </p>
            </div>
          }
          variant="info"
          isLoading={mutation.isPending}
          confirmText="Post request"
        />
      )}
    </div>
  );
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0096D6] text-sm font-black text-white">
          {step}
        </div>
        <div>
          <h2 className="text-base font-bold text-[#2D2A32]">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  required,
  hint,
  error,
  children,
}: {
  icon: any;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-[#2D2A32]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        {children}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
