import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetSystemConfigQuery, useUpdateSystemConfigMutation } from "../redux/api/configApiSlice";
import Loading from "../components/others/Loading";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdSettings, MdInfo } from "react-icons/md";
import PageHeader from "../components/shared/PageHeader";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetSystemConfigQuery();
  const [updateConfig] = useUpdateSystemConfigMutation();
  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    if (data?.config) {
      setThreshold(data.config.required_invites_threshold);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateConfig({ required_invites_threshold: parseInt(threshold) }).unwrap();
      toast.success(t("updated"));
    } catch (err) {
      toast.error(err?.data?.message || t("errorOccurred"));
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title={t("settings")} subtitle="System configuration" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <MdSettings size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-primary">Invite Threshold</h2>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-2">
            <MdInfo size={16} className="text-primary-light shrink-0 mt-0.5" />
            <p className="text-xs text-text-sub leading-relaxed">
              Minimum number of invites a tutor needs before they can apply for a job. Set to 0 to disable.
            </p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-text-sub mb-1.5">{t("inviteThreshold")}</label>
            <input
              type="number"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-300"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all text-sm font-medium shadow-sm"
          >
            {t("update")}
          </motion.button>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6">
          <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
            <MdInfo size={15} className="text-text-sub" />
            Current Configuration
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-sub">Required Invite Threshold</span>
              <span className="font-medium text-text-main">{data?.config?.required_invites_threshold ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-sub">Active</span>
              <span className={`font-medium ${data?.config?.is_active ? "text-accent-green" : "text-text-sub"}`}>
                {data?.config?.is_active ? t("yes") : t("no")}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
