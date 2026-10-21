"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const qc = useQueryClient();
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    variant: "danger" | "warning" | "success" | "info";
    onConfirm: () => void;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await adminService.getUsers()).data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminService.updateUserStatus(id, status),
    onSuccess: () => { toast.success("User updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed")),
  });

  const users = data?.users ?? [];

  const filtered = users.filter((u: any) => {
    const text = `${u.first_name} ${u.last_name} ${u.phone_number}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterRole) {
      const roles = (u.Roles || u.roles || []).map((r: any) => (r.name || r).toLowerCase());
      if (!roles.includes(filterRole.toLowerCase())) return false;
    }
    if (filterStatus) {
      const active = u.status !== "deactivated";
      if ((filterStatus === "active" && !active) || (filterStatus === "inactive" && active)) return false;
    }
    return true;
  });

  const columns: ColumnDef<any>[] = [
    { key: "index", header: "No", width: "60px", align: "center", render: (_u, i) => <span className="text-xs font-mono text-gray-400">{i + 1}</span> },
    {
      key: "name", header: "Name", sortable: true,
      sortValue: (u) => `${u.first_name} ${u.last_name}`,
      render: (u) => <span className="font-bold text-[#2D2A32]">{u.first_name} {u.last_name}</span>,
    },
    {
      key: "phone_number", header: "Phone", sortable: true,
      sortValue: (u) => u.phone_number || "",
      render: (u) => <span className="text-gray-600">{u.phone_number}</span>,
    },
    {
      key: "roles", header: "Roles",
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {(u.Roles || u.roles || []).map((r: any, idx: number) => (
            <span key={idx} className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
              {r.name || r}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status", header: "Status", sortable: true,
      sortValue: (u) => u.status || "",
      render: (u) => {
        const active = u.status !== "deactivated";
        return (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions", header: "Actions", align: "right", width: "140px",
      render: (u) => {
        const active = u.status !== "deactivated";
        return (
          <button
            onClick={() =>
                            setConfirmState({
                              title: active ? "Deactivate this user?" : "Activate this user?",
                              message: active
                                ? `${u.first_name} ${u.last_name} will lose access immediately.`
                                : `${u.first_name} ${u.last_name} will regain access.`,
                              variant: active ? "danger" : "success",
                              onConfirm: () => mutation.mutate({ id: u.user_id, status: active ? "deactivated" : "active" }),
                            })
                          }
            disabled={mutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              active ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" : "bg-[#0096D6] text-white hover:bg-[#007FB8]"
            } disabled:opacity-50`}
          >
            {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : active ? <UserX size={12} /> : <UserCheck size={12} />}
            {active ? "Deactivate" : "Activate"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">Users</h1>
        <p className="mt-1 text-sm text-gray-500">{isLoading ? "Loading..." : `${users.length} total`}</p>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(u) => u.user_id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or phone..."
        toolbarFilters={[
          { key: "role", label: "Role", options: ["admin", "user", "tutor"] },
          { key: "status", label: "Status", options: ["active", "inactive"] },
        ]}
        filterValues={{ role: filterRole, status: filterStatus }}
        onFilterChange={(k, v) => {
          if (k === "role") setFilterRole(v);
          if (k === "status") setFilterStatus(v);
        }}
        onClearFilters={() => { setFilterRole(""); setFilterStatus(""); }}
        emptyTitle="No users found"
        emptyDescription="Try clearing filters or a different search."
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
          isLoading={mutation.isPending}
          confirmText={confirmState.variant === "danger" ? "Deactivate" : "Activate"}
        />
      )}
    </div>
  );
}
