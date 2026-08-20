import React, { useState } from "react";
import { useTelegram } from "../../contexts/TelegramContext";
import { toast } from "react-toastify";

export default function TelegramInitDataCard({ defaultExpanded = false }) {
  const {
    tgUser,
    initData,
    initDataUnsafe,
    startParam,
    platform,
    isTelegram,
    updateMockUser,
  } = useTelegram();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!initData) return;
    navigator.clipboard.writeText(initData);
    setCopied(true);
    toast.success("Telegram initData copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (user) => {
    if (!user) return "TG";
    const f = user.first_name?.[0] || "";
    const l = user.last_name?.[0] || "";
    return (f + l).toUpperCase() || "TG";
  };

  const authDateFormatted = initDataUnsafe?.auth_date
    ? new Date(initDataUnsafe.auth_date * 1000).toLocaleString()
    : "N/A";

  return (
    <div className="bg-gradient-to-br from-[#1B3A5C] to-[#22364A] text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-[#3B7DD8]/30 mb-6 transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#3B7DD8] text-white flex items-center justify-center font-extrabold text-sm shadow-md flex-shrink-0">
            {tgUser?.photo_url ? (
              <img
                src={tgUser.photo_url}
                alt="Avatar"
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              getInitials(tgUser)
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white truncate">
                {tgUser?.first_name} {tgUser?.last_name || ""}
              </h3>
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  isTelegram
                    ? "bg-[#4E9450]/20 text-[#72D576] border border-[#4E9450]/50"
                    : "bg-[#D4A017]/20 text-[#F5CF68] border border-[#D4A017]/50"
                }`}
              >
                {isTelegram ? "🟢 Telegram Live" : "🟡 Dev Simulation"}
              </span>
            </div>
            <p className="text-xs text-white/70 truncate flex items-center gap-2 mt-0.5">
              <span>{tgUser?.username ? `@${tgUser.username}` : "No @username"}</span>
              <span>•</span>
              <span>ID: <code className="font-mono text-white/90">{tgUser?.id || "N/A"}</code></span>
            </p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <span>{isExpanded ? "Hide initData" : "View initData"}</span>
          <i className={`ti ${isExpanded ? "ti-chevron-up" : "ti-chevron-down"} text-xs`} />
        </button>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Platform</span>
              <span className="font-bold text-white capitalize">{platform || "web"}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Language</span>
              <span className="font-bold text-white uppercase">{tgUser?.language_code || "EN"}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Telegram Premium</span>
              <span className="font-bold text-[#F5CF68]">
                {tgUser?.is_premium ? "⭐ Active" : "Standard"}
              </span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Start Parameter</span>
              <span className="font-bold text-[#E8703A] font-mono truncate block">
                {startParam || "None"}
              </span>
            </div>
          </div>

          {/* Auth Date */}
          <div className="flex items-center justify-between text-[11px] text-white/70 px-1">
            <span>Auth Timestamp: <strong className="text-white">{authDateFormatted}</strong></span>
            <span>Query ID: <code className="font-mono text-white/80">{initDataUnsafe?.query_id || "N/A"}</code></span>
          </div>

          {/* Raw initData box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white/80">Raw Telegram initData:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[#7BB3F8] hover:text-white font-bold flex items-center gap-1 transition-colors"
              >
                <i className={`ti ${copied ? "ti-check text-[#72D576]" : "ti-copy"} text-xs`} />
                <span>{copied ? "Copied!" : "Copy String"}</span>
              </button>
            </div>
            <div className="p-3 bg-black/40 text-[#9ED2FF] rounded-xl text-[10px] font-mono break-all max-h-28 overflow-y-auto select-all leading-tight border border-white/10">
              {initData || "No initData detected"}
            </div>
          </div>

          {/* Dev Account Switcher (if outside real Telegram client) */}
          {!isTelegram && (
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-white/60 font-bold uppercase">
                Test Accounts:
              </span>
              <button
                type="button"
                onClick={() =>
                  updateMockUser({
                    id: 718293041,
                    first_name: "Amara",
                    last_name: "Bekele",
                    username: "amarabekele",
                    is_premium: true,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white transition-colors"
              >
                Amara Bekele (Tutor)
              </button>
              <button
                type="button"
                onClick={() =>
                  updateMockUser({
                    id: 991827364,
                    first_name: "Abebech",
                    last_name: "Tadesse",
                    username: "abebech_parent",
                    is_premium: false,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white transition-colors"
              >
                Abebech T. (Parent)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
