import React from "react";
import { LucideIcon, FileX2 } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileX2,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`py-16 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-background/80 text-sidebar-label flex items-center justify-center border border-card-border shadow-xs">
        <Icon size={22} className="opacity-50" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-foreground">{title}</p>
        {description && <p className="text-[11px] text-sidebar-label max-w-sm">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
