"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { configService, ALL_LANGUAGES } from "@/services/api/config";

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read enabled languages from admin config (fallback: all)
  const { data: config } = useQuery({
    queryKey: ["public", "config"],
    queryFn: configService.getPublicConfig,
    staleTime: 5 * 60 * 1000,
  });

  const enabled = config?.enabled_languages ?? ["am", "en", "om"];
  const languages = ALL_LANGUAGES.filter((l) => enabled.includes(l.code));
  const visible = languages.length > 0 ? languages : ALL_LANGUAGES;

  const currentLanguage = visible.find((lang) => lang.code === locale) || visible[0];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentLanguage) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
      >
        <Globe size={16} className="text-slate-500 dark:text-slate-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{locale}</span>
        <span className="text-xs">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="py-2">
            {visible.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  locale === lang.code
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{lang.name}</span>
                <span>{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
