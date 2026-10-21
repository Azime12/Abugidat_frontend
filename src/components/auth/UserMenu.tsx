"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initials = (user.fullName || user.firstName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 transition hover:bg-gray-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0096D6] text-xs font-bold text-white">
          {initials}
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-semibold text-[#2D2A32] sm:inline">
          {user.firstName || user.fullName?.split(" ")[0] || "User"}
        </span>
        <ChevronDown className={`h-3 w-3 text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-[#2D2A32]">
              {user.fullName || user.firstName}
            </p>
            <p className="truncate text-xs text-gray-500">{user.phone}</p>
            <span className="mt-2 inline-block rounded-full bg-[#E8F4F8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#006A9B]">
              {user.role}
            </span>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              My profile
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}