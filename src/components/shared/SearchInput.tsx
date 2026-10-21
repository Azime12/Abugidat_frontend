import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sidebar-label/60" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-card-border bg-white dark:bg-card-bg py-2 pl-9 pr-8 text-xs font-medium text-foreground placeholder:text-sidebar-label/60 outline-none focus:border-brand-primary transition-all shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sidebar-label hover:text-foreground"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
