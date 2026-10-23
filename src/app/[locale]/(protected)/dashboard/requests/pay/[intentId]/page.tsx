"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { paymentService } from "@/services/api/payments";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { compressImageTo100KB } from "@/lib/imageCompression";
import {
  ArrowLeft, Smartphone, Building2, CreditCard, Loader2,
  CheckCircle2, ClipboardCopy, Upload, AlertCircle, Hourglass,
} from "lucide-react";

const METHODS = [
  { id: "telebirr", label: "Telebirr", icon: Smartphone },
  { id: "cbe", label: "CBE Birr", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
];

function accountLine(v: any): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "object") {
    if (v.enabled === false) return null;
    return (v.account || "").trim() || null;
  }
  return null;
}

export default function PayForRequestPage() {
  const params = useParams();
  const intentId = params?.intentId as string;
  const router = useRouter();
  const qc = useQueryClient();

  const [method, setMethod] = useState("telebirr");
  const [txnRef, setTxnRef] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payment", "intent", intentId],
    queryFn: async () => (await paymentService.getIntent(intentId)).data,
    enabled: !!intentId,
  });

  const intent = data?.intent;
  const accounts = data?.payment_accounts ?? {};

  const status = intent?.status;

  // Poll for status change while awaiting verification.
  useEffect(() => {
    if (status !== "pending") return;
    const t = setInterval(() => refetch(), 10_000);
    return () => clearInterval(t);
  }, [status, refetch]);

  // React to a terminal status.
  useEffect(() => {
    if (!status) return;
    if (status === "verified") {
      toast.success("Payment verified! Your request is now live.", { icon: "🎉" });
      qc.invalidateQueries({ queryKey: ["parent", "requests"] });
      router.push("/dashboard");
    } else if (status === "rejected") {
      toast.error("Payment rejected. Please try again.");
    }
  }, [status, router, qc]);

  const submitMutation = useMutation({
    mutationFn: () =>
      paymentService.submitProof(intentId, {
        payment_method: method,
        txn_ref: txnRef.trim() || undefined,
        receipt_file: receipt || undefined,
      }),
    onSuccess: () => {
      toast.success("Proof submitted. Admin will verify within 24h.");
      refetch();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to submit proof")),
  });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const dataUrl = await compressImageTo100KB(file, 600, 100 * 1024);
      setReceipt(dataUrl);
    } catch {
      toast.error("Failed to process image");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || !intent) {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-3 text-lg font-bold text-[#2D2A32]">Payment not found</h3>
            <p className="mt-1 text-sm text-gray-500">This payment link is invalid or has expired.</p>
            <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-5 py-2.5 text-sm font-bold text-white">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const amount = Number(intent.amount_etb || 0);
  const accountRows: { key: string; label: string; value: string; icon: string }[] = [];
  const accountMap: [string, string, string][] = [
    ["telebirr", "Telebirr", "📱"],
    ["telegram", "Telegram", "✈️"],
    ["cbe", "CBE", "🏦"],
    ["boa", "Bank of Abyssinia (BOA)", "🏦"],
    ["awash", "Awash Bank", "🏦"],
    ["bank", "Bank", "🏦"],
  ];
  for (const [key, label, icon] of accountMap) {
    const v = accountLine(accounts[key]);
    if (v) {
      const value = key === "telegram" && !v.startsWith("@") ? `@${v}` : v;
      accountRows.push({ key, label, icon, value });
    }
  }

  // Terminal states
  if (status === "verified") {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-black text-[#2D2A32]">Payment Verified</h2>
          <p className="mt-2 text-sm text-gray-500">Your request is now live. Redirecting…</p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <Hourglass className="mx-auto h-14 w-14 text-amber-600" />
          <h2 className="mt-4 text-2xl font-black text-[#2D2A32]">Payment window expired</h2>
          <p className="mt-2 text-sm text-gray-500">This payment window has closed. Please post a new request.</p>
          <Link href="/dashboard/requests/new" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-5 py-2.5 text-sm font-bold text-white">
            Post a new request
          </Link>
        </div>
      </div>
    );
  }

  const hasSubmittedProof = !!(intent.receipt_file || intent.txn_ref);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#0096D6]">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A32]">Pay to publish your request</h1>
        <p className="mt-1 text-sm text-gray-500">
          A one-time listing fee keeps the platform free of spam.
        </p>

        {/* Amount card */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Listing fee</p>
          <p className="mt-1 text-4xl font-black text-[#0096D6]">{amount} ETB</p>
          <p className="mt-1 text-xs text-gray-400">
            Status: <span className="font-bold capitalize">{intent.status}</span>
          </p>
        </div>

        {/* Step 1 — pay offline */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-black text-[#2D2A32]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0096D6] text-xs font-black text-white">1</span>
            Pay offline
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Send {amount} ETB to one of the accounts below, then upload your receipt.
          </p>
          <div className="mt-3 space-y-2">
            {accountRows.length === 0 && (
              <p className="text-sm text-gray-500">
                Payment account details will be shared with you shortly. Please check back, or contact support.
              </p>
            )}
            {accountRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg leading-none">{row.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-500">{row.label}</p>
                    <p className="font-mono text-sm font-bold text-[#2D2A32] break-all">{row.value}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(row.value, row.key)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  <ClipboardCopy size={12} />
                  {copied === row.key ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 — upload proof */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-black text-[#2D2A32]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0096D6] text-xs font-black text-white">2</span>
            Upload proof
          </h2>

          {hasSubmittedProof && intent.status === "pending" ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <Hourglass className="mx-auto h-8 w-8 text-amber-600" />
              <p className="mt-2 text-sm font-bold text-amber-900">Waiting for verification</p>
              <p className="mt-1 text-xs text-amber-700">
                Your proof was received. An admin will verify it within 24 hours. This page updates automatically.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <p className="mb-2 text-xs font-bold text-gray-500">Payment method</p>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-bold transition ${
                          active ? "border-[#0096D6] bg-[#E8F4F8] text-[#0096D6]" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon size={18} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold text-gray-500">Transaction reference (optional)</p>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. TB12XXXXXX"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold text-gray-500">Receipt screenshot</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
                {receipt ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={receipt} alt="Receipt preview" className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex-1 text-xs text-gray-600">Receipt attached</div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-[#0096D6]">
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-500 hover:border-[#0096D6]"
                  >
                    {compressing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    <span className="text-xs font-bold">{compressing ? "Processing…" : "Upload screenshot"}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={submitMutation.isPending || (!txnRef.trim() && !receipt)}
                onClick={() => submitMutation.mutate()}
                className="w-full rounded-lg bg-[#0096D6] py-3 text-sm font-bold text-white hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  "Submit payment proof"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
