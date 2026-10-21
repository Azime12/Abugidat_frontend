"use client";

import { useQuery } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { Link } from "@/i18n/routing";
import {
  User, Briefcase, FileText, Wallet, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";

export default function TutorDashboardPage() {
  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ["tutor", "me"],
    queryFn: async () => (await tutorDashboardService.me()).data,
  });

  const { data: balanceData } = useQuery({
    queryKey: ["kulf", "balance"],
    queryFn: async () => (await tutorDashboardService.kulfBalance()).data,
  });

  const { data: appsData } = useQuery({
    queryKey: ["tutor", "applications"],
    queryFn: async () => (await tutorDashboardService.listApplications()).data,
  });

  const { data: jobsData } = useQuery({
    queryKey: ["tutor", "jobs"],
    queryFn: async () => (await tutorDashboardService.listJobs()).data,
  });

  const tutor = meData?.tutor || {};
  const balance = balanceData?.balance ?? 0;
  const apps = appsData?.applications ?? [];
  const jobs = jobsData?.jobs ?? [];
  const isRegistered = !!tutor.is_registered;

  const pendingApps = apps.filter((a: any) => a.status === "pending").length;
  const shortlisted = apps.filter((a: any) => a.status === "shortlisted").length;

  if (meLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">
          Welcome, {tutor.first_name || "Tutor"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isRegistered ? "Your profile is complete and visible to parents." : "Complete your profile to start receiving job matches."}
        </p>
      </div>

      {/* Profile completion banner */}
      {!isRegistered && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">Profile incomplete</p>
              <p className="mt-1 text-xs text-amber-800">
                Fill in your subjects, grades, and bio so parents can find you.
              </p>
              <Link
                href="/tutor/profile"
                className="mt-3 inline-block rounded-lg bg-[#0096D6] px-4 py-2 text-xs font-bold text-white hover:bg-[#007FB8]"
              >
                Complete profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {isRegistered && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-bold text-green-900">Profile complete</p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Wallet size={14} /> Kulf
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#0096D6]">{balance}</p>
          <Link href="/tutor/kulf" className="mt-2 inline-block text-xs font-bold text-[#0096D6] hover:underline">
            Buy more →
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Briefcase size={14} /> Available Jobs
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#2D2A32]">{jobs.length}</p>
          <Link href="/tutor/jobs" className="mt-2 inline-block text-xs font-bold text-[#0096D6] hover:underline">
            Browse jobs →
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText size={14} /> Pending Apps
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-600">{pendingApps}</p>
          <Link href="/tutor/applications" className="mt-2 inline-block text-xs font-bold text-[#0096D6] hover:underline">
            View all →
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 size={14} /> Shortlisted
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-green-600">{shortlisted}</p>
          <Link href="/tutor/applications" className="mt-2 inline-block text-xs font-bold text-[#0096D6] hover:underline">
            View all →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-bold text-[#2D2A32]">Quick actions</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link href="/tutor/jobs" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <Briefcase size={16} /> Browse jobs
          </Link>
          <Link href="/tutor/kulf" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <Wallet size={16} /> Kulf wallet
          </Link>
          <Link href="/tutor/profile" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <User size={16} /> Edit profile
          </Link>
        </div>
      </div>
    </div>
  );
}
