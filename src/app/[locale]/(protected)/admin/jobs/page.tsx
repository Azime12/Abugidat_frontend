"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2, XCircle, Loader2, Eye, MapPin, Phone,
  Calendar, DollarSign, User, Users, Briefcase, X, Lock
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  matched: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AdminJobsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const qc = useQueryClient();

  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    variant: "danger" | "warning" | "success" | "info";
    onConfirm: () => void;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => (await adminService.getJobs()).data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminService.updateJobStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Job marked as ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update job status")),
  });

  const jobs = data?.jobs ?? [];
  const filtered = jobs.filter((j: any) => {
    const text = `${j.id} ${j.parent_name || ""} ${j.parent_phone_contact || ""} ${j.student_level || ""} ${j.subjects || ""} ${j.location || ""}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterStatus && j.status !== filterStatus) return false;
    return true;
  });

  const columns: ColumnDef<any>[] = [
    {
      key: "id",
      header: "ID",
      width: "60px",
      align: "center",
      sortable: true,
      sortValue: (j) => j.id,
      render: (j) => <span className="text-xs font-mono text-gray-400">#{j.id}</span>,
    },
    {
      key: "subjects",
      header: "Position & Subjects",
      sortable: true,
      sortValue: (j) => j.subjects || "",
      render: (j) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#2D2A32]">{j.subjects || "Tutoring"}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className="font-semibold text-gray-700">{j.student_level}</span> •
            <MapPin size={11} className="text-[#0096D6]" /> {j.location || "Addis Ababa"}
          </span>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent / Contact",
      sortable: true,
      sortValue: (j) => j.parent_name || "",
      render: (j) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-gray-800">{j.parent_name || "Parent Contact"}</span>
          <span className="text-gray-500 font-mono flex items-center gap-1">
            <Phone size={10} className="text-gray-400" />
            {j.parent_phone_contact || j.parent_phone || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "rate",
      header: "Rate & Schedule",
      render: (j) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-[#0096D6]">{j.hourly_salary} ETB/hr</span>
          <span className="text-gray-500">{j.schedule || "Flexible"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (j) => j.status,
      render: (j) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            STATUS_STYLES[j.status] || "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {j.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "220px",
      render: (j) => (
        <div className="flex justify-end gap-1.5">
          <Link
            href={`/admin/jobs/${j.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            title="View full job details & applicants"
          >
            <Eye size={12} className="text-[#0096D6]" />
            Details
          </Link>
          {j.status === "pending" && (
            <>
              <button
                onClick={() =>
                  setConfirmState({
                    title: "Approve this job?",
                    message: `${j.subjects} (${j.student_level}, ${j.location || "Addis Ababa"}) will be approved and published to all tutors.`,
                    variant: "success",
                    onConfirm: () => mutation.mutate({ id: j.id, status: "approved" }),
                  })
                }
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8] disabled:opacity-50 transition"
              >
                <CheckCircle2 size={12} />
                Approve
              </button>
              <button
                onClick={() =>
                  setConfirmState({
                    title: "Reject this job?",
                    message: `${j.subjects} (${j.student_level}) will not be approved or shown to tutors.`,
                    variant: "danger",
                    onConfirm: () => mutation.mutate({ id: j.id, status: "rejected" }),
                  })
                }
                disabled={mutation.isPending}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Reject job"
              >
                <XCircle size={15} />
              </button>
            </>
          )}
          {j.status === "approved" && (
            <button
              onClick={() =>
                setConfirmState({
                  title: "Close this job?",
                  message: `Closing will stop receiving new applications and update the Telegram post to [JOB CLOSED].`,
                  variant: "warning",
                  onConfirm: () => mutation.mutate({ id: j.id, status: "closed" }),
                })
              }
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Lock size={12} />
              Close
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">Jobs & Requests</h1>
        <p className="mt-1 text-sm text-gray-500">{isLoading ? "Loading..." : `${filtered.length} shown`}</p>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(j) => j.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by subject, level, location, parent..."
        toolbarFilters={[
          { key: "status", label: "Status", options: ["pending", "approved", "matched", "rejected", "closed"] },
        ]}
        filterValues={{ status: filterStatus }}
        onFilterChange={(k, v) => {
          if (k === "status") setFilterStatus(v);
        }}
        onClearFilters={() => setFilterStatus("")}
        emptyTitle="No jobs found"
        emptyDescription="Jobs appear when parents submit tutoring requests."
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
          isLoading={mutation.isPending}
          confirmText={confirmState.variant === "success" ? "Approve" : confirmState.variant === "danger" ? "Reject" : "Confirm"}
        />
      )}
    </div>
  );
}
