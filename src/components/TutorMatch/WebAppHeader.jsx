import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * WebAppHeader — full-width web app top bar shown when NOT inside Telegram.
 * Replaces the blue Telegram TgBar with a proper website header.
 */
export default function WebAppHeader({
  activeScreen,
  role,
  onNavigate,
  onBack,
  canGoBack,
  title,
  unreadCount = 0,
}) {
  const navigate = useNavigate();

  const isStudent = role === "student";
  const isTutor = role === "tutor";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E1D3] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo + Back */}
        <div className="flex items-center gap-3">
          {canGoBack ? (
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-[#FBF8F2] border border-[#E8E1D3] text-[#22364A] transition-colors"
              title="Go back"
            >
              <i className="ti ti-arrow-left text-base" />
            </button>
          ) : null}

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-[#3B7DD8] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              <i className="ti ti-school" />
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-sm text-[#22364A] leading-tight">
                Abugida
              </div>
              <div className="text-[10px] text-[#6B7684] leading-none">
                Tutor Platform
              </div>
            </div>
          </div>

          {/* Screen title on mobile */}
          <span className="sm:hidden font-semibold text-sm text-[#22364A] truncate max-w-[140px]">
            {title}
          </span>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FBF8F2] p-1 rounded-2xl border border-[#E8E1D3]">
          <button
            onClick={() => onNavigate("s-browse")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isStudent && activeScreen !== "s-role" && !activeScreen.startsWith("s-onb")
                ? "bg-white text-[#3B7DD8] shadow-sm"
                : "text-[#6B7684] hover:text-[#22364A]"
            }`}
          >
            <i className="ti ti-search text-sm" />
            Find a Tutor
          </button>

          <button
            onClick={() => onNavigate("s-onb-1")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeScreen.startsWith("s-onb")
                ? "bg-white text-[#E8703A] shadow-sm"
                : "text-[#6B7684] hover:text-[#22364A]"
            }`}
          >
            <i className="ti ti-user-plus text-sm" />
            Register as Tutor
          </button>

          <button
            onClick={() => onNavigate("s-dash")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isTutor && activeScreen === "s-dash"
                ? "bg-white text-[#4E9450] shadow-sm"
                : "text-[#6B7684] hover:text-[#22364A]"
            }`}
          >
            <i className="ti ti-layout-dashboard text-sm" />
            Tutor Dashboard
          </button>
        </nav>

        {/* Right: Notifications + Home */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("s-notif")}
            className="relative p-2 rounded-xl hover:bg-[#FBF8F2] border border-[#E8E1D3] text-[#22364A] transition-colors"
            title="Notifications"
          >
            <i className="ti ti-bell text-base" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E8703A] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => navigate("/")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FBF8F2] border border-[#E8E1D3] text-[#22364A] hover:bg-white rounded-xl text-xs font-bold transition-colors"
            title="Back to main site"
          >
            <i className="ti ti-home text-sm" />
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav tabs */}
      <div className="md:hidden flex border-t border-[#E8E1D3] bg-white">
        <button
          onClick={() => onNavigate("s-browse")}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            isStudent && activeScreen !== "s-role" && !activeScreen.startsWith("s-onb")
              ? "text-[#3B7DD8]"
              : "text-[#6B7684]"
          }`}
        >
          <i className="ti ti-search text-base" />
          Find Tutor
        </button>
        <button
          onClick={() => onNavigate("s-onb-1")}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeScreen.startsWith("s-onb") ? "text-[#E8703A]" : "text-[#6B7684]"
          }`}
        >
          <i className="ti ti-user-plus text-base" />
          Register
        </button>
        <button
          onClick={() => onNavigate("s-dash")}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeScreen === "s-dash" ? "text-[#4E9450]" : "text-[#6B7684]"
          }`}
        >
          <i className="ti ti-layout-dashboard text-base" />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate("s-notif")}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors relative ${
            activeScreen === "s-notif" ? "text-[#3B7DD8]" : "text-[#6B7684]"
          }`}
        >
          <i className="ti ti-bell text-base" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-[calc(50%-10px)] w-2 h-2 rounded-full bg-[#E8703A]" />
          )}
          Alerts
        </button>
      </div>
    </header>
  );
}
