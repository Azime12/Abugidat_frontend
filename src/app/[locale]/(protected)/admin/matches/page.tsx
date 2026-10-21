"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link } from "@/i18n/routing";
import {
  Handshake, Briefcase, GraduationCap, MapPin, Phone,
  Calendar, DollarSign, Eye, X, CheckCircle2, Clock
} from "lucide-react";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

export default function AdminMatchesPage() {
  const [search, setSearch] = useState("");
  const [filterBilling, setFilterBilling] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "matches"],
    queryFn: async () => (await adminService.getMatches()).data,
  });

  const matches = data?.matches ?? [];
  const filtered = matches.filter((m: any) => {
    const tutorName = `${m.Tutor?.first_name || ""} ${m.Tutor?.last_name || ""}`;
    const jobTitle = `${m.Job?.subjects || ""} ${m.Job?.student_level || ""}`;
    const location = `${m.Job?.location || ""}`;
    const parentName = `${m.Job?.parent_name || ""}`;
    const text = `${m.id} ${tutorName} ${jobTitle} ${location} ${parentName}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterBilling && m.billing_status !== filterBilling) return false;
    return true;
  });

  const columns: ColumnDef<any>[] = [
    {
      key: "id",
      header: "ID",
      width: "60px",
      align: "center",
      sortable: true,
      sortValue: (m) => m.id,
      render: (m) => <span className="text-xs font-mono text-gray-400">#{m.id}</span>,
    },
    {
      key: "job",
      header: "Position & Location",
      sortable: true,
      sortValue: (m) => m.Job?.subjects || m.job_id,
      render: (m) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#2D2A32]">{m.Job?.subjects || `Job #${m.job_id}`}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className="font-semibold text-gray-700">{m.Job?.student_level}</span> •
            <MapPin size={11} className="text-[#0096D6]" /> {m.Job?.location || "Addis Ababa"}
          </span>
        </div>
      ),
    },
    {
      key: "tutor",
      header: "Matched Tutor",
      sortable: true,
      sortValue: (m) => `${m.Tutor?.first_name || ""} ${m.Tutor?.last_name || ""}`,
      render: (m) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {m.Tutor ? `${m.Tutor.first_name || ""} ${m.Tutor.last_name || ""}`.trim() : `Tutor #${m.tutor_id}`}
          </span>
          {m.Tutor?.phone_number && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={10} className="text-gray-400" />
              {m.Tutor.phone_number} • {m.Tutor.city || "Addis Ababa"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      align: "right",
      sortable: true,
      sortValue: (m) => Number(m.commission ?? 0),
      render: (m) => (
        <span className="font-bold text-[#0096D6]">
          {(parseFloat(m.commission) || 0).toFixed(0)} ETB
        </span>
      ),
    },
    {
      key: "billing_status",
      header: "Billing",
      sortable: true,
      sortValue: (m) => m.billing_status || "",
      render: (m) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            m.billing_status === "collected"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {m.billing_status === "collected" ? "Collected" : "Pending Collection"}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      sortable: true,
      sortValue: (m) => m.due_date || "",
      render: (m) => <span className="text-xs text-gray-500">{m.due_date}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "100px",
      render: (m) => (
        <Link
          href={`/admin/matches/${m.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <Eye size={12} className="text-[#0096D6]" />
          Details
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32] flex items-center gap-2">
          <Handshake className="text-[#0096D6]" size={28} />
          Matches
        </h1>
        <p className="mt-1 text-sm text-gray-500">{isLoading ? "Loading..." : `${matches.length} total matches finalized`}</p>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by subject, tutor name, location, parent..."
        toolbarFilters={[{ key: "billing", label: "Billing", options: ["pending_collection", "collected"] }]}
        filterValues={{ billing: filterBilling }}
        onFilterChange={(k, v) => {
          if (k === "billing") setFilterBilling(v);
        }}
        onClearFilters={() => setFilterBilling("")}
        emptyTitle="No matches yet"
        emptyDescription="Matches appear when jobs are paired and assigned with tutors."
      />
    </div>
  );
}
