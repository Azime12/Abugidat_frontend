"use client";

import { useState, useEffect } from "react";
import { User, Phone, GraduationCap, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { CreateRequestData, ParentRequest } from "@/types/request";
import { requestService } from "@/services/api/requests";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

const GRADES = ["KG", "1-4", "5-8", "9-10", "11-12", "Uni"];

interface Props {
  tutorId: string;
  tutorName: string;
  defaultGrade?: string;
  onSuccess: (req: ParentRequest) => void;
}

export function RequestForm({
  tutorId,
  tutorName,
  defaultGrade = "5-8",
  onSuccess,
}: Props) {
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState<CreateRequestData>(() => {
    const initialName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";
    const initialPhone = user?.phone || "";
    return {
      tutorId,
      parentName: initialName,
      parentPhone: initialPhone,
      gradeLevel: defaultGrade,
      note: "",
      preferredTime: "",
      consent: false,
    };
  });

  const [isEditingContact, setIsEditingContact] = useState(false);

  // Re-sync if user loads after mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const name = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ");
      const phone = user.phone || "";
      setForm((prev) => ({
        ...prev,
        parentName: prev.parentName || name || "",
        parentPhone: prev.parentPhone || phone || "",
      }));
    }
  }, [user, isAuthenticated]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof CreateRequestData>(
    key: K,
    value: CreateRequestData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.parentName.trim()) {
      next.parentName = "Your name is required";
    } else if (form.parentName.trim().length < 2) {
      next.parentName = "Name is too short";
    }

    if (!form.parentPhone.trim()) {
      next.parentPhone = "Phone number is required";
    } else if (!/^(\+251|0)?9\d{8}$/.test(form.parentPhone.replace(/\s/g, ""))) {
      next.parentPhone = "Enter a valid Ethiopian phone number";
    }

    if (!form.gradeLevel) {
      next.gradeLevel = "Please select a grade";
    }

    if (!form.consent) {
      next.consent = "You must agree to the terms";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const request = await requestService.create({
        ...form,
        parentName: form.parentName.trim(),
        parentPhone: form.parentPhone.replace(/\s/g, ""),
        note: form.note?.trim() || undefined,
        preferredTime: form.preferredTime?.trim() || undefined,
      });

      // Attach tutor info for the success screen
      request.tutorName = tutorName;

      toast.success("Request sent!");
      onSuccess(request);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const userDisplayName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || form.parentName;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Auth state banner */}
      {isAuthenticated && user ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-sm shadow-sm">
                {(userDisplayName?.[0] || "U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="truncate text-sm font-bold text-gray-900">
                    {userDisplayName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Logged In
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-gray-600 mt-0.5">
                  {form.parentPhone || "No phone registered"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="shrink-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-50 transition"
            >
              {isEditingContact ? "Done" : "Change"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800/80">
            ✓ Your contact information is automatically taken from your profile.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50/60 p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-sky-950">
                Have an Abugida account?
              </p>
              <p className="mt-0.5 text-xs text-sky-700">
                Log in to auto-fill your contact details and track requests.
              </p>
            </div>
            <Link
              href={`/login?redirect=/tutors/${tutorId}/request`}
              className="shrink-0 rounded-lg bg-[#0096D6] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#007FB8] transition"
            >
              Log In →
            </Link>
          </div>
        </div>
      )}

      {/* Contact fields: shown if guest user, or if logged in user has no phone or clicks Change */}
      {(!isAuthenticated || isEditingContact || !form.parentPhone) && (
        <div className="space-y-5 rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 sm:p-4">
          <Field
            icon={User}
            label="Your name"
            error={errors.parentName}
            hint="We'll share this with the tutor"
          >
            <input
              type="text"
              value={form.parentName}
              onChange={(e) => update("parentName", e.target.value)}
              placeholder="e.g. Meron Kebede"
              className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                errors.parentName ? "border-red-400" : "border-gray-300"
              }`}
              autoComplete="name"
            />
          </Field>

          <Field
            icon={Phone}
            label="Your phone number"
            error={errors.parentPhone}
            hint="ⓘ Shared only after the tutor accepts"
          >
            <input
              type="tel"
              value={form.parentPhone}
              onChange={(e) => update("parentPhone", e.target.value)}
              placeholder="+251 9XX XXX XXX"
              className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                errors.parentPhone ? "border-red-400" : "border-gray-300"
              }`}
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

      {/* Grade */}
      <Field icon={GraduationCap} label="Your child's grade" error={errors.gradeLevel}>
        <select
          value={form.gradeLevel}
          onChange={(e) => update("gradeLevel", e.target.value)}
          className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
            errors.gradeLevel ? "border-red-400" : "border-gray-300"
          }`}
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </Field>

      {/* Preferred time */}
      <Field icon={Clock} label="Preferred schedule" hint="Optional — e.g. Weekdays after 4 PM">
        <input
          type="text"
          value={form.preferredTime}
          onChange={(e) => update("preferredTime", e.target.value)}
          placeholder="e.g. Weekdays after 4 PM"
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
        />
      </Field>

      {/* Note */}
      <Field
        icon={MessageSquare}
        label="Message to the tutor"
        hint="Optional"
      >
        <textarea
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
          placeholder="e.g. My child needs help with fractions and algebra basics."
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
        />
      </Field>

      {/* Consent */}
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0096D6] focus:ring-[#0096D6]"
          />
          <span className="text-xs leading-relaxed text-gray-600">
            I agree to the Parent Terms & Privacy Policy. I understand my contact
            will only be shared with the tutor I chose.
          </span>
        </label>
        {errors.consent && (
          <p className="mt-1 text-xs text-red-500">{errors.consent}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[#0096D6] py-3.5 text-sm font-bold text-white transition hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send request →"}
      </button>

      <p className="text-center text-xs text-gray-400">
        Free for parents · Reply within 24 hours
      </p>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  hint,
  error,
  children,
}: {
  icon: any;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
        {children}
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}