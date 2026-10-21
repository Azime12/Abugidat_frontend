// Abugida Tutor API Service
import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach Telegram initData on every request
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) {
    config.headers["X-Telegram-Init-Data"] = (window as any).Telegram.WebApp.initData;
  }
  return config;
});

// ─── Auth Service (real — from ./auth) ───
export { authService } from "./auth";

// ─── User Service (stub) ───
export const userService = {
  getUsers: () => client.get("/users"),
  getUserById: (id: string) => client.get(`/users/${id}`),
  getPendingUsers: () => client.get("/users/pending"),
  registerUser: (data: any) => client.post("/users", data),
  updateUser: (data: any) => client.put(`/users/${data.id}`, data),
  updatePassword: (data: any) => client.post("/users/password", data),
  resetPasswordById: (id: string) => client.post(`/users/${id}/reset-password`),
  deactivateUser: (id: string) => client.patch(`/users/${id}/deactivate`),
  activateUser: (id: string) => client.patch(`/users/${id}/activate`),
  deleteUser: (id: string) => client.delete(`/users/${id}`),
};

// ─── Tutor Service ───
export { tutorService } from "./tutors";

// ─── Request Service (stub) ───
export const requestService = {
  create: (data: any) => client.post("/requests", data),
  getMine: () => client.get("/requests/mine"),
};

export default client;
