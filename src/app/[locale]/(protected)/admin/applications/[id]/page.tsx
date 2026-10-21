"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { Link, useRouter } from "@/i18n/routing";
import {
  ArrowLeft,
  Briefcase,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Award,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";
import { resolveFileUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
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
    queryKey: ["admin", "applications"],
    queryFn: async () => (await adminService.getApplications()).data,
  });

  const app = (data?.applications || []).find(
    (item: any) => String(item.id) === String(id)
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: string }) =>
      adminService.updateApplicationStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Application status updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: ({
      jobId,
      tutorId,
    }: {
      jobId: number;
      tutorId: number;
    }) => adminService.createMatch({ job_id: jobId, tutor_id: tutorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Match created and assigned successfully!");
      router.push("/admin/matches");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create match");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0096D6] border-t-transparent" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-gray-900">Application Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The requested application #{id} could not be located or has been removed.
        </p>
        <Link
          href={`/admin/jobs/${app.job_id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Job
        </Link>
      </div>
    );
  }

  const tutor = app.Tutor || {};
  const job = app.Job || {};
  const tutorName = `${tutor.first_name || ""} ${tutor.last_name || ""}`.trim() || `Tutor #${app.tutor_id}`;
  const jobDetails = [
    job.subjects,
    job.student_level,
    job.location,
  ].filter(Boolean).join(" · ");
  const jobLabel = `Job #${app.job_id}${jobDetails ? ` (${jobDetails})` : ""}`;

  const cvUrl = tutor.cv_file ? resolveFileUrl(tutor.cv_file) : null;
  const certUrl = tutor.education_file ? resolveFileUrl(tutor.education_file) : null;

  const handleShortlist = () => {
    setConfirmState({
      isOpen: true,
      title: "Shortlist Candidate?",
      message: `Move ${tutorName} to Shortlisted status for ${jobLabel}?`,
      type: "info",
      action: async () => {
        await updateStatusMutation.mutateAsync({
          appId: app.id,
          status: "shortlisted",
        });
      },
    });
  };

  const handleMatch = () => {
    setConfirmState({
      isOpen: true,
      title: `Match & Assign ${tutorName}?`,
      message: `Assign ${tutorName} to ${jobLabel}? The job status will become MATCHED and the Telegram broadcast post will be updated to [POSITION FILLED].`,
      type: "success",
      action: async () => {
        await createMatchMutation.mutateAsync({
          jobId: app.job_id,
          tutorId: app.tutor_id,
        });
      },
    });
  };

  const handleReject = () => {
    setConfirmState({
      isOpen: true,
      title: "Reject Application?",
      message: `Are you sure you want to reject ${tutorName}'s application for ${jobLabel}?`,
      type: "danger",
      action: async () => {
        await updateStatusMutation.mutateAsync({
          appId: app.id,
          status: "rejected",
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top bar navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/admin/jobs/${app.job_id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Job
        </Link>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Application #{app.id}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              app.status === "shortlisted"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : app.status === "matched"
                ? "bg-green-100 text-green-700 border border-green-200"
                : app.status === "rejected"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {app.status === "matched" && <CheckCircle2 className="h-3 w-3" />}
            {app.status === "rejected" && <XCircle className="h-3 w-3" />}
            {app.status === "shortlisted" && <Award className="h-3 w-3" />}
            {app.status === "applied" && <Clock className="h-3 w-3" />}
            {app.status}
          </span>
        </div>
      </div>

      {/* Action Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900">
              Candidate Application Review
            </h1>
            <p className="text-sm text-gray-500">
              Submitted on{" "}
              <span className="font-medium text-gray-700">
                {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Recent"}
              </span>{" "}
              via {app.applied_via || "Telegram Bot"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {app.status !== "shortlisted" && app.status !== "matched" && (
              <button
                type="button"
                onClick={handleShortlist}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 active:scale-95 disabled:opacity-50"
              >
                <Award className="h-4 w-4" /> Shortlist Candidate
              </button>
            )}

            {app.status !== "matched" && (
              <button
                type="button"
                onClick={handleMatch}
                disabled={createMatchMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Finalize Match & Assign
              </button>
            )}

            {app.status !== "rejected" && (
              <button
                type="button"
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Tutor Profile vs Target Job */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tutor Profile Card */}
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0096D6]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{tutorName}</h2>
                <p className="text-xs text-gray-500">ID: #{tutor.id || app.tutor_id}</p>
              </div>
            </div>

            <Link
              href={`/admin/tutors/${tutor.id || app.tutor_id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0096D6] hover:underline"
            >
              Full Profile <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Tutor Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Phone Number</span>
              <p className="mt-1 font-semibold text-gray-800">
                {tutor.phone_number || "Not provided"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Email</span>
              <p className="mt-1 font-semibold text-gray-800 truncate">
                {tutor.email || "Not provided"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Location / City</span>
              <p className="mt-1 font-semibold text-gray-800">
                {tutor.city || "Addis Ababa"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Gender</span>
              <p className="mt-1 font-semibold text-gray-800">
                {tutor.gender || "Not specified"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Expected Rate</span>
              <p className="mt-1 font-semibold text-gray-800">
                {tutor.hourly_rate ? `${tutor.hourly_rate} ETB/hr` : "Negotiable"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Teaching Mode</span>
              <p className="mt-1 font-semibold text-gray-800">
                {tutor.teaching_mode || "In-person & Online"}
              </p>
            </div>
          </div>

          {/* Education & Qualifications */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Education & Background
            </span>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 text-xs text-gray-700">
              {tutor.education || "No education background provided"}
            </div>
          </div>

          {/* Subjects & Grade levels */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Subjects Offered
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects ? (
                tutor.subjects.split(",").map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100"
                  >
                    {s.trim()}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">General</span>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Verified Documents
            </span>
            <div className="flex flex-wrap gap-3">
              {cvUrl ? (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:border-[#0096D6] hover:text-[#0096D6]"
                >
                  <FileText className="h-4 w-4 text-[#0096D6]" />
                  View Uploaded CV
                </a>
              ) : (
                <span className="text-xs text-gray-400 italic">No CV uploaded</span>
              )}

              {certUrl ? (
                <a
                  href={certUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:border-[#0096D6] hover:text-[#0096D6]"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  View Education Certificate
                </a>
              ) : (
                <span className="text-xs text-gray-400 italic">No certificate uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Target Job Card */}
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Target Tutoring Job</h2>
                <p className="text-xs text-gray-500">Job #{job.id || app.job_id}</p>
              </div>
            </div>

            <Link
              href={`/admin/jobs/${job.id || app.job_id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0096D6] hover:underline"
            >
              Job Details <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Subjects Required</span>
              <p className="mt-1 font-semibold text-gray-800">
                {job.subjects || "General Tutoring"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Student Level</span>
              <p className="mt-1 font-semibold text-gray-800">
                {job.student_level || "Any Grade"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Location / Area</span>
              <p className="mt-1 font-semibold text-gray-800">
                {job.location || "Addis Ababa"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Parent Budget</span>
              <p className="mt-1 font-semibold text-emerald-700 font-bold">
                {job.salary ? `${job.salary} ETB` : "Not specified"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Days per Week</span>
              <p className="mt-1 font-semibold text-gray-800">
                {job.days_per_week ? `${job.days_per_week} days/week` : "Flexible"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3.5">
              <span className="text-gray-400">Current Job Status</span>
              <p className="mt-1 font-bold text-gray-800 uppercase tracking-wide">
                {job.status || "OPEN"}
              </p>
            </div>
          </div>

          {/* Job Special Requirements */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Student Gender & Preferences
            </span>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 text-xs text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Preferred Tutor Gender:</span>{" "}
                {job.gender_preference || "Any"}
              </p>
              {job.special_requirements && (
                <p className="mt-1">
                  <span className="font-semibold text-gray-900">Notes:</span>{" "}
                  {job.special_requirements}
                </p>
              )}
            </div>
          </div>

          {/* Application Cover / Note */}
          {app.notes && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Application Message / Note
              </span>
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs text-gray-800">
                {app.notes}
              </div>
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
