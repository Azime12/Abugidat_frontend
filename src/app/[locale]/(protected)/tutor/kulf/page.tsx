"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { Link } from "@/i18n/routing";
import {
  Wallet, Plus, ArrowUpRight, CheckCircle2, Clock,
  AlertCircle, FileText, RotateCcw, TrendingUp, Receipt,
} from "lucide-react";

// ─── Ethiopian Birr formatter ────────────────────────────────────
function formatBirr(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ብር";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num)} ብር`;
}

type Tab = "ledger" | "purchases" | "refunds";

const LEDGER_TYPE_CONFIG: Record<string, {
  label: string;
  description: (note: string) => string;
  icon: any;
  color: string;
  bgColor: string;
}> = {
  free: {
    label: "Welcome Grant",
    description: () => "Free Kulf on account approval",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  bought: {
    label: "Purchased",
    description: (note) => note || "Kulf pack purchase",
    icon: Plus,
    color: "text-[#0096D6]",
    bgColor: "bg-[#E8F4F8]",
  },
  used: {
    label: "Unlock",
    description: (note) => note || "Parent contact unlock",
    icon: ArrowUpRight,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
  },
  refund: {
    label: "Refund",
    description: (note) => note || "Refund for non-reply",
    icon: RotateCcw,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  adjust: {
    label: "Admin Adjustment",
    description: (note) => note || "Manual admin adjustment",
    icon: AlertCircle,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  expired: {
    label: "Expired",
    description: (note) => note || "Kulf expired after 6 months",
    icon: Clock,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", class: "bg-red-50 text-red-700 border-red-200" },
  approved: { label: "Approved", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function TutorKulfPage() {
  const [tab, setTab] = useState<Tab>("ledger");

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["kulf", "balance"],
    queryFn: async () => (await tutorDashboardService.kulfBalance()).data,
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ["kulf", "ledger"],
    queryFn: async () => (await tutorDashboardService.kulfLedger()).data,
    enabled: tab === "ledger",
  });

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["kulf", "purchases"],
    queryFn: async () => (await tutorDashboardService.purchases()).data,
    enabled: tab === "purchases",
  });

  const { data: refundsData, isLoading: refundsLoading } = useQuery({
    queryKey: ["kulf", "refunds"],
    queryFn: async () => (await tutorDashboardService.refunds()).data,
    enabled: tab === "refunds",
  });

  const balance = balanceData?.balance ?? 0;
  const ledger = ledgerData?.lines ?? [];
  const purchases = purchasesData?.purchases ?? [];
  const refunds = refundsData?.refunds ?? [];

  const totalEarned = ledger.filter((l: any) => l.amount > 0).reduce((s: number, l: any) => s + l.amount, 0);
  const totalSpent = ledger.filter((l: any) => l.amount < 0).reduce((s: number, l: any) => s + Math.abs(l.amount), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">
          Kulf Wallet
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kulf is your key to unlock parent contacts. 1 Kulf = 1 unlock.
        </p>
      </div>

      {/* Balance card — improved hierarchy */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-[#0096D6] to-[#007FB8] p-6 sm:p-8 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                Available Balance
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black leading-none">
                  {balanceLoading ? "…" : balance}
                </span>
                <span className="text-xl font-bold text-white/90">Kulf</span>
              </div>
              <p className="mt-3 text-sm text-white/85">
                Enough to unlock <strong>{balance}</strong> parent contact{balance !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Wallet className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tutor/kulf/buy"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#0096D6] shadow-sm transition hover:bg-gray-50 active:scale-95"
            >
              <Plus size={16} />
              Buy Kulf
            </Link>
            <Link
              href="/tutor/requests"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowUpRight size={16} />
              Unlock Requests
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <TrendingUp size={12} className="text-emerald-600" />
              Total Earned
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#2D2A32]">
              {balanceLoading ? "…" : `+${totalEarned}`}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">Kulf credited</p>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <ArrowUpRight size={12} className="text-rose-600" />
              Total Spent
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#2D2A32]">
              {balanceLoading ? "…" : `-${totalSpent}`}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">Kulf used</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
        {([
          { id: "ledger" as Tab, label: "Ledger", icon: FileText, count: ledger.length },
          { id: "purchases" as Tab, label: "Purchases", icon: Receipt, count: purchases.length },
          { id: "refunds" as Tab, label: "Refunds", icon: RotateCcw, count: refunds.length },
        ]).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
                active
                  ? "bg-[#0096D6] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

        {/* LEDGER TAB */}
        {tab === "ledger" && (
          <>
            {ledgerLoading ? (
              <SkeletonList />
            ) : ledger.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No transactions yet"
                description="Your Kulf activity will appear here once you start earning and spending."
                action={
                  <Link
                    href="/tutor/kulf/buy"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-4 py-2 text-sm font-bold text-white hover:bg-[#007FB8]"
                  >
                    <Plus size={14} />
                    Buy your first pack
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {ledger.map((l: any) => {
                  const cfg = LEDGER_TYPE_CONFIG[l.type] || LEDGER_TYPE_CONFIG.adjust;
                  const Icon = cfg.icon;
                  const isNegative = l.amount < 0;
                  return (
                    <div key={l.id} className="flex items-start gap-3 p-4 sm:p-5 transition hover:bg-gray-50">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bgColor} ${cfg.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#2D2A32]">{cfg.label}</p>
                            <p className="mt-0.5 text-xs text-gray-500 truncate">
                              {cfg.description(l.note)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-base font-black ${isNegative ? "text-rose-600" : "text-emerald-600"}`}>
                              {isNegative ? "" : "+"}{l.amount} <span className="text-xs font-bold">Kulf</span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-400">
                          <span>{new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>·</span>
                          <span>Balance: <strong className="text-gray-600">{l.balance_after}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* PURCHASES TAB */}
        {tab === "purchases" && (
          <>
            {purchasesLoading ? (
              <SkeletonList />
            ) : purchases.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No purchases yet"
                description="Buy Kulf packs to unlock parent contacts. Payments are verified by admin within 24 hours."
                action={
                  <Link
                    href="/tutor/kulf/buy"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-4 py-2 text-sm font-bold text-white hover:bg-[#007FB8]"
                  >
                    <Plus size={14} />
                    Buy Kulf
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {purchases.map((p: any) => {
                  const badge = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
                  return (
                    <div key={p.id} className="flex items-start gap-3 p-4 sm:p-5 transition hover:bg-gray-50">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4F8] text-[#0096D6]">
                        <Plus size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-[#2D2A32]">
                                {p.pack_size} Kulf Pack
                              </p>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.class}`}>
                                {badge.label}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatBirr(p.amount_birr)} · {p.payment_method === "telebirr" ? "Telebirr" : p.payment_method === "cbe" ? "CBE Birr" : "Bank Transfer"}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-gray-400 truncate">
                              Ref: {p.txn_ref}
                            </p>
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] text-gray-400">
                          {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* REFUNDS TAB */}
        {tab === "refunds" && (
          <>
            {refundsLoading ? (
              <SkeletonList />
            ) : refunds.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No refund requests"
                description="If a parent doesn't reply within 48 hours of your unlock, you can request a refund here."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {refunds.map((r: any) => {
                  const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                  return (
                    <div key={r.id} className="flex items-start gap-3 p-4 sm:p-5 transition hover:bg-gray-50">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <RotateCcw size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-[#2D2A32]">
                                {r.refund_amount} Kulf Refund
                              </p>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.class}`}>
                                {badge.label}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Reason: {r.reason?.replace("_", " ")}
                            </p>
                            {r.admin_note && (
                              <p className="mt-1 text-[11px] text-gray-500 italic">
                                Admin: {r.admin_note}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] text-gray-400">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-8 sm:p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mt-4 text-base sm:text-lg font-bold text-[#2D2A32]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-gray-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 sm:p-5">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
