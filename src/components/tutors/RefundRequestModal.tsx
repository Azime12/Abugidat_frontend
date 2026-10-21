"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { tutorDashboardService } from "@/services/api/tutor-dashboard";
import { getApiErrorMessage } from "@/lib/api-errors";

const REASONS = [
  { id: "no_reply", label: "Parent didn't reply (48h+)", hint: "Requires 48 hours since unlock" },
  { id: "fake", label: "Fake request", hint: "Number invalid, no such parent" },
  { id: "closed", label: "Already closed", hint: "Parent closed the request" },
  { id: "other", label: "Other", hint: "Explain below" },
] as const;

export function RefundRequestModal({
  requestId,
  onClose,
  onSubmitted,
}: {
  requestId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState<string>("no_reply");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await tutorDashboardService.refundRequest({
        request_id: requestId,
        reason,
        note: note.trim() || undefined,
      });
      toast.success("Refund request submitted — admin will review within 24h");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to submit refund request"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-[#2D2A32]">Report a problem</h3>
        <p className="mt-1 text-xs text-gray-500">
          Request a refund of the Kulf you spent if this request turned out to be fake or the parent didn't reply.
        </p>

        <div className="mt-4 space-y-2">
          {REASONS.map((r) => (
            <label
              key={r.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                reason === r.id
                  ? "border-[#0096D6] bg-[#E8F4F8]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.id}
                checked={reason === r.id}
                onChange={() => setReason(r.id)}
                className="mt-1 h-4 w-4 accent-[#0096D6]"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#2D2A32]">{r.label}</p>
                <p className="text-xs text-gray-500">{r.hint}</p>
              </div>
            </label>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Additional details (optional)"
          rows={3}
          className="mt-3 w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0096D6] py-2.5 text-sm font-bold text-white hover:bg-[#007FB8] disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit refund
          </button>
        </div>
      </div>
    </div>
  );
}