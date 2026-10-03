import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setUserCredentials } from "../../redux/slice/authSlice";
import { useTutorAuthMutation } from "../../redux/api/tutorMiniAppApiSlice";
import TelegramOAuthButton from "./TelegramOAuthButton";

/**
 * TelegramLoginModal
 *
 * Primary method: Official Telegram OAuth popup (like Sign in with Google)
 *   — clicking the blue button opens a real Telegram authorization window
 *   — user confirms in Telegram → backend verifies HMAC → JWT issued
 *
 * Fallback: Manual username/phone lookup (for users who cannot use the popup)
 */
export default function TelegramLoginModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tutorAuth, { isLoading: manualLoading }] = useTutorAuthMutation();

  const [showManual, setShowManual] = useState(false);
  const [identifier, setIdentifier] = useState("");

  if (!isOpen) return null;

  /* ── Manual fallback: username or phone lookup ── */
  const handleManualLogin = async (e) => {
    e?.preventDefault();
    const target = identifier.trim().replace("@", "");
    if (!target) {
      toast.warning("Please enter your Telegram username or phone number.");
      return;
    }
    try {
      const payload = /^(\+251|09|07|\d{9,12}$)/.test(target.replace(/[\s-]/g, ""))
        ? { phone_number: target.replace(/[\s-]/g, "") }
        : { telegram_id: target };

      const res = await tutorAuth(payload).unwrap();
      handleAuthSuccess(res);
    } catch (err) {
      toast.error(err?.data?.message || "Authentication failed. Please try again.");
    }
  };

  const handleAuthSuccess = (tutor) => {
    onClose();
    if (onSuccess) onSuccess(tutor);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E8E1D3] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1B3A5C] via-[#1E5080] to-[#229ED9] px-6 py-6 text-white relative overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full bg-white/5" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
            >
              <i className="ti ti-x text-sm" />
            </button>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.478c-.148.657-.537.818-1.088.508l-3-2.21-1.447 1.393c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.053-.333-.373-.12L6.26 14.748l-2.95-.924c-.641-.2-.654-.641.136-.948l11.519-4.44c.533-.194 1.001.13.597.812z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight">Sign in with Telegram</h3>
                <p className="text-[12px] text-white/70 mt-0.5">
                  Authorization via your Telegram account
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* How it works — steps */}
            <div className="bg-[#F0F7FF] border border-[#C8E0F7] rounded-2xl p-4 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#3B7DD8] mb-1">How it works</p>
              {[
                { n: "1", text: "Click the button below" },
                { n: "2", text: "Telegram opens and asks you to confirm" },
                { n: "3", text: "You approve — we get your verified identity" },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#229ED9] text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </div>
                  <p className="text-xs text-[#22364A]">{step.text}</p>
                </div>
              ))}
            </div>

            {/* Primary: Real Telegram OAuth */}
            <TelegramOAuthButton
              onSuccess={handleAuthSuccess}
              label="Continue with Telegram"
              size="large"
            />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E8E1D3]" />
              <span className="text-[11px] text-[#6B7684] font-semibold">
                or use manual lookup
              </span>
              <div className="flex-1 h-px bg-[#E8E1D3]" />
            </div>

            {/* Manual fallback toggle */}
            {!showManual ? (
              <button
                onClick={() => setShowManual(true)}
                className="w-full py-2.5 border border-[#E8E1D3] rounded-xl text-xs text-[#6B7684] hover:border-[#229ED9] hover:text-[#229ED9] font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <i className="ti ti-keyboard text-sm" />
                Enter username or phone manually
              </button>
            ) : (
              <AnimatePresence>
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleManualLogin} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#22364A] mb-1.5">
                        Telegram Username or Phone
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#229ED9] font-bold select-none">@</span>
                        <input
                          type="text"
                          autoFocus
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="username  or  0911223344"
                          className="w-full pl-9 pr-4 py-3 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs font-semibold text-[#22364A] focus:outline-none focus:border-[#229ED9] transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-[#6B7684] mt-1 ml-1">
                        This only works if you are already registered via our Telegram bot.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowManual(false)}
                        className="flex-1 py-2.5 border border-[#E8E1D3] rounded-xl text-xs font-semibold text-[#6B7684] hover:bg-[#FBF8F2] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={manualLoading}
                        className="flex-1 py-2.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {manualLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><i className="ti ti-login text-sm" /><span>Sign In</span></>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Bot Footer */}
            <div className="bg-[#FBF8F2] border border-[#E8E1D3] rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ti ti-robot text-base text-[#229ED9]" />
                <div>
                  <p className="text-[10px] text-[#6B7684]">Official Bot</p>
                  <p className="text-[11px] font-bold text-[#22364A]">@Testestestes12345tbot</p>
                </div>
              </div>
              <a
                href="https://t.me/Testestestes12345tbot"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                Open Bot
                <i className="ti ti-external-link text-xs" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
