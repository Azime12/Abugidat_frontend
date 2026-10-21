"use client";

import { useQuery } from "@tanstack/react-query";
import { StaticPage, Section } from "@/components/shared/StaticPage";
import { configService } from "@/services/api/config";

const FALLBACK_PACKS = [
  { size: 10, birr: 150 },
  { size: 25, birr: 350 },
  { size: 50, birr: 600 },
];

export default function PricingPage() {
  const { data: config } = useQuery({
    queryKey: ["public", "config"],
    queryFn: configService.getPublicConfig,
    staleTime: 60_000,
  });

  const prices = config?.kulf_pack_prices ?? {};
  const packs = Object.keys(prices).length
    ? Object.entries(prices)
        .map(([size, birr]) => ({ size: Number(size), birr: Number(birr) }))
        .sort((a, b) => a.size - b.size)
    : FALLBACK_PACKS;

  return (
    <StaticPage
      title="Pricing"
      subtitle="Free for parents. Simple credits for tutors."
    >
      <Section heading="For parents — free">
        <p>
          Posting requests, browsing tutors, and receiving tutor interest is completely
          free. There are no subscription fees and no hidden charges for parents.
        </p>
      </Section>

      <Section heading="Kulf packs for tutors">
        <p>
          Tutors use <strong>Kulf</strong> credits to unlock a parent&apos;s contact. Each
          unlock costs 1 Kulf. Choose the pack that fits how many students you want to
          reach:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {packs.map((p) => (
            <div
              key={p.size}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-center"
            >
              <p className="text-2xl font-black text-[#0096D6]">{p.size} Kulf</p>
              <p className="mt-1 text-sm font-bold text-gray-700">{p.birr} ETB</p>
              <p className="mt-1 text-xs text-gray-500">
                ≈ {Math.round(p.birr / p.size)} ETB per unlock
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="How to buy">
        <p>
          Pay via Telebirr, CBE Birr, or bank transfer, then submit your transaction
          reference in the tutor dashboard. Our team confirms payments within 24 hours and
          credits your Kulf balance.
        </p>
      </Section>
    </StaticPage>
  );
}
