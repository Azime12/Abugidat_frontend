const variantStyles = {
  pending: "bg-brand-gold/10 text-brand-gold border border-brand-gold/20",
  approved: "bg-brand-green/10 text-brand-green border border-brand-green/20",
  shortlisted: "bg-brand-sky/10 text-brand-sky border border-brand-sky/20",
  rejected: "bg-red-100 text-red-700 border border-red-200",
  collected: "bg-brand-green/10 text-brand-green border border-brand-green/20",
  pending_collection: "bg-brand-gold/10 text-brand-gold border border-brand-gold/20",
  overdue: "bg-red-100 text-red-700 border border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border border-gray-200",
  matched: "bg-brand-sky/10 text-brand-sky border border-brand-sky/20",
  active: "bg-brand-green/10 text-brand-green border border-brand-green/20",
  inactive: "bg-gray-100 text-gray-600 border border-gray-200",
  success: "bg-brand-green/10 text-brand-green border border-brand-green/20",
  warning: "bg-brand-gold/10 text-brand-gold border border-brand-gold/20",
  error: "bg-red-100 text-red-700 border border-red-200",
  info: "bg-brand-sky/10 text-brand-sky border border-brand-sky/20",
  default: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function Badge({ children, variant = "default", className = "" }) {
  const baseStyles =
    "inline-block px-2.5 py-1 rounded-full text-xs font-medium";
  const colorStyles = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`${baseStyles} ${colorStyles} ${className}`}>
      {children}
    </span>
  );
}
