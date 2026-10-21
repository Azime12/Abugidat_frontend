import { BadgeCheck, Wallet, Shield } from "lucide-react";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Verified badge",
    desc: "We check your ID and references. Parents trust the ✓ mark.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Wallet,
    title: "You keep 100%",
    desc: "No commission on lessons. Only pay 1 Kulf per parent contact.",
    color: "bg-[#FEF3C7] text-[#B45309]",
  },
  {
    icon: Shield,
    title: "Refund if no reply",
    desc: "Parent doesn't respond in 48 hours? We refund your Kulf.",
    color: "bg-[#E8F4F8] text-[#0096D6]",
  },
];

export function ForTutorsBenefits() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${b.color}`}>
                <b.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#2D2A32]">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}