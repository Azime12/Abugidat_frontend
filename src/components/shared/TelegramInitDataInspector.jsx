import React, { useState } from "react";
import { useTelegram } from "../../contexts/TelegramContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function TelegramInitDataInspector({ variant = "badge" }) {
  const {
    tgUser,
    initData,
    initDataUnsafe,
    startParam,
    platform,
    isTelegram,
    updateMockUser,
  } = useTelegram();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRaw = () => {
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

  return (
    <div className="relative inline-block text-xs">
      {/* ── 1. COMPACT TRIGGER BADGE / BUTTON ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8E1D3] hover:border-[#3B7DD8] shadow-xs text-[#22364A] transition-all"
        title="View Telegram initData & User Context"
      >
        <div className="w-5 h-5 rounded-full bg-[#3B7DD8] text-white flex items-center justify-center font-bold text-[10px]">
          {tgUser?.photo_url ? (
            <img
              src={tgUser.photo_url}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(tgUser)
          )}
        </div>

        <div className="text-left hidden sm:block">
          <div className="font-bold text-[11px] leading-tight truncate max-w-[110px]">
            {tgUser?.first_name} {tgUser?.last_name || ""}
          </div>
          <div className="text-[9px] text-[#6B7684] truncate">
            {tgUser?.username ? `@${tgUser.username}` : `ID: ${tgUser?.id || "N/A"}`}
          </div>
        </div>

        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isTelegram ? "bg-[#4E9450] animate-pulse" : "bg-[#D4A017]"
          }`}
          title={isTelegram ? "Inside Telegram WebApp" : "Development Mock Mode"}
        />
      </button>

      {/* ── 2. EXPANDABLE TELEGRAM INITDATA INSPECTION DRAWER / MODAL ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute right-0 top-12 w-80 sm:w-96 bg-white text-[#22364A] rounded-3xl shadow-2xl border border-[#E8E1D3] p-5 z-50 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#3B7DD8] text-white flex items-center justify-center text-base">
                    <i className="ti ti-brand-telegram" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#22364A]">
                      Telegram Context
                    </h4>
                    <span className="text-[10px] text-[#6B7684] flex items-center gap-1">
                      Status:{" "}
                      <strong className={isTelegram ? "text-[#4E9450]" : "text-[#D4A017]"}>
                        {isTelegram ? "Live in Telegram" : "Web Dev Simulation"}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-[#6B7684] hover:text-[#22364A] p-1"
                >
                  <i className="ti ti-x text-base" />
                </button>
              </div>

              {/* User Identity Card */}
              <div className="bg-[#FBF8F2] p-3.5 rounded-2xl border border-[#E8E1D3] space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#E8703A] text-white font-extrabold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                    {getInitials(tgUser)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm text-[#22364A] truncate">
                      {tgUser?.first_name} {tgUser?.last_name || ""}
                    </div>
                    <div className="text-xs text-[#3B7DD8] font-semibold truncate">
                      {tgUser?.username ? `@${tgUser.username}` : "No username"}
                    </div>
                    <div className="text-[10px] text-[#6B7684]">
                      Telegram ID: <code className="font-mono">{tgUser?.id}</code>
                    </div>
                  </div>

                  {tgUser?.is_premium && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FBF1DA] text-[#D4A017] text-[10px] font-bold flex items-center gap-0.5 shadow-2xs">
                      <i className="ti ti-star-filled text-[10px]" />
                      Premium
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E1D3] text-[11px]">
                  <div>
                    <span className="text-[#6B7684]">Language: </span>
                    <span className="font-bold text-[#22364A]">
                      {tgUser?.language_code?.toUpperCase() || "EN"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7684]">Platform: </span>
                    <span className="font-bold text-[#22364A] capitalize">
                      {platform || "Web"}
                    </span>
                  </div>
                  {startParam && (
                    <div className="col-span-2">
                      <span className="text-[#6B7684]">Deep Link param: </span>
                      <span className="font-mono text-[#E8703A] font-bold bg-[#FCEAE1] px-1.5 py-0.2 rounded">
                        {startParam}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw initData URL string viewer */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#22364A]">Raw Telegram initData:</span>
                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="text-[#3B7DD8] font-bold hover:underline flex items-center gap-1"
                  >
                    <i className={`ti ${copied ? "ti-check text-[#4E9450]" : "ti-copy"}`} />
                    <span>{copied ? "Copied" : "Copy String"}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-[#22364A] text-white rounded-xl text-[10px] font-mono break-all max-h-24 overflow-y-auto select-all leading-tight shadow-inner">
                  {initData || "No initData detected"}
                </div>
              </div>

              {/* Quick Dev Switcher (Only in Web Dev Mode) */}
              {!isTelegram && (
                <div className="pt-2 border-t border-[#E8E1D3] space-y-2">
                  <span className="text-[10px] font-bold text-[#6B7684] uppercase tracking-wider block">
                    Switch Test Account:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
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
                      className="p-1.5 rounded-lg border border-[#E8E1D3] bg-[#FBF8F2] hover:bg-[#E9F1FC] text-[10px] font-semibold text-[#22364A] text-left"
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
                      className="p-1.5 rounded-lg border border-[#E8E1D3] bg-[#FBF8F2] hover:bg-[#FCEAE1] text-[10px] font-semibold text-[#22364A] text-left"
                    >
                      Abebech T. (Parent)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
