"use client";

import { useState, useRef } from "react";
import { User, Phone, Mail, GraduationCap, Camera, Upload, Users } from "lucide-react";
import type { TutorRegisterBasicInfo } from "@/types/tutor";

interface Props {
  initial: TutorRegisterBasicInfo;
  onNext: (data: TutorRegisterBasicInfo) => void;
}

export function RegisterStep1({ initial, onNext }: Props) {
  const [fullName, setFullName] = useState(initial.fullName || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [email, setEmail] = useState(initial.email || "");
  const [gender, setGender] = useState<"Male" | "Female" | undefined>(initial.gender || "Male");
  const [studentGenderPreference, setStudentGenderPreference] = useState<"Both" | "Male" | "Female">(
    initial.studentGenderPreference || "Both"
  );
  const [education, setEducation] = useState(initial.education || "");
  const [photo, setPhoto] = useState<string | undefined>(initial.photo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be under 5 MB" }));
      return;
    }

    try {
      setCompressing(true);
      const { compressImageTo100KB } = await import("@/lib/imageCompression");
      const compressedDataUrl = await compressImageTo100KB(file, 600, 100 * 1024);
      setPhoto(compressedDataUrl);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo;
        return next;
      });
    } catch {
      setErrors((prev) => ({ ...prev, photo: "Could not process photo" }));
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};

    if (!fullName.trim()) next.fullName = "Full name is required";
    else if (fullName.trim().length < 2) next.fullName = "Name is too short";

    if (!phone.trim()) next.phone = "Phone is required";
    else if (!/^(\+251|0)?9\d{8}$/.test(phone.replace(/\s/g, ""))) {
      next.phone = "Enter a valid Ethiopian phone number";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address";
    }

    if (!gender) {
      next.gender = "Please select your gender";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onNext({
      fullName: fullName.trim(),
      phone: phone.replace(/\s/g, ""),
      email: email.trim() || undefined,
      gender,
      studentGenderPreference,
      education: education.trim() || undefined,
      photo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo upload */}
      <div>
        <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
          Your Profile Photo
        </label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#E8F4F8] border border-[#0096D6]/30">
            {photo ? (
              <img src={photo} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#0096D6]">
                <Camera className="h-7 w-7" />
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              disabled={compressing}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5 text-gray-500" />
              {compressing ? "Processing..." : photo ? "Change photo" : "Upload photo"}
            </button>
            <p className="mt-1 text-xs text-gray-400">
              Clear face photo · Max 5 MB
            </p>
            {errors.photo && (
              <p className="mt-1 text-xs text-red-500">{errors.photo}</p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Full name & Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
            Full name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abebe Bikila"
              className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                errors.fullName ? "border-red-400" : "border-gray-300"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
            Phone number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0911234567 or +251 9..."
              className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                errors.phone ? "border-red-400" : "border-gray-300"
              }`}
            />
          </div>
          {errors.phone ? (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">Kept private from public listings</p>
          )}
        </div>
      </div>

      {/* Email & Education */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
            Email address <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tutor@example.com"
              className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
            Education background
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. BSc in Mathematics, AAU"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
          </div>
        </div>
      </div>

      {/* Gender & Student Gender Preference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
            Your Gender <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Male", "Female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-lg border py-2.5 text-center text-sm font-bold transition ${
                  gender === g
                    ? "border-[#0096D6] bg-[#0096D6] text-white shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-xs text-red-500">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
            Student Gender Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Both", label: "Both" },
              { id: "Male", label: "Boys only" },
              { id: "Female", label: "Girls only" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setStudentGenderPreference(p.id as any)}
                className={`rounded-lg border py-2.5 text-center text-xs font-bold transition ${
                  studentGenderPreference === p.id
                    ? "border-[#0096D6] bg-[#0096D6] text-white shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Helps match with family preferences
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#0096D6] py-3.5 text-sm font-black text-white shadow-md shadow-[#0096D6]/20 transition hover:bg-[#007FB8]"
      >
        Continue to Teaching Details & Documents →
      </button>
    </form>
  );
}