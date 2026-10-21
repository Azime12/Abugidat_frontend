import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-client-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "react-hot-toast";

export const viewport = { width: "device-width", initialScale: 1 };

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: {
      default: t("defaultTitle"),
      template: `%s | ${t("defaultTitle")}`,
    },
    description: t("description"),
    icons: { icon: "/logo-icon.png" },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${notoEthiopic.variable}`}>
      <body className="antialiased bg-[#FFF8F0] text-[#2D2A32]">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" reverseOrder={false} />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}