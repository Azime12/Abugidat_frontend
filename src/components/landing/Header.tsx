"use client";

import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition ${
      isActive(href)
        ? "text-[#0096D6] font-semibold"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo-icon.png"
            alt="Abugida Tutor"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight">
            Abugida <span className="text-[#0096D6]">Tutor</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/tutors" className={navLinkClass("/tutors")}>
            {t("tutors")}
          </Link>
          <Link href="/how-it-works" className={navLinkClass("/how-it-works")}>
            {t("howItWorks")}
          </Link>
          <Link href="/for-tutors" className={navLinkClass("/for-tutors")}>
            {t("forTutors")}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#0096D6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007FB8]"
              >
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/tutors"
              className={navLinkClass("/tutors")}
              onClick={() => setOpen(false)}
            >
              {t("tutors")}
            </Link>
            <Link
              href="/how-it-works"
              className={navLinkClass("/how-it-works")}
              onClick={() => setOpen(false)}
            >
              {t("howItWorks")}
            </Link>
            <Link
              href="/for-tutors"
              className={navLinkClass("/for-tutors")}
              onClick={() => setOpen(false)}
            >
              {t("forTutors")}
            </Link>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-[#0096D6]"
                onClick={() => setOpen(false)}
              >
                My dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#0096D6] px-4 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  {t("getStarted")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}