"use client";

import { useState, useEffect } from "react";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import { useAuth } from "@/contexts/auth-context";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  LayoutDashboard, FileText, Plus, LogOut, Menu, X,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/requests/new", label: "Post a Request", icon: Plus },
  { href: "/dashboard", label: "My Requests", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const u = user as any;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#0096D6]/20 border-t-[#0096D6]" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  const currentLabel =
    NAV.find((n) => n.href !== "/dashboard" && isActive(n.href))?.label ||
    "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF8F0]">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Abugida" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
            <span className="text-xs sm:text-sm font-black text-[#2D2A32]">My Account</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-gray-500 p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto p-3 sm:p-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 sm:gap-3 rounded-lg px-3 py-2 sm:py-2.5 text-[13px] sm:text-sm font-semibold transition ${
                  active
                    ? "bg-[#E8F4F8] text-[#0096D6]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-200 p-3 sm:p-4">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#0096D6] text-[10px] sm:text-xs font-bold text-white">
              {u?.firstName?.[0] || u?.first_name?.[0] || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-bold text-[#2D2A32]">
                {u?.firstName || u?.first_name || "Parent"}
              </p>
              <p className="truncate text-[10px] sm:text-xs text-gray-500">{u?.phone || u?.phone_number}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 sm:px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-600 p-1 shrink-0">
            <Menu size={20} />
          </button>
          <h1 className="text-sm sm:text-lg font-bold text-[#2D2A32] truncate flex-1 text-center lg:text-left">
            {currentLabel}
          </h1>
          <Link
            href="/"
            className="shrink-0 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#0096D6]"
          >
            <span className="hidden sm:inline">View site →</span>
            <span className="sm:hidden">→</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <LogoutConfirmModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
          router.push("/");
        }}
      />
    </div>
  );
}
