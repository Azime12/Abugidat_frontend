import { Link } from "@/i18n/routing";

export function CTA() {
  return (
    <section className="bg-gradient-to-br from-[#0096D6] to-[#006A9B] px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-black leading-tight text-white md:text-5xl">
          Ready to find your
          <br />
          child's <span className="text-[#F59E0B]">perfect Abugida Tutor</span>?
        </h2>
        <p className="mt-5 text-lg text-white/80">
          Free matching. Verified tutors. Real reviews. Start now.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/tutors"
            className="rounded-lg bg-white px-8 py-4 text-base font-bold text-[#0096D6] transition hover:bg-gray-100"
          >
            Find a tutor →
          </Link>
          <Link
            href="/for-tutors"
            className="rounded-lg border-2 border-white/40 bg-transparent px-8 py-4 text-base font-bold text-white transition hover:bg-white/10"
          >
            Become a tutor
          </Link>
        </div>

        <p className="mt-6 text-xs text-white/50">
          No credit card · No commitment · Reply in 24h
        </p>
      </div>
    </section>
  );
}
