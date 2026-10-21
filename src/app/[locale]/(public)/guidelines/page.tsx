import { StaticPage, Section } from "@/components/shared/StaticPage";

export default function GuidelinesPage() {
  return (
    <StaticPage
      title="Tutor Guidelines"
      subtitle="Standards every Abugida tutor agrees to."
    >
      <Section heading="Be accurate">
        <p>
          List only subjects and grade levels you are genuinely qualified to teach. Your
          education and experience must be truthful and verifiable.
        </p>
      </Section>

      <Section heading="Be responsive">
        <p>
          When you unlock a parent's contact, reach out within 24 hours. Parents are more
          likely to work with tutors who communicate clearly and promptly.
        </p>
      </Section>

      <Section heading="Be professional">
        <p>
          Arrive on time, communicate clearly about scheduling and rates, and treat every
          family with respect. Unprofessional behavior may lead to account suspension.
        </p>
      </Section>

      <Section heading="Refund policy">
        <p>
          If a parent doesn't respond within 48 hours, you can request a refund of the Kulf
          you spent. Abuse of the refund system may limit your account.
        </p>
      </Section>
    </StaticPage>
  );
}
