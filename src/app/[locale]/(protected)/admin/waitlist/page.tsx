"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Bell, MapPin, BookOpen, Clock, CheckCircle2, User } from "lucide-react";
import { AdminDataTable, ColumnDef } from "@/components/admin/AdminDataTable";

export default function AdminWaitlistPage() {
  const [search, setSearch] = useState("");
  const [filterNotified, setFilterNotified] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "waitlist"],
    queryFn: async () => (await adminService.getWaitlist()).data,
  });

  const entries = data?.entries ?? [];
  const filtered = entries.filter((w: any) => {
    const text = `${w.id} ${w.area_name || ""} ${w.subjects || ""} ${w.grade_level || ""} ${w.parent_telegram_id || ""}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterNotified === "notified" && !w.notified) return false;
    if (filterNotified === "waiting" && w.notified) return false;
    return true;
  });

  const totalWaiting = entries.filter((w: any) => !w.notified).length;
  const totalNotified = entries.filter((w: any) => w.notified).length;

  const columns: ColumnDef<any>[] = [
    {
      key: "id",
      header: "ID",
      width: "60px",
      align: "center",
      sortable: true,
      sortValue: (w) => w.id,
      render: (w) => <span className="text-xs font-mono text-gray-400">#{w.id}</span>,
    },
    {
      key: "area",
      header: "Target Area / City",
      sortable: true,
      sortValue: (w) => w.area_name || "",
      render: (w) => (
        <div className="flex items-center gap-1.5 font-bold text-[#2D2A32]">
          <MapPin size={14} className="text-[#0096D6]" />
          {w.area_name || "Any Area"}
        </div>
      ),
    },
    {
      key: "subjects",
      header: "Subjects & Grade",
      render: (w) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-gray-800 flex items-center gap-1">
            <BookOpen size={12} className="text-gray-400" />
            {w.subjects || "General Tutoring"}
          </span>
          <span className="text-gray-500">Grade: {w.grade_level || "Any"}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Parent Contact",
      render: (w) => (
        <div className="flex items-center gap-1 text-xs text-gray-600 font-mono">
          <User size={12} className="text-gray-400" />
          {w.parent_telegram_id ? `TG: ${w.parent_telegram_id}` : w.phone || "—"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Alert Status",
      sortable: true,
      sortValue: (w) => (w.notified ? 1 : 0),
      render: (w) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            w.notified
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {w.notified ? <CheckCircle2 size={11} /> : <Clock size={11} />}
          {w.notified ? "Notified" : "Waiting for Tutor"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Joined Waitlist",
      sortable: true,
      sortValue: (w) => w.created_at || "",
      render: (w) => (
        <span className="text-xs text-gray-500">
          {w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32] flex items-center gap-2">
          <Bell className="text-[#0096D6]" size={28} />
          Parent Waitlist Demand
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Parents waiting for tutors in areas without immediate matches. System alerts parents automatically when tutors join their area.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">Total Requests</span>
          <p className="mt-1 text-2xl font-black text-[#2D2A32]">{entries.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-amber-600">Pending Matching</span>
          <p className="mt-1 text-2xl font-black text-amber-600">{totalWaiting}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-green-600">Alerts Delivered</span>
          <p className="mt-1 text-2xl font-black text-green-600">{totalNotified}</p>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(w) => w.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by area, subjects, grade..."
        toolbarFilters={[
          { key: "notified", label: "Status", options: ["waiting", "notified"] },
        ]}
        filterValues={{ notified: filterNotified }}
        onFilterChange={(k, v) => {
          if (k === "notified") setFilterNotified(v);
        }}
        onClearFilters={() => setFilterNotified("")}
        emptyTitle="Waitlist is currently empty"
        emptyDescription="When parents search for tutors in unserviced areas, they can join the waitlist."
      />
    </div>
  );
}
