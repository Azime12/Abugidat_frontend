import { MdInbox } from "react-icons/md";

export default function EmptyState({
  icon: Icon = MdInbox,
  title = "No data available",
  description = "",
  action,
}) {
  return (
    <tr>
      <td colSpan={7} className="p-12 text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-gray-100 rounded-full scale-150" />
          <Icon size={40} className="relative text-gray-300" />
        </div>
        <p className="text-text-sub text-sm font-medium">{title}</p>
        {description && (
          <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </td>
    </tr>
  );
}
