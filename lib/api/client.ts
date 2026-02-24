import { env } from "@/lib/config/env";
import { ROUTES } from "@/lib/routes";

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
 * Get default headers for API requests
 */
const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  return {
    "Content-Type": "application/json",
    ...customHeaders,
  };
};

interface FetchOptions extends RequestInit {
  /** Skip the automatic redirect to /login on 401 responses */
  skipAuthRedirect?: boolean;
}

/**
 * Base fetch wrapper with authentication and error handling
 */
async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...requestInit } = options;
  const url = `${env.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    ...requestInit,
    credentials: "include",
    headers: getHeaders(requestInit.headers),
  });

  // Handle unauthorized - redirect to login unless caller handles it
  if (response.status === 401) {
    if (!skipAuthRedirect && typeof window !== "undefined") {
      window.location.href = ROUTES.login();
    }
    const data = await response.json().catch(() => null);
    throw new ApiError(401, "Unauthorized", data);
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
  get: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Upload a file via FormData (multipart/form-data)
 * Does NOT set Content-Type header — browser sets it with boundary automatically.
 */
export async function uploadFile<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${env.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = ROUTES.login();
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
 * Fetch blob (for file downloads like Excel, PDF)
 */
export async function fetchBlob(endpoint: string): Promise<Blob> {
  const url = `${env.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.blob();
}
