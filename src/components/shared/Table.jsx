import { motion } from "framer-motion";

/**
 * Shared Table component for consistent data displays across admin pages.
 *
 * Usage:
 * ```jsx
 * <Table
 *   columns={[
 *     { key: "name", header: "Name", render: (row) => row.name },
 *     { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
 *     { key: "actions", header: "Actions", render: (row) => <button>Edit</button> },
 *   ]}
 *   data={items}
 *   emptyState={<p>No items found</p>}
 *   isLoading={isLoading}
 *   skeletonRows={5}
 *   header={<div>Section Title</div>}
 * />
 * ```
 */
export default function Table({
  columns = [],
  data = [],
  emptyState = null,
  isLoading = false,
  skeletonRows = 5,
  className = "",
  header = null,
}) {
  const wrapperClass = `bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`;

  if (isLoading) {
    return (
      <div className={wrapperClass}>
        {header && (
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            {header}
          </div>
        )}
        <div className="animate-pulse">
          <div className="bg-gray-50 border-b border-gray-100">
            <div className="flex px-4 py-4 gap-4">
              {columns.map((col, i) => (
                <div
                  key={col.key || i}
                  className="h-4 bg-gray-200 rounded flex-1"
                  style={{ maxWidth: col.width || "auto" }}
                />
              ))}
            </div>
          </div>
          {Array.from({ length: skeletonRows }).map((_, r) => (
            <div key={r} className="flex px-4 py-4 gap-4 border-t border-gray-50">
              {columns.map((col, c) => (
                <div
                  key={col.key || c}
                  className="h-3 bg-gray-100 rounded flex-1"
                  style={{
                    opacity: 1 - c * 0.08,
                    maxWidth: col.width || "auto",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={wrapperClass}>
        {header && (
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            {header}
          </div>
        )}
        {emptyState || (
          <div className="p-12 text-center text-text-sub">
            <p className="text-sm">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {header && (
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left p-4 text-sm font-semibold text-text-main ${
                    col.headerClassName || ""
                  }`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: rowIndex * 0.03 }}
                className="group border-t border-gray-50 hover:bg-gray-50/80 transition-colors relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary/0 before:rounded-r before:transition-all before:duration-300 hover:before:bg-primary/20"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-4 text-sm ${col.cellClassName || ""}`}
                    style={col.cellStyle}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom fade hint */}
      {data.length > 8 && (
        <div className="h-6 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
