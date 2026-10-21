import { AxiosError } from "axios";
import { VALIDATION_MESSAGES } from "./validation";

/**
 * Extract a user-friendly error message from any error thrown by api-client.
 * Order of precedence:
 *   1. Backend Joi validation array → first message
 *   2. Backend message
 *   3. Network/timeout
 *   4. HTTP status fallback
 *   5. Generic
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (!err) return fallback;

  const axiosErr = err as AxiosError<any>;

  // No response → network error
  if (axiosErr.isAxiosError && !axiosErr.response) {
    if (axiosErr.code === "ECONNABORTED") return "Request timed out — please try again";
    return VALIDATION_MESSAGES.networkError;
  }

  const data = axiosErr?.response?.data as any;
  const status = axiosErr?.response?.status;

  // Joi validation errors come as { success:false, message:"Validation error", errors:[...] }
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0];
  }

  // Standard backend response
  if (data?.message && typeof data.message === "string") {
    return data.message;
  }

  // Structured error object
  if (data?.error) {
    if (typeof data.error === "string") return data.error;
    if (typeof data.error === "object" && data.error.message) return data.error.message;
  }

  // HTTP status fallbacks
  if (status === 401) return VALIDATION_MESSAGES.invalidCredentials;
  if (status === 403) return "Access denied";
  if (status === 404) return "Not found";
  if (status === 429) return VALIDATION_MESSAGES.rateLimited;
  if (status && status >= 500) return VALIDATION_MESSAGES.serverError;

  // Axios's generic "Request failed with status code 400" — strip if nothing else
  if (err instanceof Error && err.message && !/^Request failed/.test(err.message)) {
    return err.message;
  }

  return fallback;
}
