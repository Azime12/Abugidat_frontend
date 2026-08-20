import { useGetDashboardStatsQuery } from "../redux/api/dashboardApiSlice";
import Loading from "../components/others/Loading";
import { useTranslation } from "react-i18next";
import {
  MdWork,
  MdPeople,
  MdDescription,
  MdHandshake,
  MdTrendingUp,
  MdSchedule,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const statCardConfig = [
  { key: "totalJobs", icon: MdWork, color: "bg-brand-navy" },
  { key: "pendingJobs", icon: MdSchedule, color: "bg-brand-gold" },
  { key: "totalTutors", icon: MdPeople, color: "bg-brand-green" },
  { key: "pendingApplications", icon: MdDescription, color: "bg-brand-sky" },
];

const statCardConfig2 = [
  { key: "activeJobs", icon: MdCheckCircle, color: "bg-brand-navy" },
  { key: "totalMatches", icon: MdHandshake, color: "bg-brand-green" },
  { key: "totalJobs", icon: MdTrendingUp, color: "bg-brand-sky" },
];

/**
 * Animated counter — counts up from 0 to the target value on mount.
 */
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  return <span>{display}</span>;
}

function StatCard({ title, value, icon: Icon, color }) {
  const formattedValue =
    value !== undefined && value !== null
      ? Number(value).toLocaleString()
      : "0";

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${color} p-5 cursor-default`}
    >
      <Icon
        size={56}
        className="absolute -bottom-2 -right-2 text-white/20"
      />

      <div className="relative z-10">
        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-white text-3xl font-bold mt-1.5 tabular-nums">
          <AnimatedNumber value={formattedValue.replace(/,/g, "")} />
        </p>
      </div>
    </div>
  );
}

/**
 * Activity feed item with contextual color coding.
 */
function ActivityItem({ log }) {
  const getActionColor = (action) => {
    if (action.includes("approved") || action.includes("created")) return "border-l-green-500";
    if (action.includes("rejected")) return "border-l-red-500";
    if (action.includes("pending")) return "border-l-yellow-500";
    if (action.includes("matched")) return "border-l-blue-500";
    return "border-l-gray-300";
  };

  const getActionIcon = (action) => {
    if (action.includes("approved") || action.includes("created")) return "✅";
    if (action.includes("rejected")) return "❌";
    if (action.includes("pending")) return "⏳";
    if (action.includes("matched")) return "🤝";
    if (action.includes("broadcast")) return "📢";
    if (action.includes("invite")) return "👥";
    return "📝";
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getActionColor(log.action)} bg-gray-50/50 hover:bg-gray-100/50 transition-colors`}
    >
      <span className="text-sm leading-none mt-0.5" title={log.action}>
        {getActionIcon(log.action)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-main truncate font-medium">
          {log.action}
        </p>
        <p className="text-xs text-text-sub mt-0.5">
          {log.entity_type}
          {log.performed_by ? ` • ${log.performed_by}` : ""}
        </p>
      </div>
      <span className="text-xs text-text-sub whitespace-nowrap" title={new Date(log.created_at).toLocaleString()}>
        {timeAgo(log.created_at)}
      </span>
    </div>
  );
}

/**
 * Pulse skeleton for loading state.
 */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-gray-200 p-5 animate-pulse h-[110px]" />
  );
}

/**
 * Error banner.
 */
function ErrorBanner({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
    >
      <MdWarning size={20} className="shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

const DashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <div className="mb-8">
          <div className="h-8 w-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">{t("adminDashboard")}</h1>
        <ErrorBanner message={error?.data?.message || error.message || "Failed to load dashboard"} />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">{t("adminDashboard")}</h1>
        <p className="text-text-sub mt-1">Overview of the tutor matching platform</p>
      </motion.div>

      {/* Row 1 — Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {statCardConfig.map((cfg) => (
          <StatCard
            key={cfg.key}
            title={t(cfg.key)}
            value={
              cfg.key === "totalJobs"
                ? stats?.jobs?.total
                : cfg.key === "pendingJobs"
                ? stats?.jobs?.pending
                : cfg.key === "totalTutors"
                ? stats?.tutors?.total
                : stats?.applications?.pending
            }
            icon={cfg.icon}
            color={cfg.color}
          />
        ))}
      </div>

      {/* Row 2 — Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {statCardConfig2.map((cfg) => {
          let val;
          if (cfg.key === "activeJobs") val = stats?.jobs?.approved;
          else if (cfg.key === "totalMatches") val = stats?.matches?.total;
          else val = stats?.jobs?.total;
          return (
            <StatCard
              key={cfg.key}
              title={t(cfg.key)}
              value={val}
              icon={cfg.icon}
              color={cfg.color}
            />
          );
        })}
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-xl border border-brand-navy/10 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-primary">
              {t("recentActivity")}
            </h2>
            <span className="text-xs text-text-sub bg-brand-navy/5 px-2.5 py-1 rounded-lg">
              Latest {stats.recentActivity.length}
            </span>
          </div>
          <div className="space-y-2">
            {stats.recentActivity.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        </motion.div>
      )}

      {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}            transition={{ delay: 0.3 }}
          className="bg-surface rounded-xl border border-brand-navy/10 p-8 text-center"
        >
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-gray-100 rounded-full scale-150" />
            <MdTrendingUp size={40} className="relative text-gray-300" />
          </div>
          <p className="text-text-sub text-sm font-medium">No recent activity to display</p>
          <p className="text-gray-400 text-xs mt-1">
            Activity will appear here as jobs, applications, and matches are processed.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
