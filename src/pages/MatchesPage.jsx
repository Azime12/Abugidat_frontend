import { useState } from "react";
import { useGetMatchesQuery, useCreateMatchMutation } from "../redux/api/matchApiSlice";
import { useGetJobsQuery } from "../redux/api/jobApiSlice";
import { useGetTutorsQuery } from "../redux/api/tutorApiSlice";
import { useGetApplicationsQuery } from "../redux/api/applicationApiSlice";
import Loading from "../components/others/Loading";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  MdHandshake,
  MdWork,
  MdPerson,
  MdAccessTime,
  MdCalendarToday,
} from "react-icons/md";
import { motion } from "framer-motion";
import PageHeader from "../components/shared/PageHeader";
import Badge from "../components/shared/Badge";
import Table from "../components/shared/Table";

const billingLabels = {
  pending_collection: "Pending Collection",
  collected: "Collected",
  overdue: "Overdue",
};

/**
 * Displays a live preview of the commission before submitting.
 */
function CommissionPreview({ jobId, hoursPerSession, sessionsPerWeek, jobs }) {
  const job = jobs.find((j) => j.id === Number(jobId));
  if (!job || !hoursPerSession || !sessionsPerWeek) {
    return (
      <div className="text-xs text-gray-400 italic">
        Select a job and enter hours/sessions to see commission preview
      </div>
    );
  }

  const salary = parseFloat(job.hourly_salary);
  const hours = parseFloat(hoursPerSession);
  const sessions = parseInt(sessionsPerWeek);
  if (isNaN(salary) || isNaN(hours) || isNaN(sessions)) {
    return <div className="text-xs text-gray-400">Invalid input</div>;
  }

  const monthlyHours = hours * sessions * 4;
  const commission = salary * hours * sessions * 4 * 0.6;

  return (
    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs space-y-1">
      <div className="flex justify-between text-text-sub">
        <span>Hourly Rate</span>
        <span className="font-medium">{salary} ETB</span>
      </div>
      <div className="flex justify-between text-text-sub">
        <span>Monthly Hours</span>
        <span className="font-medium">{monthlyHours}h</span>
      </div>
      <div className="flex justify-between text-text-sub">
        <span>Monthly Salary</span>
        <span className="font-medium">{(salary * monthlyHours).toLocaleString()} ETB</span>
      </div>
      <div className="border-t border-blue-200 pt-1 flex justify-between font-semibold text-primary">
        <span>Commission (60%)</span>
        <span>{commission.toLocaleString()} ETB</span>
      </div>
    </div>
  );
}

const MatchesPage = () => {
  const { t } = useTranslation();
  const { data: matchesData, isLoading } = useGetMatchesQuery();
  const { data: jobsData } = useGetJobsQuery();
  const { data: tutorsData } = useGetTutorsQuery();
  const { data: appsData } = useGetApplicationsQuery({ status: "shortlisted" });
  const [createMatch] = useCreateMatchMutation();

  const [form, setForm] = useState({
    job_id: "",
    tutor_id: "",
    hours_per_session: "1",
    sessions_per_week: "3",
  });

  const jobs = jobsData?.jobs || [];
  const tutors = tutorsData?.tutors || [];
  const matches = matchesData?.matches || [];

  const approvedJobs = jobs.filter((j) => j.status === "approved");
  const shortlistedTutorIds = [
    ...new Set((appsData?.applications || []).map((a) => a.tutor_id)),
  ];

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!form.job_id || !form.tutor_id) {
      toast.error("Please select a job and a tutor");
      return;
    }
    try {
      const result = await createMatch(form).unwrap();
      const msg = result.parent_notified
        ? "Match created! Parent has been notified."
        : "Match created! Parent notification was not sent (manual follow-up may be needed).";
      toast.success(msg);
      setForm({
        job_id: "",
        tutor_id: "",
        hours_per_session: "1",
        sessions_per_week: "3",
      });
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  if (isLoading) return <Loading />;

  const columns = [
    {
      key: "job",
      header: "Job",
      render: (m) => <span className="font-mono font-medium">#{m.job_id}</span>,
    },
    {
      key: "tutor",
      header: "Tutor",
      render: (m) => <span className="font-mono">#{m.tutor_id}</span>,
    },
    {
      key: "hours",
      header: t("hoursPerSession"),
      render: (m) => `${m.hours_per_session}h`,
    },
    {
      key: "sessions",
      header: t("sessionsPerWeek"),
      render: (m) => `${m.sessions_per_week}x/wk`,
    },
    {
      key: "commission",
      header: t("commission"),
      render: (m) => (
        <span className="font-semibold text-accent-green">
          {Number(m.commission).toLocaleString()} ETB
        </span>
      ),
    },
    {
      key: "billing",
      header: t("billingStatus"),
      render: (m) => (
        <Badge variant={m.billing_status}>
          {billingLabels[m.billing_status] || m.billing_status}
        </Badge>
      ),
    },
    {
      key: "dueDate",
      header: t("dueDate"),
      render: (m) => <span className="text-text-sub">{m.due_date}</span>,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title={t("matches")} subtitle="Match tutors to approved jobs" />

      {/* Create Match Form */}
      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <MdHandshake size={22} className="text-primary" />
          <h2 className="text-lg font-semibold text-primary">Create New Match</h2>
        </div>

        <form onSubmit={handleCreateMatch} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-sub mb-1.5">
                <MdWork size={15} className="text-primary" />
                Job
              </label>
              <select
                value={form.job_id}
                onChange={(e) => {
                  setForm((f) => ({ ...f, job_id: e.target.value, tutor_id: "" }));
                }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-300 cursor-pointer"
                required
              >
                <option value="">Select an approved job...</option>
                {approvedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    #{job.id} — {job.subjects} ({job.student_level}) — {job.hourly_salary} ETB/hr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-sub mb-1.5">
                <MdPerson size={15} className="text-primary" />
                Tutor
              </label>
              <select
                value={form.tutor_id}
                onChange={(e) => setForm((f) => ({ ...f, tutor_id: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-300 cursor-pointer"
                required
              >
                <option value="">
                  {shortlistedTutorIds.length > 0
                    ? "Select a shortlisted tutor..."
                    : "No shortlisted tutors available"}
                </option>
                {tutors
                  .filter((t) => shortlistedTutorIds.includes(t.id))
                  .map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      #{tutor.id} — {tutor.first_name} {tutor.last_name}
                      {tutor.accumulated_invites_balance > 0
                        ? ` (${tutor.accumulated_invites_balance} invites)`
                        : ""}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-sub mb-1.5">
                <MdAccessTime size={15} className="text-primary" />
                {t("hoursPerSession")}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={form.hours_per_session}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hours_per_session: e.target.value }))
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-300"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-sub mb-1.5">
                <MdCalendarToday size={15} className="text-primary" />
                {t("sessionsPerWeek")}
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={form.sessions_per_week}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sessions_per_week: e.target.value }))
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-300"
                required
              />
            </div>
          </div>

          <CommissionPreview
            jobId={form.job_id}
            hoursPerSession={form.hours_per_session}
            sessionsPerWeek={form.sessions_per_week}
            jobs={jobs}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full md:w-auto px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-lg shadow-primary/20"
          >
            Create Match
          </motion.button>
        </form>
      </div>

      {/* Matches Table */}
      <Table
        columns={columns}
        data={matches}
        header={
          <div className="flex items-center gap-2">
            <MdHandshake size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              Matches ({matches.length})
            </h2>
          </div>
        }
        emptyState={
          <div className="p-12 text-center">
            <MdHandshake size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-text-sub text-sm font-medium">{t("noData")}</p>
            <p className="text-gray-400 text-xs mt-1">
              Create your first match using the form above.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default MatchesPage;
