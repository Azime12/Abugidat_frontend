"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2, XCircle, Loader2, Eye, Star, Handshake,
  Briefcase, GraduationCap, MapPin, Phone, Mail, FileText,
  DollarSign, Clock, User, X
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { resolveFileUrl } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    variant: "danger" | "warning" | "success" | "info";
    onConfirm: () => void;
  } | null>(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => (await adminService.getApplications()).data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminService.updateApplicationStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Application marked as ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Action failed")),
  });

  const matchMutation = useMutation({
    mutationFn: (matchData: { job_id: number; tutor_id: number }) =>
      adminService.createMatch(matchData),
    onSuccess: () => {
      toast.success("Tutor successfully matched & assigned to job!");
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
      qc.invalidateQueries({ queryKey: ["admin", "matches"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to match tutor")),
  });

  const apps = data?.applications ?? [];
  const filtered = apps.filter((a: any) => {
    const tutorName = `${a.Tutor?.first_name || ""} ${a.Tutor?.last_name || ""}`;
    const jobSubjects = a.Job?.subjects || "";
    const jobLocation = a.Job?.location || "";
    const tutorPhone = a.Tutor?.phone_number || "";
    const text = `${a.id} ${tutorName} ${jobSubjects} ${jobLocation} ${tutorPhone}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const columns: ColumnDef<any>[] = [
    {
      key: "id",
      header: "ID",
      width: "60px",
      align: "center",
      sortable: true,
      sortValue: (a) => a.id,
      render: (a) => <span className="text-xs font-mono text-gray-400">#{a.id}</span>,
    },
    {
      key: "tutor",
      header: "Candidate Tutor",
      sortable: true,
      sortValue: (a) => `${a.Tutor?.first_name || ""} ${a.Tutor?.last_name || ""}`,
      render: (a) => {
        const name = a.Tutor ? `${a.Tutor.first_name || ""} ${a.Tutor.last_name || ""}`.trim() : `Tutor #${a.tutor_id}`;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-[#2D2A32]">{name}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={11} className="text-gray-400" />
              {a.Tutor?.phone_number || "No phone"} • {a.Tutor?.city || "Addis Ababa"}
            </span>
          </div>
        );
      },
    },
    {
      key: "job",
      header: "Position Applied For",
      sortable: true,
      sortValue: (a) => a.Job?.subjects || a.job_id,
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {a.Job?.subjects || `Job #${a.job_id}`}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={11} className="text-[#0096D6]" />
            {a.Job?.student_level ? `${a.Job.student_level} • ` : ""}
            {a.Job?.location || "Addis Ababa"}
          </span>
        </div>
      ),
    },
    {
      key: "credentials",
      header: "Credentials",
      render: (a) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              a.Tutor?.cv_file ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            CV: {a.Tutor?.cv_file ? "Yes" : "No"}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              a.Tutor?.education_file ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            Cert: {a.Tutor?.education_file ? "Yes" : "No"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (a) => a.status,
      render: (a) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            STATUS_STYLES[a.status] || "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {a.status === "approved" ? "Matched" : a.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Applied",
      sortable: true,
      sortValue: (a) => a.created_at,
      render: (a) => (
        <span className="text-xs text-gray-500">
          {new Date(a.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "220px",
      render: (a) => {
        const tutorName = a.Tutor ? `${a.Tutor.first_name} ${a.Tutor.last_name}`.trim() : `Candidate #${a.tutor_id}`;
        const jobDetails = [
          a.Job?.subjects,
          a.Job?.student_level,
          a.Job?.location,
        ].filter(Boolean).join(" · ");
        const jobLabel = `Job #${a.job_id}${jobDetails ? ` (${jobDetails})` : ""}`;

        return (
          <div className="flex justify-end gap-1.5">
            <Link
              href={`/admin/applications/${a.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              title="View full candidate profile & job details"
            >
              <Eye size={12} className="text-[#0096D6]" />
              Details
            </Link>
            {a.status === "pending" && (
              <button
                onClick={() =>
                  setConfirmState({
                    title: `Shortlist ${tutorName}?`,
                    message: `${tutorName} will be marked as shortlisted for ${jobLabel}.`,
                    variant: "info",
                    onConfirm: () => mutation.mutate({ id: a.id, status: "shortlisted" }),
                  })
                }
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                title="Shortlist applicant"
              >
                <Star size={12} />
                Shortlist
              </button>
            )}
            {a.status !== "approved" && a.status !== "rejected" && (
              <button
                onClick={() =>
                  setConfirmState({
                    title: `Match & Assign ${tutorName}?`,
                    message: `Assign ${tutorName} to ${jobLabel}? The job status will become MATCHED and the group post will be updated to [POSITION FILLED].`,
                    variant: "success",
                    onConfirm: () =>
                      matchMutation.mutate({ job_id: a.job_id, tutor_id: a.tutor_id }),
                  })
                }
                disabled={matchMutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2 py-1 text-xs font-bold text-white hover:bg-[#007FB8] transition"
                title="Match & Assign Tutor"
              >
                <Handshake size={12} />
                Match
              </button>
            )}
            {a.status !== "rejected" && a.status !== "approved" && (
              <button
                onClick={() =>
                  setConfirmState({
                    title: `Reject ${tutorName}?`,
                    message: `${tutorName} will be marked as rejected for ${jobLabel}.`,
                    variant: "danger",
                    onConfirm: () => mutation.mutate({ id: a.id, status: "rejected" }),
                  })
                }
                disabled={mutation.isPending}
                className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Reject applicant"
              >
                <XCircle size={15} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review candidates who applied for open tutoring positions. Shortlist, view credentials, and finalize matches.
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by candidate name, phone, subject, location..."
        toolbarFilters={[
          { key: "status", label: "Status", options: ["pending", "shortlisted", "approved", "rejected"] },
        ]}
        filterValues={{ status: filterStatus }}
        onFilterChange={(k, v) => {
          if (k === "status") setFilterStatus(v);
        }}
        onClearFilters={() => setFilterStatus("")}
        emptyTitle="No applications found"
        emptyDescription="Applications appear here when verified tutors apply for open positions."
      />

      {/* Confirmation Modal */}
      {confirmState && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmState(null)}
          onConfirm={() => {
            confirmState.onConfirm();
            setConfirmState(null);
          }}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          isLoading={mutation.isPending || matchMutation.isPending}
          confirmText={confirmState.variant === "success" ? "Confirm Match" : confirmState.variant === "danger" ? "Reject" : "Shortlist"}
        />
      )}
    </div>
  );
}
