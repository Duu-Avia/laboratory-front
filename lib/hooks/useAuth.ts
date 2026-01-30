"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export interface TokenPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
  iat: number;
  exp: number;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Authentication hook
 * Provides login, logout, and auth state management
 */
export function useAuth() {
  const router = useRouter();

  const logout = useCallback(() => {
    // Clear token from cookie and localStorage
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getToken();
  }, [getToken]);

  const getUser = useCallback((): TokenPayload | null => {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
  }, [getToken]);

  return {
    logout,
    getToken,
    isAuthenticated,
    getUser,
  };
}
