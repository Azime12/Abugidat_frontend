"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is it really free for parents?",
    a: "Yes. You never pay to find, contact, or book a tutor. Tutors pay a small fee (Kulf) to unlock your contact.",
  },
  {
    q: "How do you verify tutors?",
    a: "ID check (video call), qualifications, 2 reference calls, and a short interview. Only tutors who pass get the ✓ badge.",
  },
  {
    q: "Is my location private?",
    a: "Yes. Tutors only see a rounded distance band (like '1-3 km'). Your exact address and phone are never public.",
  },
  {
    q: "What if the tutor doesn't reply?",
    a: "Parents can request a new tutor for free. Tutors get their Kulf refunded automatically after 48 hours of no reply.",
  },
  {
    q: "Do you take a commission on lessons?",
    a: "No. Parents pay tutors directly. We only charge Kulf for contact unlocks.",
  },
];

export function HowItWorksFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-center text-2xl font-black text-[#2D2A32]">
        Common questions
      </h2>

      <div className="mt-8 space-y-2">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-bold text-[#2D2A32]">{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gray-400 transition ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {open === i && (
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}