import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../redux/api/apiSlice";
import authReducer from "../redux/slice/authSlice";
import stateReducer from "../redux/slice/stateSlice";
import telegramReducer from "../redux/slice/telegram/telegramSlice";
import { jobApiSlice } from "../redux/api/jobApiSlice";
import { tutorApiSlice } from "../redux/api/tutorApiSlice";
import { applicationApiSlice } from "../redux/api/applicationApiSlice";
import { matchApiSlice } from "../redux/api/matchApiSlice";
import { dashboardApiSlice } from "../redux/api/dashboardApiSlice";
import { configApiSlice } from "../redux/api/configApiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    state: stateReducer,
    telegram: telegramReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
