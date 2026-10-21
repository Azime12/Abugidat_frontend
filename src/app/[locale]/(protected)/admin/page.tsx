"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { GraduationCap, Briefcase, Users, Handshake } from "lucide-react";

function StatCard({ label, sub, value, icon: Icon }: { label: string; sub: string; value: number | string; icon: any }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <Icon className="mx-auto h-6 w-6 text-[#0096D6]" />
      <p className="mt-3 text-5xl font-black text-[#0096D6]">{value}</p>
      <p className="mt-2 text-sm font-bold text-gray-700">{label}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await adminService.getStats()).data,
  });

  const stats = data?.stats || {};
  const jobs = stats.jobs || {};
  const tutors = stats.tutors || {};
  const apps = stats.applications || {};
  const matches = stats.matches || {};
  const recent = stats.recentActivity || [];
  const show = (v: number | undefined) => isLoading ? "…" : (v ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard label="Verified Tutors" sub="All accounts" value={show(tutors.total)} icon={GraduationCap} />
        <StatCard label="Total Jobs" sub={`${jobs.pending ?? 0} pending`} value={show(jobs.total)} icon={Briefcase} />
        <StatCard label="Pending Apps" sub="Awaiting review" value={show(apps.pending)} icon={Users} />
        <StatCard label="Confirmed Matches" sub={`${matches.total ?? 0} total`} value={show(matches.total)} icon={Handshake} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-bold text-[#2D2A32]">Recent activity</h3>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No recent activity</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {recent.slice(0, 5).map((log: any) => (
              <li key={log.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-[#2D2A32]">
                  {log.action} — {log.entity_type} #{log.entity_id}
                </span>
                <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
