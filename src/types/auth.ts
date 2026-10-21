export type UserRole = "parent" | "tutor" | "admin" | "agent";

export interface User {
  id: string;
  telegram_id?: number;
  role: UserRole;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: "am" | "en" | "om";
  photoUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  role: "parent" | "tutor";
}