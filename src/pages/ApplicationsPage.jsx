import { useState } from "react";
import { motion } from "framer-motion";
import { useGetApplicationsQuery, useUpdateApplicationStatusMutation } from "../redux/api/applicationApiSlice";
import { useGetJobsQuery } from "../redux/api/jobApiSlice";
import { useGetTutorsQuery } from "../redux/api/tutorApiSlice";
import Loading from "../components/others/Loading";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdClose, MdCheckCircle, MdCancel, MdPerson, MdWork, MdDescription } from "react-icons/md";
import PageHeader from "../components/shared/PageHeader";
import FilterBar from "../components/shared/FilterBar";
import Badge from "../components/shared/Badge";
import ErrorDisplay from "../components/shared/ErrorDisplay";
import Table from "../components/shared/Table";

const rejectionPresets = [
  "Insufficient qualifications",
  "Experience requirement not met",
  "Location not suitable",
  "Subject expertise mismatch",
  "Schedule conflict",
  "Incomplete profile",
];

/**
 * Rejection Modal — clean overlay for providing a rejection reason.
 */
function RejectModal({ application, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setReason(preset);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning("Please provide a rejection reason");
      return;
    }
    setIsSubmitting(true);
    await onConfirm(application.id, "rejected", reason.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MdCancel size={22} className="text-red-500" />
            <h3 className="text-lg font-semibold text-text-main">Reject Application</h3>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <MdClose size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-text-sub">
            Rejecting application <span className="font-mono font-medium text-text-main">#{application.id}</span>
          </p>

          <div>
            <label className="block text-xs font-medium text-text-sub mb-2">Quick select a reason</label>
            <div className="flex flex-wrap gap-2">
              {rejectionPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedPreset === preset
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-200 text-text-sub hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-sub mb-1.5">
              Or write a custom reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setSelectedPreset("");
              }}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-sub bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? "Rejecting..." : "Reject Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ApplicationsPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const { data, isLoading, error } = useGetApplicationsQuery(filter ? { status: filter } : {});
  const { data: jobsData } = useGetJobsQuery();
  const { data: tutorsData } = useGetTutorsQuery();
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [rejectModalApp, setRejectModalApp] = useState(null);

  const jobs = jobsData?.jobs || [];
  const tutors = tutorsData?.tutors || [];

  const getJobInfo = (jobId) => jobs.find((j) => j.id === jobId);
  const getTutorInfo = (tutorId) => tutors.find((t) => t.id === tutorId);

  const handleShortlist = async (id) => {
    try {
      await updateStatus({ id, status: "shortlisted" }).unwrap();
      toast.success(`${t("updated")}: shortlisted`);
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  const handleReject = async (id, status, reason) => {
    try {
      await updateStatus({ id, status, rejection_reason: reason }).unwrap();
      toast.success(`${t("updated")}: rejected`);
      setRejectModalApp(null);
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="p-6"><ErrorDisplay message={error?.data?.message || error.message || "Failed to load applications"} /></div>;

  const applications = data?.applications || [];
  const filterOptions = [
    { value: "", label: t("all") },
    { value: "pending", label: t("pending") },
    { value: "shortlisted", label: t("shortlisted") },
    { value: "rejected", label: t("rejected") },
  ];

  const columns = [
    {
      key: "job",
      header: "Job",
      render: (app) => {
        const job = getJobInfo(app.job_id);
        return (
          <div className="flex items-center gap-2">
            <MdWork size={16} className="text-gray-400 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-text-main">#{app.job_id}</span>
              {job && <span className="text-text-sub ml-1">{job.subjects}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "tutor",
      header: "Tutor",
      render: (app) => {
        const tutor = getTutorInfo(app.tutor_id);
        return (
          <div className="flex items-center gap-2">
            <MdPerson size={16} className="text-gray-400 shrink-0" />
            <div className="text-sm">
              <span className="font-mono font-medium text-text-main">#{app.tutor_id}</span>
              {tutor && (
                <span className="text-text-sub ml-1">
                  {tutor.first_name} {tutor.last_name}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("applicationStatus"),
      render: (app) => <Badge variant={app.status}>{t(app.status)}</Badge>,
    },
    {
      key: "rejectionReason",
      header: t("rejectionReason"),
      render: (app) =>
        app.rejection_reason ? (
          <span className="text-red-500 text-xs">{app.rejection_reason}</span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: "date",
      header: t("applyDate"),
      render: (app) => (
        <span className="text-text-sub">{new Date(app.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      render: (app) => (
        <>
          {app.status === "pending" && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShortlist(app.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MdCheckCircle size={14} />
                {t("shortlisted")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRejectModalApp(app)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <MdCancel size={14} />
                {t("reject")}
              </motion.button>
            </div>
          )}
          {app.status === "shortlisted" && (
            <span className="text-xs text-blue-500 font-medium">Shortlisted</span>
          )}
          {app.status === "rejected" && (
            <span className="text-xs text-red-400">Rejected</span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title={t("applications")} subtitle="Review and manage tutor applications">
        <FilterBar options={filterOptions} value={filter} onChange={setFilter} />
      </PageHeader>

      <Table
        columns={columns}
        data={applications}
        emptyState={
          <div className="p-12 text-center">
            <MdDescription size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-text-sub text-sm font-medium">{t("noData")}</p>
            <p className="text-gray-400 text-xs mt-1">No applications match the current filter.</p>
          </div>
        }
      />

      {rejectModalApp && (
        <RejectModal
          application={rejectModalApp}
          onConfirm={handleReject}
          onCancel={() => setRejectModalApp(null)}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;
