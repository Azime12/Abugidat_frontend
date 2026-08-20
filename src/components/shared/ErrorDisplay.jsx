import { MdWarning } from "react-icons/md";

export default function ErrorDisplay({ message, className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm ${className}`}
    >
      <MdWarning size={20} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
