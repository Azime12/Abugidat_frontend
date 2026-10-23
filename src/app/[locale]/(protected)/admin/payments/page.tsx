"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/services/api/payments";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  Loader2, CheckCircle2, XCircle, RefreshCw, Wallet, AlertCircle,
} from "lucide-react";

const STATUS_TABS = [
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "rejected", label: "Rejected" },
  { id: "expired", label: "Expired" },
];

const PURPOSE_LABEL: Record<string, string> = {
  listing_fee: "Listing fee",
  kulf_purchase: "Kulf purchase",
  featured_badge: "Featured badge",
  subscription: "Subscription",
};

const METHOD_LABEL: Record<string, string> = {
  telebirr: "Telebirr",
  cbe: "CBE",
  bank: "Bank",
  manual: "Manual",
};

function shortId(id: string) {
  return String(id || "").slice(0, 8);
}

function age(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("pending");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "payments", status],
    queryFn: async () => (await paymentService.list(status === "all" ? undefined : status)).data,
  });

  const intents = data?.intents ?? [];

  const verifyMutation = useMutation({
    mutationFn: (id: string) => paymentService.verify(id),
    onSuccess: (_res, id) => {
      toast.success("Payment verified");
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to verify payment")),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => paymentService.reject(id),
    onSuccess: () => {
      toast.success("Payment rejected");
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to reject payment")),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D2A32]">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and verify parent listing fees and other payments.
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
        <button
          onClick={() => setStatus("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            status === "all" ? "bg-[#0096D6] text-white" : "border border-gray-200 bg-white text-gray-600"
          }`}
        >
          All
        </button>
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
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <p className="mt-3 text-sm font-bold text-red-700">Failed to load payments</p>
        </div>
      ) : intents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <Wallet className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-lg font-bold text-[#2D2A32]">No {status !== "all" ? status : ""} payments</h3>
          <p className="mt-1 text-sm text-gray-500">Payments will appear here as parents submit proof.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Txn ref</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {intents.map((intent: any) => {
                const draft = intent.draft_payload ?? {};
                const payerName = draft.parent_name || "—";
                const payerPhone = draft.parent_phone_contact || draft.parent_phone || "—";
                const isDataUrl = (intent.receipt_file || "").startsWith("data:image");
                return (
                  <tr key={intent.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{shortId(intent.id)}</td>
                    <td className="px-4 py-3 text-xs">{PURPOSE_LABEL[intent.purpose] || intent.purpose}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-[#2D2A32]">{payerName}</p>
                      <p className="text-[11px] text-gray-400">{payerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-black text-[#0096D6]">{Number(intent.amount_etb || 0)} ETB</td>
                    <td className="px-4 py-3 text-xs">{METHOD_LABEL[intent.payment_method] || intent.payment_method || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{intent.txn_ref || "—"}</td>
                    <td className="px-4 py-3">
                      {isDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a href={intent.receipt_file} target="_blank" rel="noreferrer">
                          <img src={intent.receipt_file} alt="receipt" className="h-10 w-10 rounded-md object-cover" />
                        </a>
                      ) : intent.receipt_file ? (
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">Attached</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{age(intent.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        intent.status === "verified" ? "bg-emerald-50 text-emerald-700"
                          : intent.status === "rejected" ? "bg-red-50 text-red-700"
                          : intent.status === "expired" ? "bg-gray-100 text-gray-600"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {intent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {intent.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => verifyMutation.mutate(intent.id)}
                            disabled={verifyMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {verifyMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Verify
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(intent.id)}
                            disabled={rejectMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
