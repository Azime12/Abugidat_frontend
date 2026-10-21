import { StaticPage, Section } from "@/components/shared/StaticPage";

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact Us"
      subtitle="We're here to help parents and tutors."
    >
      <Section heading="Reach us on Telegram">
        <p>
          The fastest way to reach us is on Telegram:{" "}
          <a
            href="https://t.me/Abugidatutor_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#0096D6] hover:underline"
          >
            @Abugidatutor_bot
          </a>
        </p>
      </Section>

      <Section heading="Support hours">
        <p>
          Our team reviews messages daily and typically responds within one business day.
          For urgent safety concerns, message us on Telegram and include
          &quot;URGENT&quot; in your message.
        </p>
      </Section>

      <Section heading="For tutors">
        <p>
          Questions about Kulf, payouts, or your profile? Message the bot or reach out via
          the tutor dashboard. We review purchase confirmations and refund requests within
          24 hours.
        </p>
      </Section>
    </StaticPage>
  );
}
