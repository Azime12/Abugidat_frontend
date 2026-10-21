"use client";

import * as React from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  placement?: "top" | "bottom";
  /** When true, a search input is shown inside the dropdown to filter options */
  searchable?: boolean;
  required?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  placement = "bottom",
  searchable = false,
  required = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input with preventScroll to avoid scrolling the page
  React.useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchRef.current?.focus({ preventScroll: true });
      }, 50);
    }
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions =
    searchable && search.trim()
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

  return (
    <div className={cn("relative min-w-[200px]", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-card-border bg-background px-3 py-2 text-[13px] font-medium text-foreground outline-none transition-all cursor-pointer",
          "hover:bg-sidebar-item-hover/50 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10",
          disabled && "cursor-not-allowed opacity-50 hover:bg-background",
        )}
      >
        <span
          className={cn(
            "truncate",
            !selectedOption && !value && "text-sidebar-label/50",
          )}
        >
          {selectedOption ? selectedOption.label : value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-sidebar-label transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {required && (
        <input
          type="text"
          className="sr-only"
          value={value}
          readOnly
          required={required}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 w-full z-50 rounded-xl border border-card-border bg-card-bg shadow-xl shadow-black/15 animate-in fade-in-0 duration-150",
            placement === "top"
              ? "bottom-full mb-1.5 slide-in-from-bottom-2 origin-bottom"
              : "top-full mt-1.5 slide-in-from-top-2 origin-top",
          )}
        >
          {searchable && (
            <div className="p-1.5 border-b border-card-border">
              <div className="flex items-center gap-1.5 rounded-md border border-card-border bg-background px-2 py-1.5 focus-within:border-brand-primary/60 focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all">
                <Search size={12} className="shrink-0 text-sidebar-label" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-[12px] font-medium text-foreground placeholder:text-sidebar-label/50 outline-none"
                />
              </div>
            </div>
          )}

          <div className="overflow-auto max-h-56 custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-center text-[12px] font-medium text-sidebar-label">
                {search ? "No results found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] font-medium transition-colors cursor-pointer",
                    value === option.value
                      ? "bg-brand-primary/10 text-brand-primary font-semibold"
                      : "text-foreground hover:bg-sidebar-item-hover/70",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check size={14} className="shrink-0 text-brand-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
