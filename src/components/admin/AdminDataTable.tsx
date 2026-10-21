"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Search,
} from "lucide-react";

export type SortDir = "asc" | "desc" | null;

export interface ToolbarFilterDef {
  key: string;
  label: string;
  /** Options for a dropdown - if provided, renders a select. Otherwise text input. */
  options?: string[];
  placeholder?: string;
}

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render: (row: T, index: number) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

export interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  toolbarFilters?: ToolbarFilterDef[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
}

type Sort = { key: string; dir: SortDir };

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyTitle = "No data",
  emptyDescription = "Nothing to show yet.",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  toolbarFilters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
}: AdminDataTableProps<T>) {
  const [sort, setSort] = useState<Sort>({ key: "", dir: null });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filterKey = JSON.stringify(filterValues);
  useEffect(() => { setPage(1); }, [rows.length, sort, pageSize, filterKey, searchValue]);

  const getValue = (col: ColumnDef<T>, row: T): string | number => {
    if (col.sortValue) return col.sortValue(row);
    const v = (row as any)[col.key];
    return v ?? "";
  };

  // M2: stable memo — sort only when rows / sort key / sort dir change.
  // `columns` is a fresh array on every render, so we deliberately exclude it
  // from the deps and instead derive `sortValue` from the closure.
  const sortedRows = useMemo(() => {
    if (!sort.key || !sort.dir) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = getValue(col, a);
      const bv = getValue(col, b);
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
    });
    return sort.dir === "desc" ? sorted.reverse() : sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort.key, sort.dir]);

  const total = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pagedRows = sortedRows.slice(start, end);

  const handleSort = (key: string) => {
    if (sort.key !== key) setSort({ key, dir: "asc" });
    else if (sort.dir === "asc") setSort({ key, dir: "desc" });
    else if (sort.dir === "desc") setSort({ key: "", dir: null });
    else setSort({ key, dir: "asc" });
  };

  const pageButtons: (number | "...")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const out: (number | "...")[] = [1];
    if (safePage > 3) out.push("...");
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) out.push(p);
    if (safePage < totalPages - 2) out.push("...");
    out.push(totalPages);
    return out;
  })();

  const hasActiveFilters = Object.values(filterValues).some((v) => v);

  return (
    <div className="space-y-4">
      {(onSearchChange !== undefined || toolbarFilters.length > 0) && (
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
              />
            </div>
          )}

          {toolbarFilters.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {toolbarFilters.map((f) => (
                <div key={f.key} className="relative">
                  {f.options ? (
                    <select
                      value={filterValues[f.key] ?? ""}
                      onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                      className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-8 text-sm font-semibold text-gray-700 outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                    >
                      <option value="">{f.label}: All</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>{f.label}: {opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={f.placeholder || f.label}
                      value={filterValues[f.key] ?? ""}
                      onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                      className="w-full sm:w-48 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                    />
                  )}
                </div>
              ))}

              {hasActiveFilters && onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading...</div>
        ) : pagedRows.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-[#2D2A32]">{emptyTitle}</h3>
            <p className="mt-2 text-sm text-gray-500">{emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] md:min-w-[900px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {columns.map((col) => {
                    const isSorted = sort.key === col.key;
                    const Icon = !col.sortable
                      ? null
                      : isSorted
                      ? sort.dir === "asc" ? ChevronUp : ChevronDown
                      : ChevronsUpDown;
                    return (
                      <th
                        key={col.key}
                        style={col.width ? { width: col.width } : undefined}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        className={`px-4 py-3 border-r border-gray-200 last:border-r-0 ${
                          col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                        } ${col.sortable ? "cursor-pointer select-none hover:bg-gray-100" : ""}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.header}
                          {Icon && (
                            <Icon
                              size={12}
                              className={isSorted ? "text-[#0096D6]" : "text-gray-400"}
                            />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedRows.map((row, i) => (
                  <tr key={rowKey(row)} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 border-r border-gray-200 last:border-r-0 text-sm ${
                          col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.render(row, start + i)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/50 px-3 sm:px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-600 sm:justify-start">
            <span>{total === 0 ? "0" : `${start + 1}-${end}`} of {total}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#0096D6]"
            >
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {pageButtons.map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="px-2 text-xs text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded px-2 text-xs font-bold transition ${
                    safePage === p
                      ? "bg-[#0096D6] text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || totalPages === 0}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}