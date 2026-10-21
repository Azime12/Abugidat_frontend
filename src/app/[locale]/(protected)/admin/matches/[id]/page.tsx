"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  Handshake,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function MatchDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "matches"],
    queryFn: async () => (await adminService.getMatches()).data,
  });

  const matches = data?.matches || [];
  const match = matches.find((m: any) => String(m.id) === String(id));

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0096D6] border-t-transparent" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-gray-900">Match Record Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The requested match agreement #{id} could not be located.
        </p>
        <Link
          href="/admin/matches"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Matches
        </Link>
      </div>
    );
  }

  const job = match.Job || {};
  const tutor = match.Tutor || {};
  const tutorName = `${tutor.first_name || ""} ${tutor.last_name || ""}`.trim() || `Tutor #${match.tutor_id}`;
  const commission = parseFloat(match.commission) || 0;
  const isCollected = match.billing_status === "collected";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/matches"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Matches List
        </Link>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Match #{match.id}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              isCollected
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            {isCollected ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {isCollected ? "Commission Collected" : "Pending Collection"}
          </span>
        </div>
      </div>

      {/* Header Banner Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0096D6] shadow-sm">
              <Handshake className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Placement & Match Agreement
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Finalized on {match.created_at ? new Date(match.created_at).toLocaleDateString() : "Recent"}
                {match.due_date && ` • Payment Due: ${match.due_date}`}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3 text-right">
            <span className="text-[11px] font-bold uppercase text-[#006A9B] block">
              Platform Commission
            </span>
            <span className="text-2xl font-black text-[#0096D6]">
              {commission.toFixed(0)} ETB
            </span>
          </div>
        </div>
      </div>

      {/* Two columns: Assigned Job vs Assigned Tutor */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Job Card */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Tutoring Position</h2>
                <p className="text-xs text-gray-400">Job #{job.id || match.job_id}</p>
              </div>
            </div>

            <Link
              href={`/admin/jobs/${job.id || match.job_id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0096D6] hover:underline"
            >
              Job View <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Subjects:</span>
              <span className="font-bold text-gray-800">{job.subjects || "Tutoring"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Student Level:</span>
              <span className="font-bold text-gray-800">{job.student_level || "Any"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Location:</span>
              <span className="font-bold text-gray-800">{job.location || "Addis Ababa"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Offered Salary:</span>
              <span className="font-bold text-emerald-700">
                {job.hourly_salary ? `${job.hourly_salary} ETB/hr` : "Negotiated"}
              </span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Parent Contact:</span>
              <span className="font-bold text-gray-800">{job.parent_name || "Parent Contact"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Parent Phone:</span>
              <span className="font-bold text-gray-800 font-mono">
                {job.parent_phone || job.parent_phone_contact || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Tutor Card */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0096D6]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{tutorName}</h2>
                <p className="text-xs text-gray-400">Tutor #{tutor.id || match.tutor_id}</p>
              </div>
            </div>

            <Link
              href={`/admin/tutors/${tutor.id || match.tutor_id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0096D6] hover:underline"
            >
              Profile View <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Phone Number:</span>
              <span className="font-bold text-gray-800 font-mono">{tutor.phone_number || "—"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Email:</span>
              <span className="font-bold text-gray-800 truncate">{tutor.email || "—"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">City:</span>
              <span className="font-bold text-gray-800">{tutor.city || "Addis Ababa"}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Kulf Balance:</span>
              <span className="font-bold text-[#0096D6]">{tutor.kulf_balance ?? 0} Credits</span>
            </div>
            <div className="col-span-2 rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 block">Tutor Subjects:</span>
              <span className="font-bold text-gray-800">{tutor.subjects || "General"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown & Terms Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#0096D6]" /> Billing & Financial Terms
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
            <span className="text-gray-400 block">Session Duration</span>
            <p className="mt-1 font-bold text-gray-800">
              {match.hours_per_session || 2} hours / session
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
            <span className="text-gray-400 block">Frequency</span>
            <p className="mt-1 font-bold text-gray-800">
              {match.sessions_per_week || 3} sessions / week
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
            <span className="text-gray-400 block">Due Date</span>
            <p className="mt-1 font-bold text-gray-800">
              {match.due_date || "30 days from match"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
            <span className="text-gray-400 block">Commission Rate</span>
            <p className="mt-1 font-bold text-[#0096D6]">
              60% of First Month
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-[#E8F4F8]/50 border border-blue-100 rounded-xl p-3">
          <ShieldCheck className="h-4 w-4 text-[#0096D6] shrink-0" />
          <span>
            Commission is automatically billed to the tutor based on the agreed terms. Payment status updates will reflect in the Commission Ledger.
          </span>
        </div>
      </div>
    </div>
  );
}
