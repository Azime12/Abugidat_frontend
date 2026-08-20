import { useGetTutorsQuery, useUpdateTutorMutation, useDeleteTutorMutation } from "../redux/api/tutorApiSlice";
import { motion } from "framer-motion";
import Loading from "../components/others/Loading";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import PageHeader from "../components/shared/PageHeader";
import Badge from "../components/shared/Badge";
import ErrorDisplay from "../components/shared/ErrorDisplay";
import Table from "../components/shared/Table";
import useConfirm from "../hooks/useConfirm";

const TutorsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetTutorsQuery();
  const [updateTutor] = useUpdateTutorMutation();
  const [deleteTutor] = useDeleteTutorMutation();
  const [confirmDialog, confirm] = useConfirm();

  const handleToggleAdmin = async (id, currentValue) => {
    try {
      await updateTutor({ id, is_admin: !currentValue }).unwrap();
      toast.success(t("updated"));
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Tutor",
      message: "Are you sure you want to delete this tutor? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteTutor(id).unwrap();
      toast.success("Tutor deleted");
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="p-6"><ErrorDisplay message={error?.data?.message || error.message || "Failed to load tutors"} /></div>;

  const tutors = data?.tutors || [];

  const columns = [
    {
      key: "name",
      header: t("tutorName"),
      render: (tutor) => (
        <span className="font-medium">{tutor.first_name} {tutor.last_name}</span>
      ),
    },
    { key: "phone", header: t("phoneNumber"), render: (t) => t.phone_number || "-" },
    {
      key: "telegram",
      header: t("telegramId"),
      render: (t) => <span className="font-mono">{t.telegram_id}</span>,
    },
    {
      key: "invites",
      header: t("inviteBalance"),
      render: (t) => t.accumulated_invites_balance,
    },
    {
      key: "admin",
      header: t("isAdmin"),
      render: (t) => (
        <Badge variant={t.is_admin ? "success" : "default"}>
          {t.is_admin ? t("yes") : t("no")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      render: (t) => (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggleAdmin(t.id, t.is_admin)}
            className="px-3 py-1.5 text-xs font-medium bg-[#5AC6F0] text-white rounded-lg shadow-sm hover:shadow transition-all"
          >
            {t.is_admin ? t("no") : t("yes")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(t.id)}
            className="px-3 py-1.5 text-xs font-medium bg-status-error text-white rounded-lg shadow-sm hover:shadow transition-all"
          >
            {t("delete")}
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title={t("tutors")} subtitle="Manage registered tutors" />

      <Table
        columns={columns}
        data={tutors}
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

export default TutorsPage;
