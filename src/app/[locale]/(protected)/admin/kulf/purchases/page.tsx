"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "@/lib/api-client";
import { CheckCircle2, XCircle, Loader2, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const PAYMENT_LABELS: Record<string, string> = {
  telebirr: "Telebirr",
  cbe: "CBE Birr",
  bank: "Bank Transfer",
};

function formatBirr(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ብር";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num)} ብር`;
}

export default function AdminKulfPurchasesPage() {
  const [filter, setFilter] = useState<string>("pending");
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "confirm" | "reject";
    pack: number;
    amount: number;
    tutor: any;
  } | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kulf", "purchases", filter],
    queryFn: async () =>
      (await adminClient.get("/admin/kulf/purchases", { params: filter ? { status: filter } : {} })).data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "confirm" | "reject" }) =>
      adminClient.post(`/admin/kulf/purchases/${id}/${action}`),
    onSuccess: (_, vars) => {
      toast.success(vars.action === "confirm" ? "Purchase confirmed. Kulf credited." : "Purchase rejected.");
      qc.invalidateQueries({ queryKey: ["admin", "kulf", "purchases"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Action failed")),
  });

  const purchases = data?.purchases ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">Kulf Purchases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Verify payment proof and credit Kulf to tutors.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#0096D6]"
        >
          <option value="pending">Pending only</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="">All statuses</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-[#2D2A32]">No {filter || ""} purchases</h3>
            <p className="mt-2 text-sm text-gray-500">Nothing to review right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Tutor</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center">Pack</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-right">Amount</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Method</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Txn Ref</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">Status</th>
                  <th className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                      <p className="font-bold text-[#2D2A32] text-sm">{p.tutor_name || `Tutor #${p.tutor_id}`}</p>
                      <p className="text-xs text-gray-500">ID: {p.tutor_id}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center">
                      <span className="font-bold text-[#0096D6]">{p.pack_size} Kulf</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-right font-semibold">
                      {formatBirr(p.amount_birr)}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700">
                        {PAYMENT_LABELS[p.payment_method] || p.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 font-mono text-xs text-gray-600 truncate max-w-[180px]">
                      {p.txn_ref}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.status] || "bg-gray-100 text-gray-700"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-right">
                      {p.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              setConfirmAction({
                                id: p.id,
                                action: "confirm",
                                pack: p.pack_size,
                                amount: p.amount_birr,
                                tutor: p,
                              })
                            }
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0096D6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
                          >
                            {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                id: p.id,
                                action: "reject",
                                pack: p.pack_size,
                                amount: p.amount_birr,
                                tutor: p,
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
          title={confirmAction.action === "confirm" ? "Confirm purchase?" : "Reject purchase?"}
          message={
            confirmAction.action === "confirm"
              ? `This will credit ${confirmAction.pack} Kulf to ${confirmAction.tutor.tutor_name || "Tutor #" + confirmAction.tutor.tutor_id}. Payment: ${formatBirr(confirmAction.amount)} via ${PAYMENT_LABELS[confirmAction.tutor.payment_method]}.`
              : `This will reject the purchase request. The tutor will not receive Kulf.`
          }
          variant={confirmAction.action === "confirm" ? "success" : "danger"}
          isLoading={mutation.isPending}
          confirmText={confirmAction.action === "confirm" ? "Confirm & credit" : "Reject"}
        />
      )}
    </div>
  );
}
