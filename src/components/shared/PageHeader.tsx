import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          {Icon && <Icon className="text-brand-primary shrink-0" size={24} />}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-[13px] font-semibold text-sidebar-label mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
