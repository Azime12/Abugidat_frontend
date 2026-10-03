import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setUserCredentials } from "../../redux/slice/authSlice";
import { useTutorAuthMutation } from "../../redux/api/tutorMiniAppApiSlice";

const BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID;
const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "Testestestes12345tbot";

/**
 * TelegramOAuthButton
 *
 * Uses the official Telegram Login Widget JS API to open a REAL Telegram
 * authorization popup — exactly like "Sign in with Google".
 *
 * Flow:
 *  1. Load telegram-widget.js (once)
 *  2. User clicks button → window.Telegram.Login.auth() opens Telegram popup
 *  3. User confirms authorization inside Telegram (web/app)
 *  4. Telegram returns signed { id, first_name, last_name, username, auth_date, hash }
 *  5. Send widgetData to backend → backend verifies HMAC → returns JWT
 */
export default function TelegramOAuthButton({
  onSuccess,
  label = "Sign in with Telegram",
  size = "large",       // "large" | "medium" | "small"
  className = "",
  requestAccess = true, // request permission to send messages via bot
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tutorAuth, { isLoading }] = useTutorAuthMutation();
  const scriptLoaded = useRef(false);

  /* ── Load the Telegram Login Widget script once ── */
  useEffect(() => {
    if (scriptLoaded.current) return;
    if (document.getElementById("telegram-login-script")) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.id = "telegram-login-script";
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.onload = () => { scriptLoaded.current = true; };
    script.onerror = () => {
      console.error("Failed to load Telegram login widget script. Check network access to telegram.org.");
    };
    document.head.appendChild(script);

    return () => { /* keep the script alive — don't remove on unmount */ };
  }, []);

  /* ── Called by Telegram after user approves in popup ── */
  const handleTelegramAuth = useCallback(async (widgetData) => {
    if (!widgetData) {
      toast.error("Telegram authorization was cancelled or failed.");
      return;
    }

    try {
      // Send the signed widget data to our backend for HMAC verification
      const res = await tutorAuth({ widgetData }).unwrap();

      if (res.token && res.tutor) {
        dispatch(
          setUserCredentials({
            token: res.token,
            user: { ...res.tutor, role: "Tutor" },
          })
        );

        const name = res.tutor.first_name || widgetData.first_name || "Tutor";
        if (res.is_new) {
          toast.success(`Welcome to Abugida, ${name}! Complete your profile to start applying.`);
          navigate("/miniapp/register");
        } else {
          toast.success(`Welcome back, ${name}!`);
        }

        if (onSuccess) onSuccess(res.tutor);
      }
    } catch (err) {
      const msg = err?.data?.message || "Telegram authentication failed. Please try again.";
      toast.error(msg);
    }
  }, [tutorAuth, dispatch, navigate, onSuccess]);

  /* ── Trigger the official Telegram OAuth popup ── */
  const openTelegramAuth = useCallback(() => {
    if (!BOT_ID) {
      toast.error("Telegram bot not configured. Please set VITE_TELEGRAM_BOT_ID.");
      return;
    }

    const tg = window.Telegram?.Login;
    if (!tg) {
      // Script not yet loaded — retry in 500ms
      toast.info("Loading Telegram authorization...");
      setTimeout(openTelegramAuth, 600);
      return;
    }

    tg.auth(
      {
        bot_id: BOT_ID,
        request_access: requestAccess,
      },
      handleTelegramAuth
    );
  }, [handleTelegramAuth, requestAccess]);

  /* ── Size variants ── */
  const sizeClass = {
    large: "py-3.5 text-sm gap-3",
    medium: "py-2.5 text-xs gap-2.5",
    small: "py-2 text-xs gap-2",
  }[size] || "py-3.5 text-sm gap-3";

  return (
    <button
      type="button"
      onClick={openTelegramAuth}
      disabled={isLoading}
      className={`w-full px-5 bg-[#229ED9] hover:bg-[#1A8FC5] active:bg-[#1679A8] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClass} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span>Verifying with Telegram...</span>
        </>
      ) : (
        <>
          {/* Telegram logo */}
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#229ED9]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.478c-.148.657-.537.818-1.088.508l-3-2.21-1.447 1.393c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.053-.333-.373-.12L6.26 14.748l-2.95-.924c-.641-.2-.654-.641.136-.948l11.519-4.44c.533-.194 1.001.13.597.812z"/>
            </svg>
          </div>
          <span>{label}</span>
          <i className="ti ti-arrow-right text-sm ml-auto opacity-70" />
        </>
      )}
    </button>
  );
}
