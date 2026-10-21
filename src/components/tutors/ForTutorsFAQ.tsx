"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How much does it cost to join?",
    a: "Free. No signup fee, no subscription. You pay only for parent contacts using Kulf — and we give you 10 free Kulf when you're approved.",
  },
  {
    q: "What is Kulf?",
    a: "Kulf (🔑) unlocks 1 parent contact. When you see a request that matches your subjects and grades, spend 1 Kulf to see their phone and preferred time.",
  },
  {
    q: "What if the parent doesn't reply?",
    a: "If a parent doesn't respond within 48 hours, we refund your Kulf. Click 'Report a problem' on the request.",
  },
  {
    q: "Do you take a commission?",
    a: "No. Parents pay you directly. You keep 100% of your lesson fees.",
  },
];

export function ForTutorsFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-[#2D2A32]">
          Common questions
        </h2>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                type="button"
              >
                <span className="text-sm font-bold text-[#2D2A32]">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-400 transition ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}