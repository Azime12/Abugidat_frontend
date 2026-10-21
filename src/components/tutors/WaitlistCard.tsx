"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import client from "@/lib/api-client";
import toast from "react-hot-toast";

export function WaitlistCard({
  defaultGrade = "KG",
  defaultArea = "Addis Ababa",
  defaultSubjects = "General",
  onJoined,
}: {
  defaultGrade?: string;
  defaultArea?: string;
  defaultSubjects?: string;
  onJoined?: () => void;
}) {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter your phone number to receive alerts");
      return;
    }

    try {
      setLoading(true);
      await client.post("/requests/waitlist", {
        grade_level: defaultGrade,
        area_name: defaultArea,
        subjects: defaultSubjects,
        parent_name: name.trim() || "Parent",
        parent_phone: phone.trim(),
      });
      setJoined(true);
      toast.success("Joined waitlist! We will notify you when a tutor joins.");
      if (onJoined) onJoined();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to join waitlist");
    } finally {
      setLoading(false);
    }
  };

  if (joined) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="mt-3 text-base font-bold text-[#2D2A32]">You are on the Waitlist!</h4>
        <p className="mt-1 text-xs text-gray-600 max-w-sm mx-auto">
          We’re actively recruiting tutors in <strong>{defaultArea}</strong> for grade <strong>{defaultGrade}</strong>.
          You’ll receive a message as soon as a verified tutor joins!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#0096D6]/30 bg-gradient-to-br from-[#E8F4F8] to-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0096D6] text-white shadow-md shadow-[#0096D6]/20">
          <Bell size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#006A9B]">
            <Sparkles size={13} />
            Waitlist Alert
          </div>
          <h4 className="mt-0.5 text-base font-extrabold text-[#2D2A32]">
            No verified tutor in {defaultArea} yet?
          </h4>
          <p className="mt-1 text-xs text-gray-600">
            Tap below and we’ll message you immediately when a verified tutor matching <strong>{defaultGrade}</strong> joins your area.
          </p>

          <form onSubmit={handleJoin} className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#0096D6] sm:w-40"
            />
            <input
              type="tel"
              placeholder="Phone (e.g. 0911223344)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#0096D6] sm:w-48"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0096D6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007FB8] disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
              Notify Me When Tutor Joins
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
