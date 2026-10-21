// Shared validation rules and messages.
// Both frontend forms and backend Joi validators follow these exact strings
// so the user sees identical feedback whichever layer rejects the request.

export const VALIDATION_MESSAGES = {
  // Phone
  phoneRequired: "Phone number is required",
  phoneDigits: "Phone number must be exactly 10 digits",
  phoneFormat: "Enter a valid Ethiopian phone number (e.g. 0912345678)",

  // Password
  passwordRequired: "Password is required",
  passwordMin: "Password must be at least 6 characters",
  passwordMax: "Password must be at most 128 characters",
  passwordNumber: "Password must include at least one number",

  // Name
  nameRequired: "Full name is required",
  nameMin: "Full name must be at least 2 characters",
  nameMax: "Full name must be at most 100 characters",

  // Email
  emailFormat: "Enter a valid email address",

  // Terms
  termsRequired: "You must agree to the Terms to continue",

  // Auth
  invalidCredentials: "Invalid phone or password",
  networkError: "Network error — please check your connection",
  serverError: "Server error — please try again",
  rateLimited: "Too many attempts. Please try again in 15 minutes.",
} as const;

// ─── Phone ──────────────────────────────────────────────────────
// Accepts: 0912345678 (10 digits) — but user may paste +2519... or 912...
// Normalizes to 10-digit local format, or returns "" if unparseable.
export function normalizeEthiopianPhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("251") && digits.length === 12) return "0" + digits.slice(3);
  if (digits.startsWith("0") && digits.length === 10) return digits;
  if (digits.length === 9 && (digits.startsWith("9") || digits.startsWith("7"))) return "0" + digits;
  return "";
}

// Validates a phone number. Returns null if valid, or an error message.
export function validatePhone(raw: string): string | null {
  if (!raw || !raw.trim()) return VALIDATION_MESSAGES.phoneRequired;
  const normalized = normalizeEthiopianPhone(raw);
  if (!normalized) {
    // Could be wrong length or wrong prefix
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10 && !digits.startsWith("0")) return VALIDATION_MESSAGES.phoneFormat;
    if (digits.length !== 10) return VALIDATION_MESSAGES.phoneDigits;
    return VALIDATION_MESSAGES.phoneFormat;
  }
  return null;
}

// ─── Password ───────────────────────────────────────────────────
export function validatePassword(password: string, options?: { requireNumber?: boolean }): string | null {
  if (!password) return VALIDATION_MESSAGES.passwordRequired;
  if (password.length < 6) return VALIDATION_MESSAGES.passwordMin;
  if (password.length > 128) return VALIDATION_MESSAGES.passwordMax;
  if (options?.requireNumber && !/\d/.test(password)) return VALIDATION_MESSAGES.passwordNumber;
  return null;
}

// ─── Name ───────────────────────────────────────────────────────
export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) return VALIDATION_MESSAGES.nameRequired;
  const trimmed = name.trim();
  if (trimmed.length < 2) return VALIDATION_MESSAGES.nameMin;
  if (trimmed.length > 100) return VALIDATION_MESSAGES.nameMax;
  return null;
}

// ─── Email (optional) ───────────────────────────────────────────
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return null; // optional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return VALIDATION_MESSAGES.emailFormat;
  return null;
}

// ─── Terms ──────────────────────────────────────────────────────
export function validateTerms(agree: boolean): string | null {
  if (!agree) return VALIDATION_MESSAGES.termsRequired;
  return null;
}
