import { Link } from "@/i18n/routing";

export function ForTutorsHero() {
  return (
    <section className="bg-[#FFF8F0] px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <img
          src="/logo-icon.png"
          alt="Abugida Tutor"
          className="mx-auto h-16 w-16 object-contain"
        />

        <h1 className="mt-6 text-4xl font-black leading-tight text-[#2D2A32] md:text-5xl">
          Get paid to teach.
          <br />
          <span className="text-[#0096D6]">No cards. No agents.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
          Join Ethiopia's trusted tutor platform. Get verified, get matched
          with parents, and start earning this week.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/for-tutors/register"
            className="rounded-lg bg-[#0096D6] px-8 py-4 text-base font-bold text-white transition hover:bg-[#007FB8]"
          >
            Become a tutor →
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          2 minutes to apply · 10 free Kulf on approval
        </p>
      </div>
    </section>
  );
}