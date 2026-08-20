import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

/**
 * Shared layout wrapper for auth pages (Login & SignUp).
 * Provides the background decoration and language selector.
 *
 * Props:
 * - children: page content to render inside the layout
 * - className: additional classes for the outer container
 */
export default function AuthLayout({ children, className = "" }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem("i18nextLng") || "en"
  );

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem("i18nextLng", selectedLanguage);
  };

  return (
    <div
      className={`min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden ${className}`}
    >
      {/* Background decorative shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#0F3C6E]/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#5AC6F0]/5" />
      </div>

      {/* Language selector */}
      <LanguageSelector
        language={language}
        onChange={handleLanguageChange}
      />

      {children}
    </div>
  );
}
