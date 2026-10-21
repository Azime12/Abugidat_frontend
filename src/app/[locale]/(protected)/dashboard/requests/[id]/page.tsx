"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parentRequestService } from "@/services/api/parent-requests";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  ArrowLeft, MapPin, Clock, Lock, MessageSquare,
  Loader2, FileText, Archive,
} from "lucide-react";

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params?.id as string;
  const router = useRouter();
  const qc = useQueryClient();
  const [confirmClose, setConfirmClose] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["parent", "request", requestId],
    queryFn: async () => (await parentRequestService.getById(requestId)).data,
    enabled: !!requestId,
  });

  const closeMutation = useMutation({
    mutationFn: () => parentRequestService.close(requestId),
    onSuccess: () => {
      toast.success("Request closed");
      setConfirmClose(false);
      qc.invalidateQueries({ queryKey: ["parent", "requests"] });
      qc.invalidateQueries({ queryKey: ["parent", "request", requestId] });
      router.push("/dashboard");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to close request")),
  });

  const request = data?.request;

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#0096D6]"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ) : !request ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-3 text-lg font-bold text-[#2D2A32]">Request not found</h3>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]">
                {request.grade_level}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                request.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-200"
              }`}>
                {request.status}
              </span>
            </div>

            <h1 className="text-2xl font-black text-[#2D2A32]">{request.subjects}</h1>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {request.area_name && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {request.area_name}
                </p>
              )}
              {request.preferred_time && (
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {request.preferred_time}
                </p>
              )}
              {request.note && (
                <p className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {request.note}
                </p>
              )}
            </div>

            <div className="mt-5 rounded-xl bg-[#E8F4F8] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#0096D6]" />
                  <span className="text-sm font-bold text-[#006A9B]">Tutor unlocks</span>
                </div>
                <span className="text-lg font-black text-[#0096D6]">
                  {request.unlock_count || 0} / {request.max_unlocks || 7}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#006A9B]">
                {(request.unlock_count || 0) > 0
                  ? `${request.unlock_count} tutor${request.unlock_count > 1 ? "s have" : " has"} unlocked your request`
                  : "No tutors have unlocked your request yet"}
              </p>
            </div>

            {request.status === "open" && (
              <div className="mt-5">
                <button
                  onClick={() => setConfirmClose(true)}
                  disabled={closeMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" />
                  Close request
                </button>
                <p className="mt-2 text-[10px] text-gray-400">
                  Closing stops tutors from unlocking your contact.
                </p>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-400">
              Posted {new Date(request.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        )}
      </div>

      {confirmClose && (
        <ConfirmationModal
          isOpen
          onClose={() => setConfirmClose(false)}
          onConfirm={() => closeMutation.mutate()}
          title="Close this request?"
          message={
            <div className="space-y-2">
              <p>You'll stop receiving new tutor unlocks for this request.</p>
              <p className="text-xs text-gray-500">This can't be undone.</p>
            </div>
          }
          variant="danger"
          isLoading={closeMutation.isPending}
          confirmText="Close request"
        />
      )}
    </div>
  );
}
