export function RegisterProgress({ step, total = 2 }: { step: number; total?: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const active = n <= step;
          const isCurrent = n === step;
          return (
            <div key={n} className="flex flex-1 items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  active
                    ? "bg-[#0096D6] text-white"
                    : "bg-gray-100 text-gray-400"
                } ${isCurrent ? "ring-4 ring-[#0096D6]/20" : ""}`}
              >
                {n}
              </div>
              {n < total && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition ${
                    n < step ? "bg-[#0096D6]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-gray-500">
        Step {step} of {total}
      </p>
    </div>
  );
}