// Prefer runtime config (set in index.html) over build-time env vars
// This allows changing the backend URL without rebuilding the frontend
const _runtimeConfig = typeof window !== "undefined" ? window.__RUNTIME_CONFIG__ : {};
export const BASE_URL = _runtimeConfig?.VITE_API_URL || import.meta.env.VITE_API_URL || "/api";
export const SOCKET_URL = _runtimeConfig?.VITE_SOCKET_URL || import.meta.env.VITE_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

export const API_TAGS = {
  USER: "User",
  Auth: "Auth",
  ADMIN: "ADMIN",
  Job: "Job",
  Tutor: "Tutor",
  Application: "Application",
  Match: "Match",
  Dashboard: "Dashboard",
  Config: "Config",
};
