import { StaticPage, Section } from "@/components/shared/StaticPage";

export default function AboutPage() {
  return (
    <StaticPage
      title="About Abugida Tutor"
      subtitle="Ethiopia's trusted marketplace for verified tutors."
    >
      <Section heading="Our mission">
        <p>
          Abugida Tutor exists to make quality private tutoring accessible to every
          Ethiopian family. We connect parents with vetted, qualified tutors in their
          neighborhood — while keeping the matching process free for parents.
        </p>
        <p>
          Named after the Abugida writing system — the foundation of literacy in
          Ethiopia — we believe education is the foundation of opportunity. Our job is
          to remove the friction of finding the right tutor.
        </p>
      </Section>

      <Section heading="How we're different">
        <p>
          Unlike informal referrals, every tutor on Abugida is verified: identity,
          education, and teaching experience are reviewed by our team before a profile
          goes live. Parents pay nothing to post a request or browse tutors.
        </p>
        <p>
          Tutors use <strong>Kulf</strong> — our credit system — to unlock a parent's
          contact and start a conversation. This keeps the marketplace fair, free of
          spam, and focused on genuine matches.
        </p>
      </Section>

      <Section heading="Our values">
        <p>
          <strong>Trust</strong> — verification first, always. <strong>Fairness</strong> —
          free for parents, low-cost for tutors. <strong>Safety</strong> — contact details
          are shared only after a verified tutor commits. <strong>Community</strong> —
          built in Addis Ababa, for all of Ethiopia.
        </p>
      </Section>
    </StaticPage>
  );
}
