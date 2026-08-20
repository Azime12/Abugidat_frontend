import { useState } from "react";
import { motion } from "framer-motion";
import { useGetJobsQuery, useUpdateJobStatusMutation, useDeleteJobMutation } from "../redux/api/jobApiSlice";
import Loading from "../components/others/Loading";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import PageHeader from "../components/shared/PageHeader";
import FilterBar from "../components/shared/FilterBar";
import Badge from "../components/shared/Badge";
import ErrorDisplay from "../components/shared/ErrorDisplay";
import Table from "../components/shared/Table";
import useConfirm from "../hooks/useConfirm";

const JobsPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const { data, isLoading, error } = useGetJobsQuery(filter || undefined);
  const [updateStatus] = useUpdateJobStatusMutation();
  const [deleteJob] = useDeleteJobMutation();
  const [confirmDialog, confirm] = useConfirm();

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`${t("updated")}: ${status}`);
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Job",
      message: "Are you sure you want to delete this job? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteJob(id).unwrap();
      toast.success("Job deleted");
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="p-6"><ErrorDisplay message={error?.data?.message || error.message || "Failed to load jobs"} /></div>;

  const jobs = data?.jobs || [];
  const filterOptions = [
    { value: "", label: t("all") },
    { value: "pending", label: t("pending") },
    { value: "approved", label: t("approved") },
    { value: "rejected", label: t("rejected") },
    { value: "matched", label: t("matched") },
  ];

  const columns = [
    { key: "parentName", header: t("parentName"), render: (j) => j.parent_name || "-" },
    { key: "studentLevel", header: t("studentLevel"), render: (j) => j.student_level },
    { key: "subjects", header: t("subjects"), render: (j) => j.subjects },
    { key: "location", header: t("location"), render: (j) => j.location },
    {
      key: "salary",
      header: t("hourlySalary"),
      render: (j) => <span className="font-medium">{j.hourly_salary} ETB</span>,
    },
    {
      key: "status",
      header: t("status"),
      render: (j) => <Badge variant={j.status}>{t(j.status)}</Badge>,
    },
    {
      key: "actions",
      header: t("actions"),
      cellClassName: "p-4",
      render: (j) => (
        <div className="flex gap-2">              {j.status === "pending" && (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange(j.id, "approved")}
                className="px-3 py-1.5 text-xs font-medium bg-accent-green text-white rounded-lg shadow-sm hover:shadow transition-all"
              >
                {t("approve")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange(j.id, "rejected")}
                className="px-3 py-1.5 text-xs font-medium bg-status-error text-white rounded-lg shadow-sm hover:shadow transition-all"
              >
                {t("reject")}
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(j.id)}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            {t("delete")}
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title={t("jobs")} subtitle="Manage and review job listings">
        <FilterBar options={filterOptions} value={filter} onChange={setFilter} />
      </PageHeader>

      <Table
        columns={columns}
        data={jobs}
        emptyState={
          <div className="p-12 text-center text-text-sub">
            <p className="text-sm">{t("noData")}</p>
          </div>
        }
      />

      {confirmDialog}
    </div>
  );
};

export default JobsPage;
