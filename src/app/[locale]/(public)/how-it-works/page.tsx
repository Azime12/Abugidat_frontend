"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { HowItWorksHero } from "@/components/how-it-works/HowItWorksHero";
import { RoleToggle, type Role } from "@/components/how-it-works/RoleToggle";
import { ParentFlow, TutorFlow } from "@/components/how-it-works/ParentFlow";
import { KulfExplainer } from "@/components/how-it-works/KulfExplainer";
import { HowItWorksFAQ } from "@/components/how-it-works/HowItWorksFAQ";

export default function HowItWorksPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [role, setRole] = useState<Role>("parent");

  return (
    <>
      <Breadcrumb locale={locale} crumbs={[{ label: "How It Works" }]} />

      <HowItWorksHero />

      {/* Toggle + Steps */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <RoleToggle role={role} onChange={setRole} />
          <div className="mt-10">
            {role === "parent" ? (
              <ParentFlow locale={locale} />
            ) : (
              <TutorFlow locale={locale} />
            )}
          </div>
        </div>
      </section>

      {/* Kulf */}
      <section className="bg-[#F8FAFC] px-6 py-12">
        <KulfExplainer />
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-12">
        <HowItWorksFAQ />
      </section>
    </>
  );
}