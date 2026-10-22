"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { Loader2, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Amharic", "Science", "History", "Geography", "Coding"];
const GRADES = ["KG", "1-4", "5-8", "9-10", "11-12", "Uni"];
const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "abugida_bot";

export default function TutorProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["tutor", "me"],
    queryFn: async () => (await tutorDashboardService.me()).data,
  });

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone_number: "", city: "",
    subjects: [] as string[], grade_levels: [] as string[],
    teaching_mode: "Both", hourly_rate: 300, experience: "",
  });

  useEffect(() => {
    if (data?.tutor) {
      const t = data.tutor;
      setForm({
        first_name: t.first_name || "",
        last_name: t.last_name || "",
        phone_number: t.phone_number || "",
        city: t.city || "Addis Ababa",
        subjects: Array.isArray(t.subjects) ? t.subjects : (t.subjects ? t.subjects.split(",").map((s: string) => s.trim()) : []),
        grade_levels: Array.isArray(t.grade_levels) ? t.grade_levels : (t.grade_levels ? t.grade_levels.split(",").map((s: string) => s.trim()) : []),
        teaching_mode: t.teaching_mode || "Both",
        hourly_rate: Number(t.hourly_rate) || 300,
        experience: t.experience || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => tutorDashboardService.updateProfile({
      ...form,
      subjects: form.subjects.join(", "),
      grade_levels: form.grade_levels.join(", "),
    }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["tutor", "me"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save")),
  });

  const toggle = (arr: string[], val: string, key: "subjects" | "grade_levels") => {
    setForm((f) => ({
      ...f,
      [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
    }));
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Parents see this information when browsing tutors.</p>
      </div>

      {/* P5-7 — connect Telegram so the tutor gets match + job notifications */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#0096D6]/20 bg-[#E8F4F8] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#0096D6] p-2 text-white">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2D2A32]">Connect your Telegram</h2>
            <p className="text-xs text-gray-600">
              Get job alerts, match updates, and admin messages straight to Telegram.
            </p>
          </div>
        </div>
        <a
          href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-[#0096D6] px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#007FB8]"
        >
          Connect Telegram
        </a>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">First name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Last name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Phone</label>
            <input
              type="text"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Subjects</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const active = form.subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(form.subjects, s, "subjects")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "border-[#0096D6] bg-[#0096D6] text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Grade levels</label>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => {
              const active = form.grade_levels.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle(form.grade_levels, g, "grade_levels")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "border-[#0096D6] bg-[#0096D6] text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {g === "Uni" ? "University" : `Grade ${g}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Teaching mode</label>
            <select
              value={form.teaching_mode}
              onChange={(e) => setForm({ ...form, teaching_mode: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6]"
            >
              <option value="In-person">In-person</option>
              <option value="Online">Online</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Hourly rate (ETB)</label>
            <input
              type="number"
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
              min={100}
              max={2000}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Bio</label>
          <textarea
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            rows={4}
            placeholder="Tell parents about your experience, teaching style, and what makes you a great tutor..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
