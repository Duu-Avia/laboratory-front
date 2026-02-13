/**
 * Application constants
 */

// Status options for filtering
export const STATUS_OPTIONS = [
  { key: "all", label: "Бүгд" },
  { key: "draft", label: "Draft" },
  { key: "pending_samples", label: "Сорьц хүлээгдэж байна" },
  { key: "incomplete", label: "Дутуу" },
  { key: "tested", label: "Шинжилгээ хийгдсэн" },
  { key: "signed", label: "Шалгагдаж байна" },
  { key: "approved", label: "Батлагдсан" },
  { key: "rejected", label: "Буцаагдсан" },
] as const;

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  tested: "Шинжилгээ хийгдсэн",
  incomplete: "Дутуу",
  pending_samples: "Сорьц хүлээгдэж байна",
  signed: "Шалгагдаж байна",
  approved: "Батлагдсан",
  rejected: "Буцаагдсан",
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

// Notification type labels
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  report_assigned: "Хянах хүсэлт",
  report_approved: "Тайлан батлагдсан",
  report_rejected: "Тайлан буцаагдсан",
};

export const ACTIVITY_LOGS_LABELS = {
  targetNames: {
    report: "Тайлан",
    user: "Хэрэглэгч",
    result: "Үр дүн",
    lab_type: "Лабораторийн төрөл",
    indicator: "Үзүүлэлт",
    location: "Байршил",
  },

  actionNames: {
    login: "Нэвтэрсэн",
    create: "Үүсгэсэн",
    update: "Засварласан",
    delete: "Устгасан",
    view: "Үзсэн",
    sign: "Гарын үсэг зурсан",
    approve: "Баталсан",
    reject: "Буцаасан",
    export: "Татсан",
  }  
} as const