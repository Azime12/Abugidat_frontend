export function Stats() {
  const stats = [
    { value: "60+", label: "Verified tutors", sub: "All ID-checked" },
    { value: "200+", label: "Parent requests", sub: "In 3 months" },
    { value: "80+", label: "Confirmed matches", sub: "First lesson done" },
    { value: "4.9 ⭐", label: "Average rating", sub: "Parent satisfaction" },
  ];

  return (
    <section className="bg-[#F8FAFC] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-extrabold text-[#2D2A32]">
            Trusted by Ethiopian families
          </h2>
          <p className="mt-3 text-gray-500">
            Real numbers from our first 3 months
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-8 text-center"
            >
              <p className="text-5xl font-black text-[#0096D6]">{stat.value}</p>
              <p className="mt-2 text-sm font-bold text-gray-700">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
