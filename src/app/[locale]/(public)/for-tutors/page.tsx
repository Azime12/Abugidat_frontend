"use client";

import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ForTutorsHero } from "@/components/tutors/ForTutorsHero";
import { ForTutorsBenefits } from "@/components/tutors/ForTutorsBenefits";
import { ForTutorsSteps } from "@/components/tutors/ForTutorsSteps";
import { ForTutorsFAQ } from "@/components/tutors/ForTutorsFAQ";
import { Link } from "@/i18n/routing";

export default function ForTutorsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        locale={locale}
        crumbs={[{ label: "For Tutors" }]}
      />

      <ForTutorsHero />
      <ForTutorsBenefits />
      <ForTutorsSteps />
      <ForTutorsFAQ />

      {/* Final CTA */}
      <section className="bg-[#2D2A32] px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black text-white">
            Ready to start teaching?
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Apply in 2 minutes. Verified in 1-2 days.
          </p>
          <Link
            href="/for-tutors/register"
            className="mt-6 inline-block rounded-lg bg-[#0096D6] px-8 py-4 text-base font-bold text-white transition hover:bg-[#007FB8]"
          >
            Become a tutor →
          </Link>
        </div>
      </section>
    </>
  );
}