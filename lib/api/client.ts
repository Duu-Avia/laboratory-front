import { env } from "@/lib/config/env";

/**
 * API Error class for handling API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Get authentication token from localStorage
 */
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * Get default headers for API requests
 */
const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
};

/**
 * Base fetch wrapper with authentication and error handling
 */
async function baseFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers),
  });

  // Handle unauthorized - redirect to login
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }

  return data as T;
}

/**
 * API client with typed methods
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    baseFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    baseFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Fetch blob (for file downloads like Excel, PDF)
 */
export async function fetchBlob(endpoint: string): Promise<Blob> {
  const url = `${env.apiUrl}${endpoint}`;
  const token = getToken();

  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.blob();
}
