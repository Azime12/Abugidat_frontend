"use client";

import { X, Loader2, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";

interface Props {
  job: any;
  agreed: boolean;
  onToggleAgreement: (v: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function CommissionAgreementModal({
  job,
  agreed,
  onToggleAgreement,
  onClose,
  onConfirm,
  isSubmitting,
}: Props) {
  // Compute the commission amount (same formula as backend)
  const salary = parseFloat(job.hourly_salary) || 300;
  const hours = 1.5;
  const sessions = 3;
  const commission = salary * hours * sessions * 4 * 0.60;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#E8F4F8] to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0096D6] text-white">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-[#2D2A32]">
                Commission Agreement
              </h2>
              <p className="text-xs text-gray-500">
                Required to apply
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Job context */}
          <div className="text-center text-xs text-gray-500">
            <span className="font-semibold text-[#2D2A32]">
              {job.subjects}
            </span>
            {" · "}
            {job.student_level}
            {" · "}
            {job.location}
          </div>

          {/* The big number — the ONLY amount shown */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-700 mb-2">
              <AlertCircle size={14} />
              IF SELECTED, YOU AGREE TO PAY
            </div>
            <p className="text-4xl font-black text-amber-700 leading-none">
              {fmt(commission)}
              <span className="text-lg ml-1">ETB</span>
            </p>
            <p className="mt-2 text-[11px] font-medium text-amber-600">
              one-time match commission (60% of first month)
            </p>
          </div>

          {/* Agreement checkbox */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
              agreed
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onToggleAgreement(e.target.checked)}
              className="h-5 w-5 accent-emerald-600 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#2D2A32]">
                I agree to pay {fmt(commission)} ETB if selected
              </p>
            </div>
            {agreed && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            )}
          </label>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!agreed || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0096D6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {agreed ? "Apply Now" : "Agree to Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}