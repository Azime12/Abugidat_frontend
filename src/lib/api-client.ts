import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { getSessionId, getCsrfToken, clearAuth } from "./auth-storage";

const baseURL =
  typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api";

const client: AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true, // send/receive the HttpOnly auth cookies
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const sessionId = getSessionId();
  const csrfToken = getCsrfToken();
  if (sessionId) config.headers.set("x-session-id", sessionId);
  if (csrfToken) config.headers.set("x-csrf-token", csrfToken);
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  // The refresh token rides in an HttpOnly cookie (auto-sent). The backend
  // responds by rotating the cookies, so nothing needs to be stored here.
  await client.post("/users/refresh-token");
}

client.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const originalReq: any = error.config;

    // Never attempt token refresh on auth-entry routes — the 401 there is a
    // real credential failure, not an expired session.
    const isAuthEntryRoute =
      originalReq?.url?.includes("/users/login") ||
      originalReq?.url?.includes("/users/refresh-token") ||
      originalReq?.url === "/users" ||
      originalReq?.url?.includes("/tutor/auth");

    if (status === 401 && originalReq && !originalReq._retried && !isAuthEntryRoute) {
      originalReq._retried = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }
        await refreshPromise!;
        // The retry carries the newly-rotated cookies automatically.
        return client(originalReq);
      } catch {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          const locale = window.location.pathname.split("/")[1] || "en";
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(error);
      }
    }

    if (status === 403) {
      const msg =
        error.response?.data?.message ||
        (error.response?.data as any)?.error?.message ||
        "Access denied";
      toast.error(msg);
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("Network error — please retry");
    }

    return Promise.reject(error);
  }
);

export default client;
export { client as apiClient };
