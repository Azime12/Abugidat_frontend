import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveFileUrl(fileUrl?: string | null): string {
  if (!fileUrl) return "#";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  // Check if it's a Telegram file_id (e.g. BQAC..., AgAC..., BAAC..., or any single token with no slashes)
  if (!fileUrl.includes("/") && !fileUrl.includes("\\")) {
    return `/api/tutors/file/${encodeURIComponent(fileUrl)}`;
  }
  let cleanPath = fileUrl.replace(/\\/g, "/");
  const uploadsIndex = cleanPath.indexOf("uploads/");
  if (uploadsIndex !== -1) {
    cleanPath = cleanPath.substring(uploadsIndex);
  } else {
    cleanPath = cleanPath.replace(/^\/?(src\/)?/, "");
    if (!cleanPath.startsWith("uploads/")) {
      cleanPath = `uploads/${cleanPath}`;
    }
  }
  return `/api/${cleanPath}`;
}

export function isValidPhoneNumber(phone?: string | null): boolean {
  if (!phone || typeof phone !== "string") return false;
  const cleanPhone = phone.trim().replace(/[\s\-\(\)\.]/g, "");
  if (!cleanPhone) return false;

  // Check 1: Reject if all digits are identical (e.g. 9999999999, 1111111111, 0000000000)
  const digitsOnly = cleanPhone.replace(/\D/g, "");
  if (!digitsOnly || /^(\d)\1+$/.test(digitsOnly)) return false;

  // Check 2: Ethiopian phone format: 09..., 07... (10 digits) or +2519..., +2517..., 2519..., 2517...
  const ethRegex = /^(?:\+251|251|0)([79]\d{8})$/;
  const match = cleanPhone.match(ethRegex);

  if (match) {
    const subscriberDigits = match[1];
    const mainNumber = subscriberDigits.slice(1);

    // Reject if all 8 main subscriber digits are identical (e.g. 0900000000, 0911111111, 0700000000)
    if (/^(\d)\1+$/.test(mainNumber)) return false;

    // Reject simple sequential patterns (e.g. 12345678, 87654321)
    if ("0123456789".includes(mainNumber) || "9876543210".includes(mainNumber)) return false;

    return true;
  }

  // Check 3: General international format (MUST start with + followed by country code + number, min 10 digits)
  const intlRegex = /^\+[1-9]\d{9,14}$/;
  if (intlRegex.test(cleanPhone)) {
    const intlDigits = cleanPhone.replace(/\D/g, "");
    if (/^(\d)\1+$/.test(intlDigits)) return false;
    return true;
  }

  return false;
}
