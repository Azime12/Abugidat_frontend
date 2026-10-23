"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  Loader2, CheckCircle2, XCircle, RefreshCw, Inbox, Clock, MapPin, BookOpen, Phone,
} from "lucide-react";

const STATUS_TABS = [
  { id: "pending_review", label: "Pending review" },
  { id: "pending_payment", label: "Awaiting payment" },
  { id: "open", label: "Open" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminRequestsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("pending_review");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "parent-requests", status],
    queryFn: async () => (await adminService.getParentRequests(status)).data,
  });

  const requests = data?.requests ?? [];

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      adminService.reviewParentRequest(id, action),
    onSuccess: (res: any, { action }) => {
      if (action === "approve") {
        const s = res.data?.status;
        toast.success(s === "pending_payment" ? "Approved — payment requested" : "Approved — request is now live");
      } else {
        toast.success("Request rejected");
      }
      qc.invalidateQueries({ queryKey: ["admin", "parent-requests"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Action failed")),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D2A32]">Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review parent tutoring requests before they go live.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatus(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              status === tab.id ? "bg-[#0096D6] text-white" : "border border-gray-200 bg-white text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">Failed to load requests</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-lg font-bold text-[#2D2A32]">No {status.replace("_", " ")} requests</h3>
          <p className="mt-1 text-sm text-gray-500">Parent requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                      {r.grade_level}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{String(r.id).slice(0, 8)}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-[#2D2A32]">
                    {r.subjects || "General Tutoring"}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {r.area_name || "Addis Ababa"}
                    </span>
                    {r.preferred_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {r.preferred_time}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1 text-gray-700">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <strong>{r.parent_name || "Parent"}</strong> · {r.parent_phone || "—"}
                    </span>
                  </div>

                  {r.note && (
                    <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                      <BookOpen className="mr-1 inline h-3.5 w-3.5 text-gray-400" />
                      {r.note}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  {(status === "pending_review" || status === "pending_payment") && (
                    <>
                      <button
                        onClick={() => reviewMutation.mutate({ id: r.id, action: "approve" })}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {reviewMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        Approve
                      </button>
                      <button
                        onClick={() => reviewMutation.mutate({ id: r.id, action: "reject" })}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    </>
                  )}
                  {r.payment_intent_id && (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                      Payment pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
