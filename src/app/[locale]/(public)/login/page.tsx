"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { User, Lock, Send, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { validatePhone, validatePassword, normalizeEthiopianPhone } from "@/lib/validation";
import { useTelegramBotUrl } from "@/hooks/useTelegramBotUrl";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const telegram = useTelegramBotUrl();
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validate = () => {
    const next: { phone?: string; password?: string } = {};
    const phoneErr = validatePhone(phone);
    const passwordErr = validatePassword(password);
    if (phoneErr) next.phone = phoneErr;
    if (passwordErr) next.password = passwordErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const redirect = searchParams?.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login({ phone: normalizeEthiopianPhone(phone) || phone, password });
      toast.success(t("welcomeBackToast", { name: user.firstName || user.fullName || "" }));
      const u = user as any;
      if (redirect && redirect.startsWith("/")) {
        router.push(redirect as any);
      } else if (u?.roles?.includes("admin")) {
        router.push("/admin");
      } else if (u?.tutorId) {
        router.push("/tutor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFF8F0] px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <img src="/logo-icon.png" alt="Abugida Tutor" className="h-16 w-16 object-contain" />
            <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-black text-[#2D2A32]">
              {t("loginTitle")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
                {t("phoneLabel")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${errors.phone ? "border-red-400" : "border-gray-300"}`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${errors.password ? "border-red-400" : "border-gray-300"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0096D6] py-3 text-sm font-bold text-white transition hover:bg-[#007FB8] disabled:opacity-60"
            >
              {loading ? t("loggingIn") : t("loginButton")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400">{t("orContinueWith")}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <a href={telegram.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
            <Send className="h-4 w-4" />
            Telegram
          </a>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("noAccount")}{" "}
            <Link href="/signup" className="font-bold text-[#0096D6] hover:underline">
              {t("createAccount")}
            </Link>
          </p>

          <div className="mt-4 rounded-lg bg-[#E8F4F8] p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#006A9B]">Test accounts</p>
            <p className="mt-1 text-xs text-gray-600">
              📱 +251911111111 / test123 (parent)<br />
              📱 +251922222222 / test123 (tutor)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}