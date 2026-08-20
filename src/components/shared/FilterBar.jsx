export default function FilterBar({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 bg-brand-navy/5 p-1 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-brand-navy text-white"
              : "text-text-sub hover:text-brand-navy hover:bg-brand-navy/5"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
