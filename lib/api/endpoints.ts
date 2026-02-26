/**
 * API Endpoints
 * Centralized endpoint definitions for type safety and easy maintenance
 */
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },

  // Reports
  REPORTS: {
    LIST: "/reports",
    NEXT_ID: "/reports/next-id",
    CREATE: "/reports/create",
    DETAIL: (id: number | string) => `/reports/${id}`,
    EDIT: (id: number | string) => `/reports/update/${id}`,
    DELETE: (id: number | string) => `/reports/deactive/${id}`,
    EXCEL: (status?: string) => status ? `/reports/excel?status=${status}` : "/reports/excel",
    PDF: (id: number | string) => `/reports/pdf/${id}`,
    RESULTS: (id: number | string) => `/results/create-result/${id}`,
    ARCHIVE: (mode: string) => `/reports/archive?mode=${mode}`,
    APPROVE: (id: number | string) => `/reports/approve/${id}`,
    SIGN: (id: number | string) => `/reports/sign/${id}`,
    REJECT: (id: number | string) => `/reports/reject/${id}`,
  },

  // Lab Types
  LAB_TYPES: {
    LIST: "/lab-types",
    CREATE: "/lab-types",
    DETAIL: (id: number) => `/lab-types/${id}`,
    UPDATE: (id: number) => `/lab-types/update/${id}`,
    DEACTIVATE: (id: number) => `/lab-types/deactive/${id}`,
    REACTIVATE: (id: number) => `/lab-types/reactive/${id}`,
  },

  // Indicators
  INDICATORS: {
    BY_LAB_TYPE: (labTypeId: number) => `/indicators/indicators/${labTypeId}`,
    LIST: "/indicators",
    CREATE: "/indicators/create-indicator",
    UPDATE: (id: number) => `/indicators/update/${id}`,
    DELETE: (id: number) => `/indicators/deactive/${id}`,
  },

  // Locations
  LOCATIONS: {
    LIST: "/locations",
    ALL_WITH_SAMPLES: "/locations/all-with-samples",
    CREATE: "/locations",
    DETAIL: (id: number) => `/locations/${id}`,
    DELETE: (id: number) => `/locations/deactive/${id}`,
    BY_LAB_TYPE: (labTypeId: number) => `/locations?lab_type_id=${labTypeId}`,
    SAMPLES: (packageId: number) => `/locations/samples/${packageId}`,
    CREATE_SAMPLE: (packageId: number) =>
      `/locations/samples/update/${packageId}`,
    DELETE_SAMPLE: (sampleId: number) =>
      `/locations/samples/deactive/${sampleId}`,
  },

  // Users
  USERS: {
    SENIORS: (labTypeId: number, excludeUserId?: number) =>
      `/users/seniors?lab_type_id=${labTypeId}${excludeUserId ? `&exclude_user_id=${excludeUserId}` : ""}`,
    LAB_TYPES: (userId: number) => `/users/lab-types/${userId}`,
    PROFILE: "/users/profile",
    PROFILE_PASSWORD: "/users/profile/password",
    SIGNATURE: "/users/profile/signature",
    SIGNATURE_BY_ID: (id: number) => `/users/signature/${id}`,
    LIST: "/users",
    CREATE: "/users",
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/update/${id}`,
    DEACTIVATE: (id: number) => `/users/deactive/${id}`,
    RESET_PASSWORD: (id: number) => `/users/password/${id}`,
    CHANGE_ROLE: (id: number) => `/users/role/${id}`,
    ASSIGN_LAB_TYPES: (userId: number) => `/users/lab-types/${userId}`,
    ROLES: "/users/roles/list",
    ACTIVITY_LOGS: (page = 1, limit = 20) =>
      `/users/logs?page=${page}&limit=${limit}`,
  },
  // Notifications
  NOTIFICATIONS: {
    STREAM: "/notifications/stream",
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ_ALL: "/notifications/read-all",
    READ: (id: number) => `/notifications/${id}/read`,
  },
} as const;
