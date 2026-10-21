import React from "react";

interface CompactTableProps {
  children: React.ReactNode;
  className?: string;
}

export function CompactTable({ children, className = "" }: CompactTableProps) {
  return (
    <div className={`overflow-x-auto custom-scrollbar ${className}`}>
      <table className="w-full text-left border-collapse border border-gray-200 dark:border-slate-700/80">{children}</table>
    </div>
  );
}

export function CompactTableHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <thead>
      <tr className={`border-b border-gray-300 dark:border-slate-700 bg-gray-50/80 dark:bg-[#080b14] text-[11px] font-bold text-sidebar-label uppercase tracking-wider ${className}`}>
        {children}
      </tr>
    </thead>
  );
}

export function CompactTh({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`py-2 px-4 border border-gray-200 dark:border-slate-700/80 ${className}`}>{children}</th>;
}

export function CompactTd({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`py-2 px-4 border border-gray-200 dark:border-slate-700/80 ${className}`}>{children}</td>;
}
