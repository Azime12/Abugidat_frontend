"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { configService } from "@/services/api/config";
import { Link, useRouter } from "@/i18n/routing";
import {
  CheckCircle2, Smartphone, Building2, CreditCard, Loader2, ArrowLeft, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const PACK_LABELS: Record<number, string> = {
  10: "Starter",
  25: "Popular",
  50: "Best Value",
};

const PAYMENT_METHODS = [
  { id: "telebirr", label: "Telebirr",     icon: Smartphone,  color: "text-green-600",  bg: "bg-green-50" },
  { id: "cbe",      label: "CBE Birr",     icon: CreditCard,  color: "text-purple-600", bg: "bg-purple-50" },
  { id: "bank",     label: "Bank Transfer", icon: Building2,  color: "text-blue-600",   bg: "bg-blue-50" },
];

interface Pack {
  size: number;
  price: number;
  label: string;
  popular: boolean;
}

function formatBirr(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ብር`;
}

export default function BuyKulfPage() {
  const t = useTranslations("Kulf");
  const tc = useTranslations("Common");
  const router = useRouter();
  const qc = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["public", "config"],
    queryFn: configService.getPublicConfig,
    staleTime: 60_000,
  });

  const packs: Pack[] = Object.entries(config?.kulf_pack_prices ?? {})
    .map(([size, price]) => ({
      size: Number(size),
      price: Number(price),
      label: PACK_LABELS[Number(size)] || `${size} Kulf`,
      popular: Number(size) === 25,
    }))
    .sort((a, b) => a.size - b.size);

  const accounts = config?.payment_accounts ?? {};
  const telebirrAccount = accounts.telebirr || "0911-XXXX-XXXX";
  const cbeAccount = accounts.cbe || "CBE: 1000-XXXX-XXXX";
  const bankAccount = accounts.bank || "Awash: 0123-XXXX-XXXX";

  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("telebirr");
  const [txnRef, setTxnRef] = useState("");
  const [confirmState, setConfirmState] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      tutorDashboardService.buyRequest({
        pack_size: selectedPack!.size,
        amount_birr: selectedPack!.price,
        txn_ref: txnRef.trim(),
        payment_method: paymentMethod,
      }),
    onSuccess: () => {
      toast.success(t("buyRequestSubmitted"));
      qc.invalidateQueries({ queryKey: ["kulf"] });
      router.push("/tutor/kulf");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t("buyFailed"))),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) { toast.error("Please select a Kulf pack"); return; }
    if (!txnRef.trim() || txnRef.trim().length < 3) {
      toast.error("Enter the transaction reference from your payment SMS");
      return;
    }
    setConfirmState(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <div>
        <Link
          href="/tutor/kulf"
          className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#0096D6]"
        >
          <ArrowLeft size={14} />
          {tc("backToWallet")}
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D2A32]">{t("buyKulf")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("buySubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pack selection */}
        <div>
          <h2 className="mb-3 text-sm font-bold text-[#2D2A32]">{t("choosePack")}</h2>
          {packs.length === 0 ? (
            <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {packs.map((pack) => {
                const active = selectedPack?.size === pack.size;
                return (
                  <button
                    key={pack.size}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className={`relative rounded-2xl border-2 p-4 text-left transition ${
                      active
                        ? "border-[#0096D6] bg-[#E8F4F8]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                        Popular
                      </span>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#2D2A32]">{pack.size}</span>
                      <span className="text-sm font-bold text-gray-600">Kulf</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{pack.label}</p>
                    <p className="mt-2 text-lg font-black text-[#0096D6]">{formatBirr(pack.price)}</p>
                    <p className="text-[10px] text-gray-500">
                      ~{formatBirr(Math.round(pack.price / pack.size))} per unlock
                    </p>
                    {active && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-[#0096D6]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment method */}
        {selectedPack && (
          <div>
            <h2 className="mb-3 text-sm font-bold text-[#2D2A32]">{t("paymentMethod")}</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-bold transition ${
                      active
                        ? "border-[#0096D6] bg-[#E8F4F8] text-[#0096D6]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${m.bg} ${m.color}`}>
                      <Icon size={16} />
                    </div>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment instructions */}
        {selectedPack && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="text-sm">
                <p className="font-bold text-amber-900">How to pay {formatBirr(selectedPack.price)}</p>
                <ol className="mt-2 space-y-1 text-xs text-amber-800 list-decimal list-inside">
                  {paymentMethod === "telebirr" && (
                    <>
                      <li>Open Telebirr on your phone</li>
                      <li>Send <strong>{formatBirr(selectedPack.price)}</strong> to <strong>{telebirrAccount}</strong> (Abugida Tutoring)</li>
                      <li>Copy the transaction reference from the SMS you receive</li>
                      <li>Paste it below</li>
                    </>
                  )}
                  {paymentMethod === "cbe" && (
                    <>
                      <li>Open CBE Birr or visit a CBE branch</li>
                      <li>Send <strong>{formatBirr(selectedPack.price)}</strong> to <strong>{cbeAccount}</strong> (Abugida Tutoring)</li>
                      <li>Copy the transaction ID from your receipt</li>
                      <li>Paste it below</li>
                    </>
                  )}
                  {paymentMethod === "bank" && (
                    <>
                      <li>Visit any bank branch (Awash, BOA, etc.)</li>
                      <li>Deposit <strong>{formatBirr(selectedPack.price)}</strong> to <strong>{bankAccount}</strong> (Abugida Tutoring)</li>
                      <li>Note the deposit slip reference number</li>
                      <li>Paste it below</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Txn ref input */}
        {selectedPack && (
          <div>
            <h2 className="mb-3 text-sm font-bold text-[#2D2A32]">{t("txnRef")}</h2>
            <input
              type="text"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              placeholder="e.g. TB12XXXXXX or FT12345678"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste the reference number from your payment confirmation SMS.
            </p>
          </div>
        )}

        {/* Submit */}
        {selectedPack && (
          <button
            type="submit"
            disabled={mutation.isPending || !txnRef.trim()}
            className="w-full rounded-lg bg-[#0096D6] py-3 text-sm font-bold text-white hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </span>
            ) : (
              `Submit payment proof for ${selectedPack.size} Kulf`
            )}
          </button>
        )}
      </form>

      {/* Confirmation modal */}
      {confirmState && selectedPack && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmState(false)}
          onConfirm={() => mutation.mutate()}
          title="Submit purchase request?"
          message={`You are submitting proof of payment for ${selectedPack.size} Kulf (${formatBirr(selectedPack.price)}) via ${PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}. Admin will verify within 24 hours.`}
          variant="info"
          isLoading={mutation.isPending}
          confirmText="Submit"
        />
      )}
    </div>
  );
}
