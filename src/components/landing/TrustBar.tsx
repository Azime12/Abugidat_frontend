export function TrustBar() {
  return (
    <section className="border-y border-gray-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6">
        <div className="text-xs font-bold tracking-wider text-gray-500">
          TRUSTED BY PARENTS AT
        </div>
        <div className="flex flex-wrap items-center gap-12">
          <div className="flex items-center gap-2 font-bold text-gray-400">
            <span className="text-2xl">🏫</span> School A
          </div>
          <div className="flex items-center gap-2 font-bold text-gray-400">
            <span className="text-2xl">🏫</span> School B
          </div>
          <div className="flex items-center gap-2 font-bold text-gray-400">
            <span className="text-2xl">🏫</span> School C
          </div>
          <div className="flex items-center gap-2 font-bold text-gray-400">
            <span className="text-2xl">🏫</span> School D
          </div>
        </div>
      </div>
    </section>
  );
}
