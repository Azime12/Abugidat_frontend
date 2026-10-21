// Real auth client — parent (phone+password) and tutor (telegram/phone).
// Backend routes used here:
//   POST /api/users/login
//   POST /api/users
//   GET  /api/users/me
//   POST /api/users/logout
//   POST /api/users/refresh-token
//   POST /api/tutor/auth
//   GET  /api/tutor/me

import client from "@/lib/api-client";
import type {
  LoginCredentials,
  SignupData,
  User,
} from "@/types/auth";
import type { AuthUser } from "@/lib/auth-storage";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("251") && digits.length === 12) return "0" + digits.slice(3);
  if (digits.startsWith("0") && digits.length === 10) return digits;
  if (digits.length === 9 && (digits.startsWith("9") || digits.startsWith("7"))) {
    return "0" + digits;
  }
  return digits;
}

function parentUserToAuthUser(raw: any): AuthUser {
  return {
    id: String(raw.user_id ?? raw.id ?? ""),
    userId: raw.user_id ?? raw.id,
    fullName: [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim(),
    firstName: raw.first_name,
    lastName: raw.last_name,
    first_name: raw.first_name,
    last_name: raw.last_name,
    phone: raw.phone_number,
    phone_number: raw.phone_number,
    role: raw.roles?.includes("admin") ? "admin" : "parent",
    roles: raw.roles ?? [],
    permissions: raw.permissions ?? [],
    language: "am",
  };
}

function tutorToAuthUser(raw: any): AuthUser {
  return {
    id: `tutor-${raw.id}`,
    tutorId: raw.id,
    fullName: raw.name || [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim(),
    firstName: raw.first_name,
    lastName: raw.last_name,
    first_name: raw.first_name,
    last_name: raw.last_name,
    phone: raw.phone_number,
    phone_number: raw.phone_number,
    email: raw.email,
    role: "tutor",
    roles: ["tutor"],
    permissions: [],
    photoUrl: raw.photo_url,
    is_registered: !!raw.is_registered,
    kulf_balance: raw.kulf_balance ?? 0,
    telegram_id: raw.telegram_id,
    language: "am",
  };
}

export interface TutorLoginInput {
  initData?: string;
  telegram_id?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResult {
  token: string;
  refreshToken?: string;
  sessionId?: string;
  user: AuthUser;
}

export const authService = {
  async login(creds: LoginCredentials): Promise<AuthResult> {
    const res = await client.post("/users/login", {
      phone_number: normalizePhone(creds.phone),
      password: creds.password,
    });
    const data = res.data || {};
    if (!data.success || !data.token) {
      throw new Error(data.message || "Login failed");
    }
    return {
      token: data.token,
      refreshToken: data.refreshToken,
      sessionId: data.session_id,
      user: parentUserToAuthUser(data.user),
    };
  },

  async register(data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    role?: "parent" | "tutor";
  }): Promise<AuthResult> {
    if (data.role === "tutor") {
      return authService.loginTutor({
        phone: normalizePhone(data.phone),
        first_name: data.fullName.split(" ")[0] || "",
        last_name: data.fullName.split(" ").slice(1).join(" ") || "",
      });
    }

    const parts = data.fullName.trim().split(/\s+/);
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "-";

    const regRes = await client.post("/users", {
      first_name,
      last_name,
      phone_number: normalizePhone(data.phone),
      password: data.password,
    });
    if (!regRes.data?.success) {
      throw new Error(regRes.data?.message || "Signup failed");
    }
    return authService.login({ phone: data.phone, password: data.password });
  },

  async loginTutor(input: TutorLoginInput): Promise<AuthResult> {
    const body: any = {};
    if (input.initData) body.initData = input.initData;
    else if (input.telegram_id) body.telegram_id = input.telegram_id;
    else {
      body.phone_number = normalizePhone(input.phone || "");
      body.first_name = input.first_name || "";
      body.last_name = input.last_name || "";
    }

    const res = await client.post("/tutor/auth", body);
    const data = res.data || {};
    if (!data.success || !data.token) {
      throw new Error(data.message || "Tutor login failed");
    }
    return {
      token: data.token,
      sessionId: undefined,
      user: tutorToAuthUser(data.tutor),
    };
  },

  async whoami(): Promise<AuthUser | null> {
    try {
      const res = await client.get("/users/me");
      if (res.data?.success && res.data.user) {
        return parentUserToAuthUser(res.data.user);
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) throw err;
    }
    try {
      const res = await client.get("/tutor/me");
      if (res.data?.success && res.data.tutor) {
        return tutorToAuthUser(res.data.tutor);
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) throw err;
    }
    return null;
  },

  async logout(): Promise<void> {
    try {
      await client.post("/users/logout");
    } catch {
      // ignore — local clear happens regardless
    }
  },

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    const res = await client.post("/users/refresh-token", { refreshToken });
    const data = res.data || {};
    if (!data.token) throw new Error("Refresh failed");
    return { token: data.token, refreshToken: data.refreshToken };
  },

  async resetPassword(_token: string, _password: string): Promise<void> {
    throw new Error("Password reset is not available yet.");
  },

  async sendOtp(_phone: string): Promise<void> {
    throw new Error("OTP is not available yet.");
  },

  async verifyOtp(_phone: string, _code: string): Promise<void> {
    throw new Error("OTP is not available yet.");
  },
};


