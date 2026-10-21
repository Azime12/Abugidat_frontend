"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  GraduationCap,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Send,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import {
  validatePhone,
  validatePassword,
  validateFullName,
  validateEmail,
  validateTerms,
  normalizeEthiopianPhone,
} from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useTelegramBotUrl } from "@/hooks/useTelegramBotUrl";

type Role = "parent" | "tutor";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: Role;
  agree: boolean;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  agree?: string;
}

export default function SignupPage() {
  const t = useTranslations("Auth");
  const telegram = useTelegramBotUrl();
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "parent",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const passwordChecks = {
    length: form.password.length >= 6,
    hasNumber: /\d/.test(form.password),
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const nameErr = validateFullName(form.fullName);
    const phoneErr = validatePhone(form.phone);
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password, { requireNumber: true });
    const termsErr = validateTerms(form.agree);

    if (nameErr) next.fullName = nameErr;
    if (phoneErr) next.phone = phoneErr;
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;
    if (termsErr) next.agree = termsErr;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await signup({
        fullName: form.fullName.trim(),
        phone: normalizeEthiopianPhone(form.phone) || form.phone.replace(/\s/g, ""),
        email: form.email.trim() || undefined,
        password: form.password,
        role: form.role,
      });

      toast.success(t("accountCreated"));

      const u = user as any;
      if (u?.roles?.includes("admin")) router.push("/admin");
      else if (u?.tutorId) router.push("/tutor/dashboard");
      else router.push("/dashboard");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, t("signupFailed")));
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
              {t("signupTitle")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("signupSubtitle")}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => update("role", "parent")}
              className={`rounded-md py-2 text-sm font-bold transition ${
                form.role === "parent"
                  ? "bg-white text-[#0096D6] shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
               {t("parent")}
            </button>
            <button
              type="button"
              onClick={() => update("role", "tutor")}
              className={`rounded-md py-2 text-sm font-bold transition ${
                form.role === "tutor"
                  ? "bg-white text-[#0096D6] shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
               {t("tutor")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
                {t("fullName")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                    errors.fullName ? "border-red-400" : "border-gray-300"
                  }`}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
                {t("phoneLabel")}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+251 9XX XXX XXX"
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                    errors.phone ? "border-red-400" : "border-gray-300"
                  }`}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
                {t("emailLabel")} <span className="font-normal text-gray-400">{t("emailOptional")}</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                    errors.email ? "border-red-400" : "border-gray-300"
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D2A32]">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={t("passwordPlaceholderCreate")}
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <Rule ok={passwordChecks.length} label={t("atLeast6")} />
                <Rule ok={passwordChecks.hasNumber} label={t("atLeastOneNumber")} />
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => update("agree", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0096D6] focus:ring-[#0096D6]"
              />
              <span className="text-xs text-gray-600">
                {t("agreeTo")}{" "}
                <Link href="/terms" className="font-semibold text-[#0096D6] hover:underline">
                  {t("terms")}
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-[#0096D6] hover:underline">
                  {t("privacy")}
                </Link>
                .
              </span>
            </label>
            {errors.agree && (
              <p className="text-xs text-red-500">{errors.agree}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0096D6] py-3 text-sm font-bold text-white transition hover:bg-[#007FB8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("creatingAccount")
                : form.role === "tutor"
                ? t("createTutorAccount")
                : t("createParentAccount")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400">
              {t("orContinueWith")}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <a
            href={telegram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <Send className="h-4 w-4" />
            Telegram
          </a>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-bold text-[#0096D6] hover:underline"
            >
              {t("logIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
          ok ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        <Check className="h-2.5 w-2.5" />
      </span>
      <span className={ok ? "text-green-600" : "text-gray-400"}>{label}</span>
    </div>
  );
}