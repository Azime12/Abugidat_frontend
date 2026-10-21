"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "@/lib/api-client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const REASON_LABELS: Record<string, string> = {
  no_reply: "Parent didn't reply (48h)",
  fake: "Fake request",
  closed: "Already closed",
  other: "Other",
};

export default function AdminKulfRefundsPage() {
  const [filter, setFilter] = useState("pending");
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "approve" | "reject";
    amount: number;
    reason: string;
  } | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kulf", "refunds", filter],
    queryFn: async () =>
      (await adminClient.get("/admin/kulf/refunds", { params: filter ? { status: filter } : {} })).data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      adminClient.post(`/admin/kulf/refunds/${id}/${action}`),
    onSuccess: (_, vars) => {
      toast.success(vars.action === "approve" ? "Refund approved. Kulf returned." : "Refund rejected.");
      qc.invalidateQueries({ queryKey: ["admin", "kulf", "refunds"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Action failed")),
  });

  const refunds = data?.refunds ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">Kulf Refunds</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review refund requests from tutors. Approve to return Kulf.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#0096D6]"
        >
          <option value="pending">Pending only</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All statuses</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading...</div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-[#2D2A32]">No {filter || ""} refunds</h3>
            <p className="mt-2 text-sm text-gray-500">Nothing to review right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Tutor</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center">Amount</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Reason</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Note</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Status</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                      <p className="font-bold text-[#2D2A32] text-sm">{r.tutor_name || `Tutor #${r.tutor_id}`}</p>
                      <p className="text-xs text-gray-500">Req: {r.request_id?.slice(0, 8) || "—"}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center">
                      <span className="font-bold text-[#0096D6]">{r.refund_amount} Kulf</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-xs text-gray-700">
                      {REASON_LABELS[r.reason] || r.reason}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-xs text-gray-500 max-w-[200px] truncate">
                      {r.note || "—"}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[r.status] || "bg-gray-100 text-gray-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-right">
                      {r.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              setConfirmAction({
                                id: r.id,
                                action: "approve",
                                amount: r.refund_amount,
                                reason: r.reason,
                              })
                            }
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
                          >
                            {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                id: r.id,
                                action: "reject",
                                amount: r.refund_amount,
                                reason: r.reason,
                              })
                            }
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            mutation.mutate({ id: confirmAction.id, action: confirmAction.action });
            setConfirmAction(null);
          }}
          title={confirmAction.action === "approve" ? "Approve refund?" : "Reject refund?"}
          message={
            confirmAction.action === "approve"
              ? `This will return ${confirmAction.amount} Kulf to the tutor's balance immediately.`
              : `This will deny the refund request. The tutor will not get Kulf back.`
          }
          variant={confirmAction.action === "approve" ? "success" : "danger"}
          isLoading={mutation.isPending}
          confirmText={confirmAction.action === "approve" ? "Approve refund" : "Reject"}
        />
      )}
    </div>
  );
}
