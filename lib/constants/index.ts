/**
 * Application constants
 */

// Status options for filtering
export const STATUS_OPTIONS = [
  { key: "all", label: "Бүгд" },
  { key: "draft", label: "Draft" },
  { key: "pending_samples", label: "Дээж хүлээгдэж байна" },
  { key: "tested", label: "Шинжилгээ хийгдсэн" },
  { key: "signed", label: "Шалгагдаж байна" },
  { key: "approved", label: "Батлагдсан" },
] as const;

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  tested: "Шинжилгээ хийгдсэн",
  pending_samples: "Дээж хүлээгдэж байна",
  signed: "Шалгагдаж байна",
  approved: "Батлагдсан",
  deleted: "Устгагдсан",
};

// Date format
export const DATE_FORMAT = "YYYY-MM-DD";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Token storage key
export const TOKEN_KEY = "token";

// Cookie max age (7 days in seconds)
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
