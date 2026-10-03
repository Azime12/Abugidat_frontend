import React from "react";

/**
 * TelegramLoginButton — Styled like "Sign in with Google" for Telegram.
 * Provides a dependable, high-fidelity Telegram sign-in button that works across all environments.
 */
export default function TelegramLoginButton({
  onClick,
  isLoading = false,
  className = "",
  label = "Sign in with Telegram",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-3 px-5 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-white text-[#229ED9] flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
          <i className="ti ti-brand-telegram" />
        </div>
      )}
      <span>{isLoading ? "Signing in..." : label}</span>
    </button>
  );
}
