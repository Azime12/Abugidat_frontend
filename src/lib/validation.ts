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
// Mirrors backend/src/utils/phone.js exactly so the two layers never drift.
//
// Accepts: 09XXXXXXXX, 07XXXXXXXX (10 digits)
//          +2519XXXXXXXX, +2517XXXXXXXX (13 chars)
//          2519XXXXXXXX, 2517XXXXXXXX (12 digits)
//          9XXXXXXXX, 7XXXXXXXX (9 digits)
// Returns: { valid: true, phone: "+251XXXXXXXXX" } or { valid: false, error }
// Dummy/test numbers are rejected so users don't register with placeholders.

export const DUMMY_PHONE_NUMBERS = new Set([
  "911234567", "912345678",
  "711234567", "712345678",
  "900000000",
  "911111111", "922222222", "933333333",
  "944444444", "955555555", "966666666",
  "977777777", "988888888", "999999999",
]);

export function normalizeAndValidateEthiopianPhone(
  raw: string
): { valid: true; phone: string } | { valid: false; error: string } {
  if (!raw || !String(raw).trim()) {
    return { valid: false, error: VALIDATION_MESSAGES.phoneRequired };
  }
  const cleaned = String(raw).trim().replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  if (!match) {
    return { valid: false, error: VALIDATION_MESSAGES.phoneFormat };
  }

  const nineDigits = match[1];
  if (DUMMY_PHONE_NUMBERS.has(nineDigits) || /^(\d)\1{7,}$/.test(nineDigits)) {
    return {
      valid: false,
      error: "Please provide your real active phone number instead of a test or sample number.",
    };
  }

  return { valid: true, phone: `+251${nineDigits}` };
}

// Canonical normalized phone, or "" if unparseable.
export function normalizeEthiopianPhone(raw: string): string {
  const res = normalizeAndValidateEthiopianPhone(raw);
  return res.valid ? res.phone : "";
}

// Validates a phone number. Returns null if valid, or an error message.
export function validatePhone(raw: string): string | null {
  const res = normalizeAndValidateEthiopianPhone(raw);
  return res.valid ? null : res.error;
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
