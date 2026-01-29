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
  },

  // Sample Types
  SAMPLE_TYPES: {
    LIST: "/sample-types",
  },

  // Indicators
  INDICATORS: {
    BY_SAMPLE_TYPE: (sampleTypeId: number) =>
      `/sample/indicators/${sampleTypeId}`,
    LIST: "/indicators",
    CREATE: "/indicators/create",
  },

  // Locations
  LOCATIONS: {
    BY_SAMPLE_TYPE: (sampleTypeId: number) =>
      `/locations?sample_type_id=${sampleTypeId}`,
    SAMPLES: (packageId: number) => `/locations/samples/${packageId}`,
  },
} as const;
