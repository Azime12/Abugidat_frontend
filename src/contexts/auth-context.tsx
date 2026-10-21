"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authService } from "@/services/api/auth";
import { saveAuth, getAuth, clearAuth } from "@/lib/auth-storage";
import type { AuthUser } from "@/lib/auth-storage";
import type { LoginCredentials, SignupData, User } from "@/types/auth";
import toast from "react-hot-toast";

export interface TutorLoginInput {
  initData?: string;
  telegram_id?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextValue {
  user: User | null;
  /** Always null now — tokens live in HttpOnly cookies, not in memory. */
  token: string | null;
  sessionId: string | null;
  /** Always null now — refresh token lives in an HttpOnly cookie. */
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (creds: LoginCredentials) => Promise<User>;
  loginTutor: (input: TutorLoginInput) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getAuth();
    if (stored) {
      setUser(stored.user as unknown as User);
      setSessionId(stored.sessionId ?? null);
    }

    // Always re-hydrate via the backend: the auth token lives in an HttpOnly
    // cookie, so even a fresh tab (no local user) can restore the session.
    authService
      .whoami()
      .then((fresh) => {
        if (fresh) {
          setUser(fresh as unknown as User);
          saveAuth({ sessionId: stored?.sessionId, user: fresh });
        } else {
          clearAuth();
          setUser(null);
          setSessionId(null);
        }
      })
      .catch(() => {
        // Network error — keep whatever local state we have.
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(
    (result: { user: AuthUser; sessionId?: string }) => {
      saveAuth({ sessionId: result.sessionId, user: result.user });
      setSessionId(result.sessionId ?? null);
      setUser(result.user as unknown as User);
    },
    []
  );

  const login = useCallback(
    async (creds: LoginCredentials): Promise<User> => {
      const result = await authService.login(creds);
      persist({ sessionId: result.sessionId, user: result.user });
      return result.user as unknown as User;
    },
    [persist]
  );

  const loginTutor = useCallback(
    async (input: TutorLoginInput): Promise<User> => {
      const result = await authService.loginTutor(input);
      persist({ sessionId: result.sessionId, user: result.user });
      return result.user as unknown as User;
    },
    [persist]
  );

  const signup = useCallback(
    async (data: SignupData): Promise<User> => {
      const result = await authService.register({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      persist({ sessionId: result.sessionId, user: result.user });
      return result.user as unknown as User;
    },
    [persist]
  );

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    clearAuth();
    setUser(null);
    setSessionId(null);
    toast.success("Logged out");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        isLoading,
        isAuthenticated: !!user,
        sessionId,
        refreshToken: null,
        login,
        loginTutor,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
