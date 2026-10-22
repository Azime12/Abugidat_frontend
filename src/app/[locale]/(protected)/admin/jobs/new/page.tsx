"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { adminService } from "@/services/api/admin";
import { LocationPicker, type PickedLocation } from "@/components/maps/LocationPicker";
import { MultiGradeEditor, type MultiGradeLine } from "@/components/jobs/MultiGradeEditor";
import { normalizeAndValidateEthiopianPhone } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  ArrowLeft, Loader2, User, Phone, MapPin, Calendar, Users,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNewJobPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [schedule, setSchedule] = useState("");
  const [genderRequirement, setGenderRequirement] = useState("Both");
  const [gradeLines, setGradeLines] = useState<MultiGradeLine[]>([
    { curriculum: "et-national", grade_level: "", subjects: "", hourly_salary: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => {
      const phone = normalizeAndValidateEthiopianPhone(parentPhone);
      return adminService.createJob({
        parent_name: parentName || null,
        parent_phone_contact: phone.valid ? phone.phone : parentPhone,
        location: location?.displayName || "",
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        schedule,
        gender_requirement: genderRequirement,
        grade_lines: gradeLines.map((l) => ({
          curriculum: l.curriculum || "et-national",
          grade_level: l.grade_level,
          subjects: l.subjects,
          hourly_salary: l.hourly_salary ? Number(l.hourly_salary) : null,
        })),
      });
    },
    onSuccess: (res: any) => {
      toast.success(`Job #${res?.data?.job?.id} created`);
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
      router.push("/admin/jobs");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create job")),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};

    const phone = normalizeAndValidateEthiopianPhone(parentPhone);
    if (!parentPhone.trim()) next.parentPhone = "Parent phone is required";
    else if (!phone.valid) next.parentPhone = phone.error;

    if (!location?.displayName) next.location = "Location is required";
    if (!schedule.trim()) next.schedule = "Schedule is required";

    const validLines = gradeLines.filter((l) => l.grade_level && l.subjects.trim());
    if (validLines.length === 0) next.gradeLines = "Add at least one grade line";

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D2A32]">Post a New Job</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a tutoring request on behalf of a parent. Supports multiple grades.
          </p>
        </div>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6">
        {/* Parent */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <User className="h-4 w-4 text-[#0096D6]" /> Parent name
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0096D6]"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <Phone className="h-4 w-4 text-[#0096D6]" /> Parent phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="09XXXXXXXX"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0096D6]"
            />
            {errors.parentPhone && <p className="mt-1 text-xs text-red-500">{errors.parentPhone}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
            <MapPin className="h-4 w-4 text-[#0096D6]" /> Location <span className="text-red-500">*</span>
          </label>
          <LocationPicker
            value={location}
            onChange={setLocation}
            placeholder="Search area, landmark, or junction..."
          />
          {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
        </div>

        {/* Schedule + gender */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <Calendar className="h-4 w-4 text-[#0096D6]" /> Schedule <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Mon, Wed, Fri — 2 hrs/day"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0096D6]"
            />
            {errors.schedule && <p className="mt-1 text-xs text-red-500">{errors.schedule}</p>}
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <Users className="h-4 w-4 text-[#0096D6]" /> Tutor preference
            </label>
            <select
              value={genderRequirement}
              onChange={(e) => setGenderRequirement(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0096D6]"
            >
              <option value="Both">Both / No preference</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Multi-grade lines */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-[#2D2A32]">
            Grades, subjects & budget <span className="text-red-500">*</span>
          </label>
          <MultiGradeEditor value={gradeLines} onChange={setGradeLines} error={errors.gradeLines} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0096D6] px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#007FB8] disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Posting...
              </>
            ) : (
              "Post Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
