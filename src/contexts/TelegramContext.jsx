import React, { createContext, useEffect, useState, useContext, useMemo } from "react";

export const TelegramContext = createContext(null);

const DEFAULT_MOCK_USER = {
  id: 718293041,
  first_name: "Amara",
  last_name: "Bekele",
  username: "amarabekele",
  language_code: "en",
  is_premium: true,
  photo_url: null,
};

export const TelegramProvider = ({ children }) => {
  const [webApp, setWebApp] = useState(null);
  const [initDataRaw, setInitDataRaw] = useState("");
  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [tgUser, setTgUser] = useState(null);
  const [startParam, setStartParam] = useState(null);
  const [platform, setPlatform] = useState("unknown");
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Check if running inside real Telegram WebApp
    const tg = window?.Telegram?.WebApp;

    if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setIsTelegram(true);

      const raw = tg.initData || "";
      const unsafe = tg.initDataUnsafe || {};

      setInitDataRaw(raw);
      setInitDataUnsafe(unsafe);
      setTgUser(unsafe.user || null);
      setStartParam(unsafe.start_param || null);
      setPlatform(tg.platform || "unknown");

      // Synchronize Telegram CSS theme variables
      if (tg.themeParams) {
        document.documentElement.style.setProperty(
          "--tg-theme-bg-color",
          tg.themeParams.bg_color || "#ffffff"
        );
        document.documentElement.style.setProperty(
          "--tg-theme-text-color",
          tg.themeParams.text_color || "#22364A"
        );
        document.documentElement.style.setProperty(
          "--tg-theme-button-color",
          tg.themeParams.button_color || "#3B7DD8"
        );
        document.documentElement.style.setProperty(
          "--tg-theme-button-text-color",
          tg.themeParams.button_text_color || "#ffffff"
        );
      }
    } else {
      // Running in standard browser / desktop development
      // Check if initData was passed in URL query or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const urlInitData = urlParams.get("tgWebAppData") || urlParams.get("initData");
      const urlStartParam = urlParams.get("tgWebAppStartParam") || urlParams.get("start_param");

      if (urlInitData) {
        try {
          const parsed = new URLSearchParams(urlInitData);
          const userStr = parsed.get("user");
          const userObj = userStr ? JSON.parse(userStr) : DEFAULT_MOCK_USER;
          setInitDataRaw(urlInitData);
          setInitDataUnsafe({
            user: userObj,
            auth_date: parsed.get("auth_date") || Math.floor(Date.now() / 1000),
            hash: parsed.get("hash") || "mock_hash_development",
            start_param: urlStartParam || parsed.get("start_param") || null,
          });
          setTgUser(userObj);
          setStartParam(urlStartParam || parsed.get("start_param") || null);
          setIsTelegram(true);
        } catch {
          setTgUser(DEFAULT_MOCK_USER);
        }
      } else {
        // Fallback default development mock user
        const storedUser = localStorage.getItem("abugida_mock_tg_user");
        const initialUser = storedUser ? JSON.parse(storedUser) : DEFAULT_MOCK_USER;
        setTgUser(initialUser);
        setInitDataUnsafe({
          user: initialUser,
          auth_date: Math.floor(Date.now() / 1000),
          hash: "mock_development_hash_2026",
          start_param: urlStartParam || "job_101",
          query_id: "AAGX92841",
        });
        setInitDataRaw(
          `query_id=AAGX92841&user=${encodeURIComponent(
            JSON.stringify(initialUser)
          )}&auth_date=${Math.floor(Date.now() / 1000)}&hash=mock_dev_hash`
        );
        setStartParam(urlStartParam || "job_101");
        setPlatform("web");
        setIsTelegram(false);
      }
    }
  }, []);

  const updateMockUser = (newUser) => {
    const merged = { ...tgUser, ...newUser };
    setTgUser(merged);
    localStorage.setItem("abugida_mock_tg_user", JSON.stringify(merged));
    const newRaw = `query_id=AAGX92841&user=${encodeURIComponent(
      JSON.stringify(merged)
    )}&auth_date=${Math.floor(Date.now() / 1000)}&hash=mock_dev_hash`;
    setInitDataRaw(newRaw);
    setInitDataUnsafe((prev) => ({
      ...prev,
      user: merged,
    }));
  };

  const closeMiniApp = () => {
    if (webApp?.close) {
      webApp.close();
    } else {
      window.history.back();
    }
  };

  const sendDataToTelegramBot = (data) => {
    if (webApp?.sendData) {
      webApp.sendData(typeof data === "string" ? data : JSON.stringify(data));
    } else {
      console.log("Mock Telegram sendData:", data);
    }
  };

  const value = useMemo(
    () => ({
      webApp,
      initData: initDataRaw,
      initDataUnsafe,
      tgUser,
      startParam,
      platform,
      isTelegram,
      updateMockUser,
      closeMiniApp,
      sendDataToTelegramBot,
    }),
    [webApp, initDataRaw, initDataUnsafe, tgUser, startParam, platform, isTelegram]
  );

  return (
    <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};