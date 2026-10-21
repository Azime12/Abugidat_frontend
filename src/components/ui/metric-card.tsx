import React from "react";
import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  color = "text-blue-600 dark:text-blue-400",
  bgColor = "bg-blue-50 dark:bg-blue-950/40",
  borderColor = "border-gray-100 dark:border-gray-800",
  className = "",
  onClick,
}: MetricCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-card-bg rounded-xl border ${borderColor} shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className={`p-2.5 rounded-lg ${bgColor} ${color} shrink-0`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mt-0.5">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
};

export interface MetricGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 5;
  className?: string;
}

export const MetricGrid = ({ children, cols = 4, className = "" }: MetricGridProps) => {
  const colsClass =
    cols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : cols === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : cols === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-2 md:grid-cols-4";

  return <div className={`grid ${colsClass} gap-3 ${className}`}>{children}</div>;
};
