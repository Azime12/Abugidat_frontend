import { Link } from "@/i18n/routing";

const STEPS = [
  {
    n: "1",
    title: "Apply",
    desc: "Fill a 2-minute form with your teaching details.",
  },
  {
    n: "2",
    title: "Get verified",
    desc: "We check your ID and references. Takes 1-2 days.",
  },
  {
    n: "3",
    title: "Start teaching",
    desc: "Get 10 free Kulf. Browse parents. Start earning.",
  },
];

export function ForTutorsSteps() {
  return (
    <section className="bg-[#F8FAFC] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-extrabold text-[#2D2A32]">
          How it works
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0096D6] text-lg font-black text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-base font-bold text-[#2D2A32]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/for-tutors/register"
            className="inline-block rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#007FB8]"
          >
            Start your application →
          </Link>
        </div>
      </div>
    </section>
  );
}