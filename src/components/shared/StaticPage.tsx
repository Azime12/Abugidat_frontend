import { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export function StaticPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#0096D6]"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black text-[#2D2A32]">{title}</h1>
        {subtitle && <p className="mt-3 text-sm sm:text-base text-gray-500">{subtitle}</p>}

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold text-[#2D2A32]">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
