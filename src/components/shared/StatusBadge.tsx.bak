import React from "react";

export type StatusVariant =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "MAINTENANCE"
  | "SUSPENDED"
  | "OUTSOURCE"
  | "PRIVATE"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | string;

const variantStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  CREATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  SUSPENDED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  MAINTENANCE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  UPDATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  OUTSOURCE: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  PRIVATE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const key = (status || "").toUpperCase();
  const styles = variantStyles[key] || "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-tight border ${styles} ${className}`}
    >
      {label || status}
    </span>
  );
}
