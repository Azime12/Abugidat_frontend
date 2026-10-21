"use client";

import { Dropdown } from "@/components/ui/dropdown-select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  limitOptions?: number[];
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────
export const PaginationBar = ({
  page,
  totalPages,
  totalCount,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50, 100],
}: PaginationBarProps) => {
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);
  const tc = useTranslations("Common");

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-card-border bg-background/30 px-5 py-3">
      <div className="flex items-center gap-4">
        <p className="text-xs text-brand-primary font-medium">
          {tc("total")}{" "}
          <span className="font-bold text-foreground">{totalCount}</span>{" "}
          {tc("from")}{" "}
          <span className="font-bold text-foreground">{from}</span> {tc("to")}{" "}
          <span className="font-bold text-foreground">{to}</span>
        </p>
        <span className="text-sm ml-2">{tc("per_page")}</span>
        <Dropdown
          options={limitOptions.map((v) => ({
            value: String(v),
            label: `${v} `,
          }))}
          value={String(limit)}
          onChange={(val) => {
            onLimitChange(Number(val));
            onPageChange(1);
          }}
          placement="top"
          className="min-w-[120px]"
        />
      </div>
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-7 w-7 rounded border border-card-border bg-background flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>

        {/* Page number buttons with ellipsis */}
        {(() => {
          const pages: (number | "…")[] = [];
          if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            if (page > 4) pages.push("…");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 3) pages.push("…");
            pages.push(totalPages);
          }
          return pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="h-7 min-w-[28px] flex items-center justify-center text-[11px] text-sidebar-label select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`h-7 min-w-[28px] rounded px-2 text-[11px] font-bold transition-colors shadow-sm cursor-pointer ${
                  page === p
                    ? "bg-brand-primary text-white shadow-brand-primary/30"
                    : "border border-card-border bg-background text-foreground hover:bg-brand-primary/10 hover:border-brand-primary/40"
                }`}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </button>
            ),
          );
        })()}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="h-7 w-7 rounded border border-card-border bg-background flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
