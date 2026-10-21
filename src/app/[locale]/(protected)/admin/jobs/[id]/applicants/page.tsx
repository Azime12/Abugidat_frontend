"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2, XCircle, Eye, Star, Handshake, MapPin, Phone,
  ArrowLeft, Users, ExternalLink, Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function JobApplicantsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    variant: "danger" | "warning" | "success" | "info";
    onConfirm: () => void;
  } | null>(null);

  const { data: jobData } = useQuery({
    queryKey: ["admin", "job", id],
    queryFn: async () => (await adminService.getJobById(id)).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "job", id, "applications"],
    queryFn: async () => (await adminService.getApplications()).data,
  });

  const mutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: string }) =>
      adminService.updateApplicationStatus(appId, status),
    onSuccess: (_, vars) => {
      toast.success(`Application marked as ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "job", id, "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "job", id] });
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Action failed")),
  });

  const matchMutation = useMutation({
    mutationFn: (matchData: { job_id: number; tutor_id: number }) =>
      adminService.createMatch(matchData),
    onSuccess: () => {
      toast.success("Tutor successfully matched & assigned to job!");
      qc.invalidateQueries({ queryKey: ["admin", "job", id, "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "job", id] });
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
      qc.invalidateQueries({ queryKey: ["admin", "matches"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to match tutor")),
  });

  const job = jobData?.job;
  const apps = (data?.applications ?? []).filter(
    (a: any) => String(a.job_id) === String(id)
  );

  const counts = {
    pending: apps.filter((a: any) => a.status === "pending").length,
    shortlisted: apps.filter((a: any) => a.status === "shortlisted").length,
    matched: apps.filter((a: any) => a.status === "approved").length,
    rejected: apps.filter((a: any) => a.status === "rejected").length,
  };

  const filtered = apps.filter((a: any) => {
    const tutorName = `${a.Tutor?.first_name || ""} ${a.Tutor?.last_name || ""}`;
    const tutorPhone = a.Tutor?.phone_number || "";
    const text = `${a.id} ${tutorName} ${tutorPhone}`.toLowerCase();
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
        const name = a.Tutor
          ? `${a.Tutor.first_name || ""} ${a.Tutor.last_name || ""}`.trim()
          : `Tutor #${a.tutor_id}`;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-[#2D2A32]">{name}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={11} className="text-gray-400" />
              {a.Tutor?.phone_number || "No phone"} · {a.Tutor?.city || "Addis Ababa"}
            </span>
          </div>
        );
      },
    },
    {
      key: "credentials",
      header: "Credentials",
      render: (a) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${a.Tutor?.cv_file ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            CV: {a.Tutor?.cv_file ? "Yes" : "No"}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${a.Tutor?.education_file ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
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
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[a.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
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
        const tutorName = a.Tutor
          ? `${a.Tutor.first_name} ${a.Tutor.last_name}`.trim()
          : `Candidate #${a.tutor_id}`;
        return (
          <div className="flex justify-end gap-1.5">
            <Link
              href={`/admin/applications/${a.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Eye size={12} className="text-[#0096D6]" />
              Details
            </Link>
            {a.status === "pending" && (
              <button
                onClick={() =>
                  setConfirmState({
                    title: `Shortlist ${tutorName}?`,
                    message: `${tutorName} will be marked as shortlisted for this job.`,
                    variant: "info",
                    onConfirm: () => mutation.mutate({ appId: a.id, status: "shortlisted" }),
                  })
                }
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
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
                    message: `Assign ${tutorName} to this job. The job will become MATCHED and the Telegram post updated to [POSITION FILLED].`,
                    variant: "success",
                    onConfirm: () => matchMutation.mutate({ job_id: a.job_id, tutor_id: a.tutor_id }),
                  })
                }
                disabled={matchMutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2 py-1 text-xs font-bold text-white hover:bg-[#007FB8] transition"
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
                    message: `${tutorName} will be marked as rejected for this job.`,
                    variant: "danger",
                    onConfirm: () => mutation.mutate({ appId: a.id, status: "rejected" }),
                  })
                }
                disabled={mutation.isPending}
                className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
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
    <div className="space-y-5 pb-12">
      <Link
        href={`/admin/jobs/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0096D6]"
      >
        <ArrowLeft size={14} />
        Back to Job #{id}
      </Link>

      {job && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-[#2D2A32] flex items-center gap-2">
                <Users className="text-[#0096D6]" size={24} />
                Applicants — {job.subjects}
              </h1>
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} /> {job.student_level}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {job.location || "Addis Ababa"}
                </span>
                <span className="font-semibold text-[#0096D6]">
                  {apps.length} applicant{apps.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
            <Link
              href={`/admin/jobs/${id}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink size={12} /> Job Details
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-2.5 text-center">
              <p className="text-[10px] font-bold text-amber-700 uppercase">Pending</p>
              <p className="text-xl font-black text-amber-700">{counts.pending}</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5 text-center">
              <p className="text-[10px] font-bold text-blue-700 uppercase">Shortlisted</p>
              <p className="text-xl font-black text-blue-700">{counts.shortlisted}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5 text-center">
              <p className="text-[10px] font-bold text-emerald-700 uppercase">Matched</p>
              <p className="text-xl font-black text-emerald-700">{counts.matched}</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-2.5 text-center">
              <p className="text-[10px] font-bold text-red-700 uppercase">Rejected</p>
              <p className="text-xl font-black text-red-700">{counts.rejected}</p>
            </div>
          </div>
        </div>
      )}

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by candidate name or phone..."
        toolbarFilters={[
          { key: "status", label: "Status", options: ["pending", "shortlisted", "approved", "rejected"] },
        ]}
        filterValues={{ status: filterStatus }}
        onFilterChange={(k, v) => {
          if (k === "status") setFilterStatus(v);
        }}
        onClearFilters={() => setFilterStatus("")}
        emptyTitle="No applicants yet"
        emptyDescription="Applications appear here when tutors apply for this job."
      />

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
          confirmText={
            confirmState.variant === "success"
              ? "Confirm Match"
              : confirmState.variant === "danger"
                ? "Reject"
                : "Shortlist"
          }
        />
      )}
    </div>
  );
}