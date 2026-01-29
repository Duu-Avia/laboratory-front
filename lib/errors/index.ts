import { ApiError } from "@/lib/api";

/**
 * Error messages in Mongolian
 */
export const ERROR_MESSAGES = {
  NETWORK: "Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгана уу.",
  UNAUTHORIZED: "Нэвтрэх эрхгүй байна. Дахин нэвтэрнэ үү.",
  NOT_FOUND: "Хайсан мэдээлэл олдсонгүй.",
  SERVER: "Серверийн алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.",
  UNKNOWN: "Тодорхойгүй алдаа гарлаа.",
  VALIDATION: "Мэдээллээ шалгана уу.",
} as const;

/**
 * Get user-friendly error message from error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 422:
        return ERROR_MESSAGES.VALIDATION;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER;
      default:
        // Try to get message from API response
        if (error.data && typeof error.data === "object") {
          const data = error.data as Record<string, unknown>;
          if (typeof data.detail === "string") return data.detail;
          if (typeof data.message === "string") return data.message;
        }
        return ERROR_MESSAGES.UNKNOWN;
    }
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return ERROR_MESSAGES.NETWORK;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN;
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NEXT_PUBLIC_ENV === "development") {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  }
}
