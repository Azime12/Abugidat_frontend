"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/lib/api-client";
import {
  X,
  Star,
  CheckCircle2,
  XCircle,
  Ban,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { resolveFileUrl } from "@/lib/utils";

const TutorPinPicker = dynamic(
  () => import("@/components/tutors/TutorPinPicker").then((m) => m.TutorPinPicker),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100" /> }
);

interface TutorDetailModalProps {
  tutorId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function TutorDetailModal({
  tutorId,
  isOpen,
  onClose,
  onRefresh,
}: TutorDetailModalProps) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "location" | "ledger" | "agent">("profile");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tutor", tutorId],
    queryFn: async () => {
      if (!tutorId) return null;
      const res = await client.get(`/tutors/${tutorId}`);
      return res.data?.tutor;
    },
    enabled: isOpen && !!tutorId,
  });

  const { data: agentsData } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: async () => {
      const res = await client.get("/agents");
      return res.data?.agents || [];
    },
    enabled: isOpen,
  });

  const tutor = data;
  const agents = agentsData || [];

  const featuredMutation = useMutation({
    mutationFn: async (is_featured: boolean) => {
      if (!tutorId) return;
      await client.patch(`/tutors/${tutorId}/featured`, { is_featured });
    },
    onSuccess: (_, is_featured) => {
      toast.success(is_featured ? "Tutor marked as Featured (⭐)" : "Tutor unfeatured");
      qc.invalidateQueries({ queryKey: ["admin", "tutor", tutorId] });
      qc.invalidateQueries({ queryKey: ["admin", "tutors"] });
      if (onRefresh) onRefresh();
    },
    onError: () => toast.error("Failed to update featured status"),
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!tutorId) return;
      await client.patch(`/tutors/${tutorId}/status`, { status });
    },
    onSuccess: (_, status) => {
      toast.success(`Tutor ${status === "approved" ? "approved (+10 free Kulf)" : status}`);
      qc.invalidateQueries({ queryKey: ["admin", "tutor", tutorId] });
      qc.invalidateQueries({ queryKey: ["admin", "tutors"] });
      if (onRefresh) onRefresh();
    },
    onError: () => toast.error("Failed to update status"),
  });

  const agentMutation = useMutation({
    mutationFn: async (agent_id: number | null) => {
      if (!tutorId) return;
      await client.post(`/agents/assign-tutor`, { tutor_id: tutorId, agent_id });
    },
    onSuccess: () => {
      toast.success("Partner agent assigned");
      qc.invalidateQueries({ queryKey: ["admin", "tutor", tutorId] });
      qc.invalidateQueries({ queryKey: ["admin", "tutors"] });
      if (onRefresh) onRefresh();
    },
    onError: () => toast.error("Failed to assign agent"),
  });

  if (!isOpen || !tutorId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0096D6] font-extrabold text-white text-base shadow-sm">
              {tutor?.first_name?.[0] || "T"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#2D2A32]">
                  {tutor ? `${tutor.first_name} ${tutor.last_name || ""}` : "Loading..."}
                </h2>
                {tutor?.is_featured && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                    ⭐ FEATURED
                  </span>
                )}
                {tutor?.status && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      tutor.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : tutor.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tutor.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Tutor #{tutor?.id} · Telegram ID: {tutor?.telegram_id || "None"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action bar */}
        {tutor && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-6 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => featuredMutation.mutate(!tutor.is_featured)}
                disabled={featuredMutation.isPending}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-bold transition ${
                  tutor.is_featured
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Star size={13} className={tutor.is_featured ? "fill-amber-500 text-amber-500" : ""} />
                {tutor.is_featured ? "Featured Tutor" : "Make Featured ⭐"}
              </button>

              <div className="h-4 w-px bg-gray-200" />
              <span className="text-gray-500">
                Kulf Balance: <strong className="text-[#0096D6]">{tutor.kulf_balance || 0}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {tutor.status !== "approved" && (
                <button
                  onClick={() => statusMutation.mutate("approved")}
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={13} />
                  Approve (+10 Kulf)
                </button>
              )}
              {tutor.status === "approved" && (
                <button
                  onClick={() => statusMutation.mutate("hidden")}
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Ban size={13} />
                  Hide Profile
                </button>
              )}
              {tutor.status === "pending" && (
                <button
                  onClick={() => statusMutation.mutate("rejected")}
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={13} />
                  Reject
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab selection */}
        <div className="flex border-b border-gray-200 px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 border-b-2 transition ${
              activeTab === "profile"
                ? "border-[#0096D6] text-[#0096D6]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Full Profile
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`py-3 border-b-2 transition ${
              activeTab === "location"
                ? "border-[#0096D6] text-[#0096D6]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Base Point & Snapping
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`py-3 border-b-2 transition ${
              activeTab === "ledger"
                ? "border-[#0096D6] text-[#0096D6]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Kulf Ledger ({tutor?.kulfLedger?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`py-3 border-b-2 transition ${
              activeTab === "agent"
                ? "border-[#0096D6] text-[#0096D6]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Partner Agent
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#0096D6]" />
            </div>
          ) : !tutor ? (
            <p className="text-center text-sm text-gray-500">Tutor not found</p>
          ) : (
            <>
              {/* TAB 1: FULL PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Contact & Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Contact Info
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        <span className="font-semibold">{tutor.phone_number || "No phone"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={14} className="text-gray-400" />
                        <span>{tutor.email || "No email"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{tutor.city || "Addis Ababa"}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Tutoring Details
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <DollarSign size={14} className="text-gray-400" />
                        <span>
                          Rate: <strong>{tutor.hourly_rate || 300} ETB/hr</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Briefcase size={14} className="text-gray-400" />
                        <span>Mode: {tutor.teaching_mode || "In-person / Both"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <ShieldCheck size={14} className="text-gray-400" />
                        <span>Referral Code: <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">{tutor.referral_code || "None"}</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects & Grades */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Subjects & Grade Levels
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(tutor.subjects || "General")
                        .split(",")
                        .map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-[#E8F4F8] px-2.5 py-1 text-xs font-semibold text-[#006A9B]"
                          >
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Grades:</strong> {tutor.grade_levels || "All grades"}
                    </p>
                  </div>

                  {/* Bio & Experience */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Experience & Bio
                    </h4>
                    <div className="rounded-xl border border-gray-200 bg-white p-3.5 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                      {tutor.bio || tutor.experience || "No bio entered yet."}
                    </div>
                  </div>

                  {/* Education & Credentials */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Education & Document Attachments
                    </h4>
                    <div className="rounded-xl border border-gray-200 p-3.5 text-xs text-gray-700 space-y-2">
                      <p><strong>Education:</strong> {tutor.education || "Not specified"}</p>
                      <div className="flex gap-4 pt-1">
                        {tutor.cv_file ? (
                          <a
                            href={resolveFileUrl(tutor.cv_file)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-[#0096D6] hover:underline"
                          >
                            <FileText size={14} /> View Attached CV
                          </a>
                        ) : (
                          <span className="text-gray-400">No CV attached</span>
                        )}
                        {tutor.education_file ? (
                          <a
                            href={resolveFileUrl(tutor.education_file)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-[#0096D6] hover:underline"
                          >
                            <GraduationCap size={14} /> View Degree / Certificate
                          </a>
                        ) : (
                          <span className="text-gray-400">No certificate attached</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOCATION & PIN PICKER */}
              {activeTab === "location" && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-600">
                    Current coordinates in database:{" "}
                    <strong>
                      {tutor.latitude ? `${tutor.latitude}, ${tutor.longitude}` : "Not set"}
                    </strong>{" "}
                    (Neighborhood center / snapped grid point).
                  </div>
                  <TutorPinPicker
                    tutorId={tutor.id}
                    initialLat={tutor.latitude ? parseFloat(tutor.latitude) : 9.0180}
                    initialLng={tutor.longitude ? parseFloat(tutor.longitude) : 38.7670}
                    onSaved={() => {
                      qc.invalidateQueries({ queryKey: ["admin", "tutor", tutorId] });
                    }}
                  />
                </div>
              )}

              {/* TAB 3: KULF LEDGER */}
              {activeTab === "ledger" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Balance is calculated from transaction ledger lines.
                    </p>
                    <span className="rounded-lg bg-[#E8F4F8] px-3 py-1 text-xs font-bold text-[#006A9B]">
                      Current: {tutor.kulf_balance || 0} Kulf
                    </span>
                  </div>

                  {(!tutor.kulfLedger || tutor.kulfLedger.length === 0) ? (
                    <p className="py-8 text-center text-xs text-gray-400">
                      No ledger transactions found.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-500 text-[10px]">
                          <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2 text-right">Balance After</th>
                            <th className="px-3 py-2">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {tutor.kulfLedger.map((row: any) => (
                            <tr key={row.id}>
                              <td className="px-3 py-2 text-gray-500">
                                {new Date(row.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2 font-bold uppercase text-[10px]">
                                <span
                                  className={`rounded px-1.5 py-0.5 ${
                                    row.type === "free" || row.type === "bought" || row.type === "refund"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {row.type}
                                </span>
                              </td>
                              <td
                                className={`px-3 py-2 text-right font-bold ${
                                  row.amount > 0 ? "text-green-600" : "text-amber-600"
                                }`}
                              >
                                {row.amount > 0 ? `+${row.amount}` : row.amount}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-800">
                                {row.balance_after}
                              </td>
                              <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                                {row.note || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PARTNER AGENT */}
              {activeTab === "agent" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-700">Currently Assigned Agent:</p>
                    {tutor.agent ? (
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-[#0096D6]" />
                        <div>
                          <p className="font-bold text-sm text-[#2D2A32]">{tutor.agent.name}</p>
                          <p className="text-xs text-gray-500">
                            {tutor.agent.agency_name || "Independent Agent"} · Phone: {tutor.agent.phone || "—"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No partner agent assigned (Direct platform tutor).</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-[#2D2A32]">
                      Assign / Reassign Partner Agent:
                    </label>
                    <select
                      value={tutor.agent_id || ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        agentMutation.mutate(val);
                      }}
                      disabled={agentMutation.isPending}
                      className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs outline-none focus:border-[#0096D6]"
                    >
                      <option value="">None (Direct tutor)</option>
                      {agents.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.agency_name || "Agent"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
