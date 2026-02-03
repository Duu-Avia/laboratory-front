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
    CREATE: "/reports/create",
    DETAIL: (id: number | string) => `/reports/${id}`,
    EDIT: (id: number | string) => `/reports/edit/${id}`,
    DELETE: (id: number | string) => `/reports/delete/${id}`,
    EXCEL: (status?: string) =>
      status ? `/reports/excel?status=${status}` : "/reports/excel",
    PDF: (id: number | string) => `/reports/${id}/pdf`,
    RESULTS: (id: number | string) => `/results/create-result/${id}`,
    ARCHIVE: (mode: string) => `/reports/archive?mode=${mode}`,
    APPROVE: (id: number | string) => `/reports/approve/${id}`,
    SIGN: (id: number | string) => `/reports/sign/${id}`,
  },

  // Lab Types
  LAB_TYPES: {
    LIST: "/lab-types",
  },

  // Indicators
  INDICATORS: {
    BY_LAB_TYPE: (labTypeId: number) =>
      `/indicators/indicators/${labTypeId}`,
    LIST: "/indicators",
    CREATE: "/indicators/create-indicator",
  },

  // Locations
  LOCATIONS: {
    BY_LAB_TYPE: (labTypeId: number) =>
      `/locations?lab_type_id=${labTypeId}`,
    SAMPLES: (packageId: number) => `/locations/samples/${packageId}`,
  },

  // Users
  USERS: {
    SENIORS: (labTypeId: number) => `/users/seniors?lab_type_id=${labTypeId}`,
    LAB_TYPES: (userId: number) => `/users/${userId}/lab-types`,
    PROFILE: "/users/profile",
    PROFILE_PASSWORD: "/users/profile/password",
    LIST: "/users",
    CREATE: "/users",
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DEACTIVATE: (id: number) => `/users/${id}`,
    RESET_PASSWORD: (id: number) => `/users/${id}/password`,
    CHANGE_ROLE: (id: number) => `/users/${id}/role`,
    ASSIGN_LAB_TYPES: (userId: number) => `/users/${userId}/lab-types`,
    ROLES: "/users/roles/list"
  },
} as const;
