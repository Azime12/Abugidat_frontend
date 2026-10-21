"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import {
  Building2, Users, KeyRound, Handshake, Plus, Search,
  Edit2, Eye, CheckCircle2, XCircle, Phone, Send, Loader2, X
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

export default function AdminAgentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formAgency, setFormAgency] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTelegram, setFormTelegram] = useState("");

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: async () => (await adminService.getAgents()).data,
  });

  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["admin", "agents", selectedAgentId],
    queryFn: async () => (await adminService.getAgentById(selectedAgentId!)).data,
    enabled: !!selectedAgentId,
  });

  const createMutation = useMutation({
    mutationFn: (newAgent: any) => adminService.createAgent(newAgent),
    onSuccess: () => {
      toast.success("Partner agent created successfully");
      setIsCreateOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "agents"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create agent")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminService.updateAgent(id, data),
    onSuccess: () => {
      toast.success("Agent updated successfully");
      setEditingAgent(null);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "agents"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update agent")),
  });

  const resetForm = () => {
    setFormName("");
    setFormAgency("");
    setFormPhone("");
    setFormTelegram("");
  };

  const openEditModal = (agent: any) => {
    setEditingAgent(agent);
    setFormName(agent.name || "");
    setFormAgency(agent.agency_name || "");
    setFormPhone(agent.phone || "");
    setFormTelegram(agent.telegram_id || "");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Agent name is required");
      return;
    }

    const payload = {
      name: formName.trim(),
      agency_name: formAgency.trim() || undefined,
      phone: formPhone.trim() || undefined,
      telegram_id: formTelegram.trim() || undefined,
    };

    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const agents = data?.agents ?? [];
  const filtered = agents.filter((a: any) => {
    const text = `${a.name} ${a.agency_name || ""} ${a.phone || ""} ${a.telegram_id || ""}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterStatus === "active" && !a.active) return false;
    if (filterStatus === "inactive" && a.active) return false;
    return true;
  });

  const totalAgents = agents.length;
  const totalActive = agents.filter((a: any) => a.active).length;
  const totalTutorsManaged = agents.reduce((acc: number, a: any) => acc + (a.tutors_count || 0), 0);
  const totalUnlocks = agents.reduce((acc: number, a: any) => acc + (a.unlocks_count || 0), 0);

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
      key: "name",
      header: "Agent / Agency",
      sortable: true,
      sortValue: (a) => a.name,
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#2D2A32]">{a.name}</span>
          {a.agency_name ? (
            <span className="text-xs text-[#0096D6] font-medium flex items-center gap-1">
              <Building2 size={12} />
              {a.agency_name}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Individual Agent</span>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (a) => (
        <div className="flex flex-col text-xs text-gray-600 gap-0.5">
          {a.phone && (
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-gray-400" />
              {a.phone}
            </span>
          )}
          {a.telegram_id && (
            <span className="flex items-center gap-1 text-gray-500 font-mono">
              <Send size={11} className="text-blue-400" />
              ID: {a.telegram_id}
            </span>
          )}
          {!a.phone && !a.telegram_id && <span className="text-gray-400">—</span>}
        </div>
      ),
    },
    {
      key: "tutors_count",
      header: "Tutors Managed",
      align: "center",
      sortable: true,
      sortValue: (a) => a.tutors_count || 0,
      render: (a) => (
        <div className="flex flex-col items-center">
          <span className="font-bold text-gray-800">{a.tutors_count || 0}</span>
          <span className="text-[11px] text-emerald-600 font-medium">
            {a.active_tutors_count || 0} active
          </span>
        </div>
      ),
    },
    {
      key: "activity",
      header: "Unlocks / Matches",
      align: "center",
      render: (a) => (
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-700">
            <KeyRound size={12} />
            {a.unlocks_count || 0}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
            <Handshake size={12} />
            {a.matches_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: "active",
      header: "Status",
      sortable: true,
      sortValue: (a) => (a.active ? 1 : 0),
      render: (a) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            a.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {a.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "180px",
      render: (a) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => setSelectedAgentId(a.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            title="View agent report & tutors"
          >
            <Eye size={13} className="text-[#0096D6]" />
            Report
          </button>
          <button
            onClick={() => openEditModal(a)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            title="Edit agent details"
          >
            <Edit2 size={13} className="text-gray-500" />
            Edit
          </button>
          <button
            onClick={() => updateMutation.mutate({ id: a.id, data: { active: !a.active } })}
            disabled={updateMutation.isPending}
            className={`rounded-lg p-1.5 transition ${
              a.active
                ? "text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={a.active ? "Deactivate agent" : "Activate agent"}
          >
            {a.active ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32] flex items-center gap-2">
            <Building2 className="text-[#0096D6]" size={28} />
            Partner Agents
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage partner agencies, broker accounts, assigned tutors, and unlock performance reports.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0096D6] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#007FB8] transition"
        >
          <Plus size={16} />
          Add Partner Agent
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Building2 size={16} className="text-[#0096D6]" />
            Total Agents
          </div>
          <p className="mt-2 text-2xl font-black text-[#2D2A32]">{totalAgents}</p>
          <p className="mt-0.5 text-xs text-green-600 font-medium">{totalActive} active</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Users size={16} className="text-purple-600" />
            Tutors Managed
          </div>
          <p className="mt-2 text-2xl font-black text-[#2D2A32]">{totalTutorsManaged}</p>
          <p className="mt-0.5 text-xs text-gray-400">across all partner agencies</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <KeyRound size={16} className="text-amber-500" />
            Total Unlocks
          </div>
          <p className="mt-2 text-2xl font-black text-[#2D2A32]">{totalUnlocks}</p>
          <p className="mt-0.5 text-xs text-gray-400">parent requests unlocked</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Handshake size={16} className="text-emerald-600" />
            Agency Status
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {totalAgents > 0 ? Math.round((totalActive / totalAgents) * 100) : 0}%
          </p>
          <p className="mt-0.5 text-xs text-gray-400">healthy active rate</p>
        </div>
      </div>

      {/* Main Table */}
      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, agency, phone, Telegram ID..."
        toolbarFilters={[
          { key: "status", label: "Status", options: ["active", "inactive"] },
        ]}
        filterValues={{ status: filterStatus }}
        onFilterChange={(k, v) => {
          if (k === "status") setFilterStatus(v);
        }}
        onClearFilters={() => setFilterStatus("")}
        emptyTitle="No partner agents found"
        emptyDescription="Create partner agent accounts to tag and track external tutor recruitment agencies."
      />

      {/* Create / Edit Agent Modal */}
      {(isCreateOpen || editingAgent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-[#2D2A32] flex items-center gap-2">
                <Building2 className="text-[#0096D6]" size={20} />
                {editingAgent ? "Edit Partner Agent" : "New Partner Agent"}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingAgent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Agent Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Abebe Tadesse"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Agency / Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Addis Edu Partners"
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., 0911234567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Telegram User ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123456789"
                  value={formTelegram}
                  onChange={(e) => setFormTelegram(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingAgent(null);
                    resetForm();
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0096D6] px-5 py-2 text-xs font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  {editingAgent ? "Update Agent" : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Detail / Report Drawer */}
      {selectedAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm p-0">
          <div className="h-full w-full max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-[#2D2A32] flex items-center gap-2">
                  <Building2 className="text-[#0096D6]" size={20} />
                  {detailData?.agent?.name || "Agent Report"}
                </h3>
                <p className="text-xs text-gray-500">
                  {detailData?.agent?.agency_name ? `Agency: ${detailData.agent.agency_name}` : "Partner Agent Overview"}
                </p>
              </div>
              <button
                onClick={() => setSelectedAgentId(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isDetailLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-[#0096D6]" size={32} />
                </div>
              ) : (
                <>
                  {/* Summary Box */}
                  <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-gray-400">Tutors</span>
                      <p className="text-lg font-black text-[#2D2A32] mt-0.5">
                        {detailData?.tutors?.length ?? 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-gray-400">Total Unlocks</span>
                      <p className="text-lg font-black text-amber-600 mt-0.5">
                        {detailData?.unlocks_count ?? 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-gray-400">Status</span>
                      <p className="text-sm font-black text-green-600 mt-1">
                        {detailData?.agent?.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {/* Managed Tutors List */}
                  <div>
                    <h4 className="text-sm font-black text-[#2D2A32] flex items-center gap-2 mb-3">
                      <Users size={16} className="text-[#0096D6]" />
                      Recruited Tutors ({detailData?.tutors?.length || 0})
                    </h4>
                    {detailData?.tutors?.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-4 bg-gray-50 rounded-xl">
                        No tutors currently linked to this partner agent.
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                        {detailData?.tutors?.map((t: any) => (
                          <div key={t.id} className="p-3 bg-white hover:bg-gray-50 transition flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-gray-800">
                                {t.first_name} {t.last_name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {t.subjects || "General"} • {t.city || "Addis Ababa"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  t.status === "approved"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {t.status}
                              </span>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Kulf: {t.kulf_balance ?? 0}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Unlocks */}
                  <div>
                    <h4 className="text-sm font-black text-[#2D2A32] flex items-center gap-2 mb-3">
                      <KeyRound size={16} className="text-amber-500" />
                      Recent Parent Request Unlocks ({detailData?.recent_unlocks?.length || 0})
                    </h4>
                    {detailData?.recent_unlocks?.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-4 bg-gray-50 rounded-xl">
                        No unlock activity recorded yet for tutors under this agent.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {detailData?.recent_unlocks?.map((u: any) => (
                          <div key={u.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs">
                            <div className="flex justify-between font-bold text-gray-800">
                              <span>Grade {u.request?.grade_level || "Any"}</span>
                              <span className="text-gray-400 font-normal">
                                {u.unlocked_at ? new Date(u.unlocked_at).toLocaleDateString() : "Recent"}
                              </span>
                            </div>
                            <p className="text-gray-500 mt-0.5">
                              Area: {u.request?.area_name || "Addis Ababa"} • Tutor #{u.tutor_id}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setSelectedAgentId(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
