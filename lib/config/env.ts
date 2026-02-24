/**
 * Environment configuration
 * Centralizes all environment variables with type safety
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  appBasePath: process.env.NEXT_PUBLIC_APP_BASE_PATH || "",
  environment: process.env.NEXT_PUBLIC_ENV || "development",
  isDev: process.env.NEXT_PUBLIC_ENV === "development",
  isProd: process.env.NEXT_PUBLIC_ENV === "production",
} as const;
