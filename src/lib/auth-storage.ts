// Central storage for auth state.
//
// Tokens are NO LONGER stored here — they live in HttpOnly cookies set by the
// backend, so client-side JavaScript cannot read or persist them. Only the
// non-sensitive user profile and session id are kept locally.
//
// Dual-shape user: parent uses user_id, tutor uses tutorId.

import type { User as BaseUser } from "@/types/auth";

export interface AuthUser extends Omit<BaseUser, "telegram_id"> {
  // Parent-only
  userId?: number;
  roles?: string[];
  permissions?: string[];
  phone_number?: string;
  first_name?: string;
  last_name?: string;

  // Tutor-only
  tutorId?: number;
  is_registered?: boolean;
  kulf_balance?: number;
  telegram_id?: string;
}

export interface StoredAuth {
  sessionId?: string;
  user: AuthUser;
}

const USER_KEY = "abugida_user";
const SESSION_KEY = "abugida_session_id";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveAuth(auth: StoredAuth): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    if (auth.sessionId) localStorage.setItem(SESSION_KEY, auth.sessionId);
  } catch (err) {
    console.warn("saveAuth failed:", err);
  }
}

export function getAuth(): StoredAuth | null {
  if (!isBrowser()) return null;
  try {
    const userRaw = localStorage.getItem(USER_KEY);
    if (!userRaw) return null;
    const user = JSON.parse(userRaw) as AuthUser;
    return {
      sessionId: localStorage.getItem(SESSION_KEY) || undefined,
      user,
    };
  } catch (err) {
    console.warn("getAuth failed:", err);
    return null;
  }
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn("clearAuth failed:", err);
  }
}

export function getSessionId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(SESSION_KEY);
}

/** Read the CSRF double-submit token from its non-HttpOnly cookie. */
export function getCsrfToken(): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function updateUser(partial: Partial<AuthUser>): void {
  if (!isBrowser()) return;
  const current = getAuth();
  if (!current) return;
  saveAuth({ ...current, user: { ...current.user, ...partial } });
}
