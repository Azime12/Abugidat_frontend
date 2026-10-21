import React from "react";
import { LucideIcon } from "lucide-react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
}

interface NavTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: "pill" | "underline";
  className?: string;
}

export function NavTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = "pill",
  className = "",
}: NavTabsProps<T>) {
  if (variant === "underline") {
    return (
      <div className={`flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all 
                border-b-2 -mb-px whitespace-nowrap cursor-pointer
                ${isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              {Icon && <Icon size={16} className="flex-shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`
                  px-2 py-0.5 rounded-full text-[11px] font-semibold
                  ${isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant (default)
  return (
    <div className={`flex  flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all 
              cursor-pointer whitespace-nowrap
              ${isActive
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }
            `}
          >
            {Icon && <Icon size={16} className="flex-shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                px-2 py-0.5 rounded-full text-[11px] font-semibold
                ${isActive
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  : "bg-gray-200/70 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}