import { StaticPage, Section } from "@/components/shared/StaticPage";

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information."
    >
      <Section heading="What we collect">
        <p>
          To match you with tutors, we collect: your name, phone number, the subjects and
          grade level you need help with, and your general area (city or neighborhood).
          Tutors provide their name, phone number, education, experience, and subjects.
        </p>
        <p>
          We may collect approximate location to show nearby tutors, but we never store or
          expose exact coordinates publicly — only your area name is shown.
        </p>
      </Section>

      <Section heading="How your contact is protected">
        <p>
          Your phone number is hidden by default. A verified tutor must spend Kulf to
          reveal your contact, and only after you've received their interest. We never
          sell or share your personal information with third parties.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          You can request access to, correction of, or deletion of your data at any time by
          contacting us. We retain account data only as long as needed to provide the
          service or comply with legal obligations.
        </p>
      </Section>
    </StaticPage>
  );
}
