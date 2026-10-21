"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import client from "@/lib/api-client";
import { Link, useRouter } from "@/i18n/routing";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Ban,
  Star,
  Loader2,
  AlertCircle,
  ExternalLink,
  Coins,
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveFileUrl } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function TutorDetailPage({ params }: PageProps) {
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
    queryKey: ["admin", "tutor", id],
    queryFn: async () => {
      const res = await adminService.getTutorById(id);
      return res.data;
    },
  });

  const { data: agentsData } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: async () => {
      const res = await adminService.getAgents();
      return res.data;
    },
  });

  const tutor = data?.tutor;
  const agents = agentsData?.agents || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      client.patch(`/tutors/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tutor", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tutors"] });
      const msg =
        variables.status === "approved"
          ? "Tutor approved successfully (granted 10 Kulf credits)."
          : variables.status === "rejected"
          ? "Tutor application rejected."
          : "Tutor status updated to " + variables.status;
      toast.success(msg);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update tutor status");
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (isFeatured: boolean) =>
      client.patch(`/tutors/${id}/featured`, { is_featured: isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tutor", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tutors"] });
      toast.success("Featured status updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to toggle featured status");
    },
  });

  const assignAgentMutation = useMutation({
    mutationFn: (agentId: number | null) =>
      adminService.assignTutorToAgent(Number(id), agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tutor", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tutors"] });
      toast.success("Assigned partner agent updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign agent");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0096D6] border-t-transparent" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-gray-900">Tutor Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The requested tutor profile #{id} does not exist or has been removed.
        </p>
        <Link
          href="/admin/tutors"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tutors
        </Link>
      </div>
    );
  }

  const tutorName = `${tutor.first_name || ""} ${tutor.last_name || ""}`.trim() || `Tutor #${tutor.id}`;
  const cvUrl = tutor.cv_file ? resolveFileUrl(tutor.cv_file) : null;
  const certUrl = tutor.education_file ? resolveFileUrl(tutor.education_file) : null;
  const kulfLedger = tutor.kulfLedger || [];

  const handleApprove = () => {
    setConfirmState({
      isOpen: true,
      title: `Approve ${tutorName}?`,
      message: `Approving ${tutorName} will activate their profile, grant 10 free Kulf credits, and allow them to receive tutor match requests.`,
      type: "success",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "approved" });
      },
    });
  };

  const handleReject = () => {
    setConfirmState({
      isOpen: true,
      title: `Reject ${tutorName}?`,
      message: `Reject ${tutorName}'s application? They will not be listed or assigned to tutoring jobs.`,
      type: "danger",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "rejected" });
      },
    });
  };

  const handleHide = () => {
    setConfirmState({
      isOpen: true,
      title: `Hide ${tutorName}?`,
      message: `Hiding ${tutorName} will temporarily remove them from the public platform and job matching.`,
      type: "warning",
      action: async () => {
        await updateStatusMutation.mutateAsync({ status: "hidden" });
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/tutors"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tutors List
        </Link>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tutor #{tutor.id}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              tutor.status === "approved"
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : tutor.status === "rejected"
                ? "bg-red-100 text-red-700 border border-red-200"
                : tutor.status === "hidden"
                ? "bg-gray-100 text-gray-700 border border-gray-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            {tutor.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
            {tutor.status === "rejected" && <XCircle className="h-3 w-3" />}
            {tutor.status === "hidden" && <Ban className="h-3 w-3" />}
            {tutor.status}
          </span>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-[#0096D6] text-white shadow-sm font-black text-2xl">
              {tutor.first_name ? tutor.first_name[0] : "T"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">{tutorName}</h1>
                {tutor.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Featured
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>📍 {tutor.city || "Addis Ababa"}</span>
                <span>• Joined {tutor.created_at ? new Date(tutor.created_at).toLocaleDateString() : "Recent"}</span>
                {tutor.telegram_id && <span>• Telegram ID: {tutor.telegram_id}</span>}
              </p>
            </div>
          </div>

          {/* Action Workflow Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => toggleFeaturedMutation.mutate(!tutor.is_featured)}
              disabled={toggleFeaturedMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                tutor.is_featured
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Star className={`h-4 w-4 ${tutor.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
              {tutor.is_featured ? "Unfeature Tutor" : "Feature (⭐ Top Rank)"}
            </button>

            {tutor.status !== "approved" && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve Tutor
              </button>
            )}

            {tutor.status !== "hidden" && tutor.status !== "rejected" && (
              <button
                type="button"
                onClick={handleHide}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" /> Hide
              </button>
            )}

            {tutor.status !== "rejected" && (
              <button
                type="button"
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4 text-xs">
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Phone Number</span>
            <p className="mt-1 font-bold text-gray-800">{tutor.phone_number || "—"}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Email Address</span>
            <p className="mt-1 font-bold text-gray-800 truncate">{tutor.email || "—"}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Hourly Rate</span>
            <p className="mt-1 font-bold text-[#0096D6]">
              {tutor.hourly_rate ? `${tutor.hourly_rate} ETB/hr` : "Negotiable"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Kulf Balance</span>
            <p className="mt-1 font-bold text-emerald-700 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5" /> {tutor.kulf_balance ?? 0} Credits
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Gender</span>
            <p className="mt-1 font-semibold text-gray-800">{tutor.gender || "Not set"}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Student Preference</span>
            <p className="mt-1 font-semibold text-gray-800">{tutor.student_gender_preference || "Any"}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Teaching Mode</span>
            <p className="mt-1 font-semibold text-gray-800">{tutor.teaching_mode || "Flexible"}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <span className="text-gray-400">Referral Code</span>
            <p className="mt-1 font-semibold font-mono text-gray-800">{tutor.referral_code || "—"}</p>
          </div>
        </div>

        {/* Partner Agent Assignment */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 text-xs">
          <label className="block font-bold text-gray-800 flex items-center gap-1.5 mb-2">
            <Building2 className="h-4 w-4 text-[#0096D6]" /> Partner Agent Tag:
          </label>
          <div className="flex max-w-md gap-2">
            <select
              value={tutor.agent_id || ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                assignAgentMutation.mutate(val);
              }}
              disabled={assignAgentMutation.isPending}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#0096D6]"
            >
              <option value="">No Agent (Direct Registration)</option>
              {agents.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.agency_name ? `(${a.agency_name})` : ""}
                </option>
              ))}
            </select>
            {tutor.agent && (
              <span className="inline-flex items-center text-xs text-gray-500 font-medium">
                Current: {tutor.agent.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Qualifications & Verification Documents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Background & Bio */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-xs">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <GraduationCap className="h-5 w-5 text-[#0096D6]" /> Education & Teaching Background
          </h2>

          <div className="space-y-3">
            <div>
              <span className="font-bold text-gray-500 block mb-1">Education Background:</span>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-gray-800 leading-relaxed">
                {tutor.education || "No formal education details provided."}
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-500 block mb-1">Subjects Offered:</span>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects ? (
                  tutor.subjects.split(",").map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {s.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">General</span>
                )}
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-500 block mb-1">Grade Levels:</span>
              <div className="flex flex-wrap gap-1.5">
                {tutor.grade_levels ? (
                  tutor.grade_levels.split(",").map((g: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {g.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Any grade</span>
                )}
              </div>
            </div>

            {tutor.experience && (
              <div>
                <span className="font-bold text-gray-500 block mb-1">Teaching Experience / Bio:</span>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-gray-800 leading-relaxed">
                  {tutor.experience}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Documents & Verification */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-xs">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="h-5 w-5 text-[#0096D6]" /> Uploaded Credentials & Verification
          </h2>

          <div className="space-y-4">
            <div>
              <span className="font-bold text-gray-700 block mb-2 uppercase tracking-wider text-[11px]">
                Curriculum Vitae (CV)
              </span>
              {cvUrl ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">Tutor CV Document</p>
                      <p className="text-[11px] text-emerald-700">Uploaded for verification</p>
                    </div>
                  </div>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View CV
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-center text-gray-400 italic">
                  No CV uploaded by tutor
                </div>
              )}
            </div>

            <div>
              <span className="font-bold text-gray-700 block mb-2 uppercase tracking-wider text-[11px]">
                Educational Certificate / Degree
              </span>
              {certUrl ? (
                <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-900">Degree / Certificate</p>
                      <p className="text-[11px] text-blue-700">Formal education verification</p>
                    </div>
                  </div>
                  <a
                    href={certUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#007FB8] transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View Certificate
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-center text-gray-400 italic">
                  No certificate uploaded by tutor
                </div>
              )}
            </div>

            {/* Profile Summary Details */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">Registered Location:</span>
                <span className="font-bold text-gray-900">{tutor.city || "Addis Ababa"}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">Telegram ID:</span>
                <span className="font-mono font-bold text-gray-900">{tutor.telegram_id || "Not linked"}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">Application Status:</span>
                <span className="font-bold capitalize text-gray-900">{tutor.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kulf Balance & Ledger */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Kulf Credit Ledger ({kulfLedger.length})
            </h2>
          </div>
          <span className="text-xs font-bold text-[#0096D6]">
            Current Balance: {tutor.kulf_balance ?? 0} Kulf
          </span>
        </div>

        {kulfLedger.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No Kulf ledger activity recorded yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Balance After</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kulfLedger.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-600">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-bold uppercase text-gray-700">
                      {entry.transaction_type || entry.type || "CREDIT"}
                    </td>
                    <td className="px-4 py-2.5 font-bold">
                      <span className={entry.amount > 0 ? "text-emerald-600" : "text-red-500"}>
                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">
                      {entry.balance_after ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{entry.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
