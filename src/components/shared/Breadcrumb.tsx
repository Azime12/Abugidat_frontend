import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({
  locale,
  crumbs,
}: {
  locale: string;
  crumbs: Crumb[];
}) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-xs">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1 text-gray-500 transition hover:text-[#0096D6]"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>

        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 text-gray-300" />
              {isLast || !c.href ? (
                <span className="font-semibold text-[#0096D6]">{c.label}</span>
              ) : (
                <Link
                  href={`/${locale}${c.href}`}
                  className="text-gray-500 transition hover:text-[#0096D6]"
                >
                  {c.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}