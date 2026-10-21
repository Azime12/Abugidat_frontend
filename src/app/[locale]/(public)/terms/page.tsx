import { StaticPage, Section } from "@/components/shared/StaticPage";

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      subtitle="The rules for parents and tutors on Abugida Tutor."
    >
      <Section heading="For parents">
        <p>
          Posting a tutoring request and browsing tutors is free. You agree to provide
          accurate information about your student's grade level and needs. When a tutor
          unlocks your contact, you agree to respond in a timely manner.
        </p>
      </Section>

      <Section heading="For tutors">
        <p>
          You agree that your profile information is truthful and that you hold the
          qualifications you claim. Kulf credits are prepaid and used to unlock parent
          contacts; each unlock costs 1 Kulf unless stated otherwise.
        </p>
      </Section>

      <Section heading="Refunds">
        <p>
          If a parent does not respond within 48 hours of an unlock, you may request a
          refund of the Kulf spent. Refunds are reviewed and granted at our discretion and
          are credited back to your Kulf balance.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <p>
          Harassment, fraudulent profiles, and misuse of contact information are prohibited
          and may result in account suspension without refund. Abugida Tutor provides a
          matching service and is not a party to any tutoring agreement.
        </p>
      </Section>
    </StaticPage>
  );
}
