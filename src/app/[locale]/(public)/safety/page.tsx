import { StaticPage, Section } from "@/components/shared/StaticPage";

export default function SafetyPage() {
  return (
    <StaticPage
      title="Safety"
      subtitle="How we keep the Abugida community safe."
    >
      <Section heading="Tutor verification">
        <p>
          Every tutor goes through a review process: we verify identity, education, and
          teaching experience before a profile is published. Tutors who cannot be verified
          are not listed publicly.
        </p>
      </Section>

      <Section heading="Protected contact details">
        <p>
          Your phone number is never shown publicly. It is revealed only to a tutor who has
          committed Kulf to contact you — and only after your request is live.
        </p>
      </Section>

      <Section heading="Tips for parents">
        <p>
          Meet tutors in a public place for the first session. Share only the information
          necessary for tutoring. If a tutor asks for payment outside our process or makes
          you uncomfortable, report it to us immediately.
        </p>
      </Section>

      <Section heading="Report a problem">
        <p>
          If you experience harassment, fraud, or suspicious behavior, contact us right
          away. We investigate every report and will remove accounts that violate our
          terms.
        </p>
      </Section>
    </StaticPage>
  );
}
