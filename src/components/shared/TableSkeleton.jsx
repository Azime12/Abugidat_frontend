export default function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-50 p-4 border-b border-gray-100">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4">
            <div className="flex gap-8">
              {Array.from({ length: cols }).map((_, c) => (
                <div
                  key={c}
                  className="h-3 bg-gray-100 rounded flex-1"
                  style={{ opacity: 1 - c * 0.1 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
