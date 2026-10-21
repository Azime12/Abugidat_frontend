import { Link } from "@/i18n/routing";

export function HowItWorks() {
  const steps = [
    {
      emoji: "🎓",
      step: "STEP 1",
      title: "Choose grade",
      desc: "Select your child's grade from KG to University. We only show tutors who teach that level.",
    },
    {
      emoji: "📍",
      step: "STEP 2",
      title: "Share area",
      desc: "Use GPS or pick your sub-city. Your exact location is never shared with tutors.",
    },
    {
      emoji: "💬",
      step: "STEP 3",
      title: "Request tutor",
      desc: "Pick a tutor and send a request. You'll hear back within 24 hours. 100% free.",
    },
  ];

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="text-xs font-bold text-[#0096D6]">HOW IT WORKS</span>
          <h2 className="mt-2 text-4xl font-extrabold text-[#2D2A32]">
            Find your tutor in 3 steps
          </h2>
          <p className="mt-3 text-gray-500">
            Free for parents. No card needed.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E8F4F8] text-4xl shadow-sm">
                {s.emoji}
              </div>
              <p className="text-xs font-bold text-[#0096D6]">{s.step}</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#2D2A32]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/tutors"
            className="inline-block rounded-lg bg-[#0096D6] px-8 py-4 text-base font-bold text-white transition hover:bg-[#007FB8]"
          >
            🚀 Find tutors near me
          </Link>
        </div>
      </div>
    </section>
  );
}
