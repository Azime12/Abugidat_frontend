"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link, useRouter } from "@/i18n/routing";
import {
  ArrowLeft,
  Briefcase,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Lock,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Users,
  Award,
  Phone,
  MessageSquare,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "danger" | "success";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    action: async () => {},
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "job", id],
    queryFn: async () => {
      const res = await adminService.getJobById(id);
      return res.data;
    },
  });

  const job = data?.job;

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, rejection_reason }: { status: string; rejection_reason?: string }) =>
      adminService.updateJobStatus(id, status, rejection_reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "job", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success(`Job marked as ${variables.status}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update job status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0096D6] border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-gray-900">Job Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The requested job #{id} does not exist or has been removed.
        </p>
        <Link
          href="/admin/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  const applications = job.Applications || [];
  const matches = job.Matches || [];

  const handleApprove = () => {
    setConfirmState({
      isOpen: true,
      title: "Approve and Broadcast Job?",
      message: `Approve ${job.subjects} (${job.student_level})? It will be published to the Telegram channel and opened for tutor applications.`,
      type: "success",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "approved" });
      },
    });
  };

  const handleClose = () => {
    setConfirmState({
      isOpen: true,
      title: "Close Tutoring Job?",
      message: `Closing this job will prevent new applications and mark the Telegram post as [JOB CLOSED].`,
      type: "warning",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "closed" });
      },
    });
  };

  const handleReject = () => {
    setConfirmState({
      isOpen: true,
      title: "Reject Job Request?",
      message: `Are you sure you want to reject this request for ${job.subjects}?`,
      type: "danger",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "rejected" });
      },
    });
  };

  const handleReopen = () => {
    setConfirmState({
      isOpen: true,
      title: "Re-open Job?",
      message: `Re-open this job position so tutors can apply again?`,
      type: "info",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "approved" });
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs List
        </Link>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Job #{job.id}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              job.status === "approved"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : job.status === "matched"
                ? "bg-green-100 text-green-700 border border-green-200"
                : job.status === "closed"
                ? "bg-gray-100 text-gray-700 border border-gray-200"
                : job.status === "rejected"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            {job.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
            {job.status === "matched" && <Award className="h-3 w-3" />}
            {job.status === "closed" && <Lock className="h-3 w-3" />}
            {job.status === "rejected" && <XCircle className="h-3 w-3" />}
            {job.status === "pending" && <Clock className="h-3 w-3" />}
            {job.status}
          </span>
        </div>
      </div>

      {/* Main Job Overview Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-[#0096D6]" />
              {job.subjects || "Tutoring Job Position"}
            </h1>
            <p className="text-sm text-gray-500">
              Grade Level:{" "}
              <span className="font-semibold text-gray-700">
                {job.student_level || "Any"}
              </span>{" "}
              • Location:{" "}
              <span className="font-semibold text-gray-700">
                {job.location || "Addis Ababa"}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {job.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={updateStatusMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0096D6] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#007FB8] active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Broadcast
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={updateStatusMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </>
            )}

            {job.status === "approved" && (
              <button
                type="button"
                onClick={handleClose}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" /> Close Job
              </button>
            )}

            {(job.status === "closed" || job.status === "rejected") && (
              <button
                type="button"
                onClick={handleReopen}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" /> Re-open Job
              </button>
            )}
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4 text-xs">
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Salary / Budget</span>
            <p className="mt-1 font-bold text-emerald-700">
              {job.salary ? `${job.salary} ETB` : "Negotiable"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Weekly Schedule</span>
            <p className="mt-1 font-semibold text-gray-800">
              {job.days_per_week ? `${job.days_per_week} days/week` : "Flexible"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Tutor Gender Preference</span>
            <p className="mt-1 font-semibold text-gray-800">
              {job.gender_preference || "Any Gender"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Broadcast Channel ID</span>
            <p className="mt-1 font-semibold text-gray-800">
              {job.telegram_message_id || job.message_id ? `#${job.telegram_message_id || job.message_id}` : "Not posted"}
            </p>
          </div>
        </div>

        {/* Parent / Student Contact Card */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-[#E8F4F8]/40 p-4 text-xs">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            <User className="h-4 w-4 text-[#0096D6]" /> Parent / Client Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-gray-500">Parent Name:</span>
              <p className="font-semibold text-gray-800">{job.parent_name || "Parent Contact"}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone Number:</span>
              <p className="font-semibold text-gray-800">{job.parent_phone || "Not provided"}</p>
            </div>
            <div>
              <span className="text-gray-500">Telegram:</span>
              <p className="font-semibold text-gray-800">
                {job.parent_telegram_id ? `@${job.parent_telegram_id}` : "Direct web request"}
              </p>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        {job.special_requirements && (
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs">
            <span className="font-bold text-gray-500 block mb-1">Special Requirements & Notes:</span>
            <p className="text-gray-700 leading-relaxed">{job.special_requirements}</p>
          </div>
        )}
      </div>

      {/* Two columns: Applicants List & Active Matches */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applicants */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0096D6]" />
              <h2 className="text-lg font-bold text-gray-900">
                Applicants ({applications.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Verified tutor applications</span>
              {applications.length > 0 && (
                <Link
                  href={`/admin/jobs/${job.id}/applicants`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8] transition"
                >
                  <Users className="h-3.5 w-3.5" />
                  View All ({applications.length})
                </Link>
              )}
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No tutors have applied for this job yet.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => {
                const t = app.Tutor || {};
                const name = `${t.first_name || ""} ${t.last_name || ""}`.trim() || `Tutor #${app.tutor_id}`;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 text-xs transition hover:bg-gray-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            app.status === "shortlisted"
                              ? "bg-purple-100 text-purple-700"
                              : app.status === "matched"
                              ? "bg-green-100 text-green-700"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-gray-500">
                        📍 {t.city || "Addis Ababa"} {t.phone_number ? `• 📞 ${t.phone_number}` : ""}
                      </p>
                    </div>

                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0096D6] hover:text-[#0096D6]"
                    >
                      Review <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Matches */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Matches ({matches.length})
              </h2>
            </div>
            <span className="text-xs text-gray-400">Assigned tutor placement</span>
          </div>

          {matches.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No finalized matches for this job yet.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m: any) => {
                const t = m.Tutor || {};
                const name = `${t.first_name || ""} ${t.last_name || ""}`.trim() || `Tutor #${m.tutor_id}`;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{name}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          {m.status || "MATCHED"}
                        </span>
                      </div>
                      <p className="text-gray-500">
                        Commission: {m.commission_amount ? `${m.commission_amount} ETB` : "Standard"} • Due: {m.due_date ? new Date(m.due_date).toLocaleDateString() : "Pending"}
                      </p>
                    </div>

                    <Link
                      href={`/admin/matches/${m.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0096D6] hover:text-[#0096D6]"
                    >
                      View Match <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.type}
        onConfirm={async () => {
          await confirmState.action();
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}