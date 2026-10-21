import { Link } from "@/i18n/routing";

const PARENT_STEPS = [
  { n: "1", title: "Choose grade", desc: "KG to University" },
  { n: "2", title: "Share area", desc: "GPS or pick from a list" },
  { n: "3", title: "Request a tutor", desc: "Free for parents" },
];

const TUTOR_STEPS = [
  { n: "1", title: "Apply", desc: "2-minute form" },
  { n: "2", title: "Get verified", desc: "ID + references check" },
  { n: "3", title: "Start earning", desc: "10 free Kulf on approval" },
];

export function ParentFlow({ locale }: { locale: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
        {PARENT_STEPS.map((s) => (
          <div key={s.n}>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0096D6] text-sm font-black text-white">
              {s.n}
            </div>
            <h3 className="mt-3 text-base font-bold text-[#2D2A32]">{s.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        💚 Always free for parents
      </p>

      <Link
        href="/tutors"
        className="mt-6 inline-block rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#007FB8]"
      >
        Find a tutor →
      </Link>
    </div>
  );
}

export function TutorFlow({ locale }: { locale: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
        {TUTOR_STEPS.map((s) => (
          <div key={s.n}>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0096D6] text-sm font-black text-white">
              {s.n}
            </div>
            <h3 className="mt-3 text-base font-bold text-[#2D2A32]">{s.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        🔑 You only pay for real parent leads
      </p>

      <Link
        href="/for-tutors/register"
        className="mt-6 inline-block rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#007FB8]"
      >
        Become a tutor →
      </Link>
    </div>
  );
}