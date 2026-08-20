import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  initialized: false,
  user: null,
  theme: "light",
  platform: "unknown",
  isMock: false,
};

export const telegramSlice = createSlice({
  name: "telegram",
  initialState,
  reducers: {
    initTelegram: (state, action) => {
      const { user, platform, theme } = action.payload;
      state.initialized = true;
      state.user = user || null;
      state.platform = platform || "unknown";
      state.theme = theme || "light";
      state.isMock = !window?.Telegram?.WebApp;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setUserId: (state, action) => {
      if (state.user) {
        state.user.id = action.payload;
      }
    },
  },
});

export const { initTelegram, setTheme, setUserId } = telegramSlice.actions;
export default telegramSlice.reducer;
