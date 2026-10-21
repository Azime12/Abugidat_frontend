"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2, XCircle, Loader2, Search, Ban, Eye,
  FileText, GraduationCap, MapPin, Phone, Mail, DollarSign,
  Building2, Star, User, X
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import client from "@/lib/api-client";

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", class: "bg-red-50 text-red-700 border-red-200" },
  hidden: { label: "Hidden", class: "bg-gray-100 text-gray-700 border-gray-200" },
};

export default function AdminTutorsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [confirmState, setConfirmState] = useState<{
    tutor: any;
    action: "approved" | "rejected" | "hidden";
  } | null>(null);

  const qc = useQueryClient();
  const { user } = useAuth();
  const u = user as any;
  const isAdmin = (u?.roles ?? []).includes("admin");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tutors"],
    queryFn: async () => (await adminService.getTutors()).data,
    enabled: isAdmin,
  });

  const { data: agentsData } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: async () => (await adminService.getAgents()).data,
    enabled: isAdmin,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      client.patch(`/tutors/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      const msg =
        vars.status === "approved"
          ? "Tutor approved. 10 Kulf granted."
          : vars.status === "rejected"
            ? "Tutor rejected."
            : "Tutor hidden from public listing.";
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin", "tutors"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update tutor")),
  });

  const assignAgentMutation = useMutation({
    mutationFn: ({ tutorId, agentId }: { tutorId: number; agentId: number | null }) =>
      adminService.assignTutorToAgent(tutorId, agentId),
    onSuccess: () => {
      toast.success("Agent assigned successfully");
      qc.invalidateQueries({ queryKey: ["admin", "tutors"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to assign agent")),
  });

  const tutors = data?.tutors ?? [];

  const filtered = tutors.filter((t: any) => {
    if (filter && t.status !== filter) return false;
    if (!search) return true;
    const text = `${t.first_name} ${t.last_name} ${t.phone_number} ${t.subjects} ${t.city || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const counts = {
    pending: tutors.filter((t: any) => t.status === "pending").length,
    approved: tutors.filter((t: any) => t.status === "approved").length,
    rejected: tutors.filter((t: any) => t.status === "rejected").length,
    hidden: tutors.filter((t: any) => t.status === "hidden").length,
  };

  const agentsList = agentsData?.agents ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">
          Tutors
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve tutors to grant 10 free Kulf, inspect CVs/certificates, and assign recruiter agents.
        </p>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "pending", label: "Pending", count: counts.pending },
          { id: "approved", label: "Approved", count: counts.approved },
          { id: "rejected", label: "Rejected", count: counts.rejected },
          { id: "hidden", label: "Hidden", count: counts.hidden },
          { id: "", label: "All", count: tutors.length },
        ].map((s) => (
          <button
            key={s.id || "all"}
            onClick={() => setFilter(s.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === s.id
                ? "bg-[#0096D6] text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {s.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                filter === s.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, city, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-[#2D2A32]">No {filter || ""} tutors</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === "pending" ? "All tutors have been reviewed." : "Nothing to show here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Tutor Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Subjects</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3 text-right">Kulf</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t: any) => {
                  const badge = STATUS_BADGE[t.status] || STATUS_BADGE.pending;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-[#2D2A32]">
                          {t.first_name} {t.last_name}
                        </p>
                        <p className="text-xs text-gray-400">ID #{t.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.phone_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {t.subjects || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.city || "Addis Ababa"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {t.agent?.name || t.agent_name ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#0096D6]">
                            <Building2 size={12} />
                            {t.agent?.name || t.agent_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">Direct</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-[#0096D6]">
                          {t.kulf_balance ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link
                            href={`/admin/tutors/${t.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                            title="View full profile, CV, and details"
                          >
                            <Eye size={12} className="text-[#0096D6]" />
                            Profile
                          </Link>
                          {t.status === "pending" && (
                            <>
                              <button
                                onClick={() => setConfirmState({ tutor: t, action: "approved" })}
                                disabled={mutation.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8] disabled:opacity-50 transition"
                                title="Approve — grants 10 free Kulf"
                              >
                                {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                Approve
                              </button>
                              <button
                                onClick={() => setConfirmState({ tutor: t, action: "rejected" })}
                                disabled={mutation.isPending}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                title="Reject tutor"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          {t.status === "approved" && (
                            <button
                              onClick={() => setConfirmState({ tutor: t, action: "hidden" })}
                              disabled={mutation.isPending}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                              title="Hide from public view"
                            >
                              <Ban size={12} />
                              Hide
                            </button>
                          )}
                          {(t.status === "rejected" || t.status === "hidden") && (
                            <button
                              onClick={() => setConfirmState({ tutor: t, action: "approved" })}
                              disabled={mutation.isPending}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8] disabled:opacity-50 transition"
                            >
                              <CheckCircle2 size={12} />
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmState && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmState(null)}
          onConfirm={() => {
            mutation.mutate({
              id: confirmState.tutor.id,
              status: confirmState.action,
            });
            setConfirmState(null);
          }}
          title={
            confirmState.action === "approved"
              ? "Approve this tutor?"
              : confirmState.action === "rejected"
                ? "Reject this tutor?"
                : "Hide this tutor?"
          }
          message={
            confirmState.action === "approved"
              ? `${confirmState.tutor.first_name} ${confirmState.tutor.last_name} will be approved and granted 10 free Kulf.`
              : confirmState.action === "rejected"
                ? `${confirmState.tutor.first_name} ${confirmState.tutor.last_name} will be rejected and notified.`
                : `${confirmState.tutor.first_name} ${confirmState.tutor.last_name} will be hidden from public tutor search.`
          }
          variant={confirmState.action === "rejected" ? "danger" : confirmState.action === "hidden" ? "warning" : "success"}
          isLoading={mutation.isPending}
          confirmText={
            confirmState.action === "approved"
              ? "Approve & Grant 10 Kulf"
              : confirmState.action === "rejected"
                ? "Reject"
                : "Hide"
          }
        />
      )}
    </div>
  );
}
