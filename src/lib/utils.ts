import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { normalizeAndValidateEthiopianPhone } from "@/lib/validation"

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

// Single source of truth: delegates to the shared Ethiopian phone validator
// (mirror of backend/src/utils/phone.js) so the layers never drift.
export function isValidPhoneNumber(phone?: string | null): boolean {
  if (!phone || typeof phone !== "string") return false;
  return normalizeAndValidateEthiopianPhone(phone).valid;
}
