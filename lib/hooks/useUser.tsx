"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
  lab_types: { id: number; type_name: string; standard: string }[];
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

/**
 * Read the non-httpOnly `user_info` cookie set by the backend.
 * Returns parsed User or null if missing/invalid.
 */
function readUserCookie(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_info="));
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  // IMPORTANT:
  // Start with null so SSR and the first client render match.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    // 1) Cookie first (fast, no network)
    const cookieUser = readUserCookie();
    if (cookieUser) {
      setUser(cookieUser);
      setLoading(false);
      return;
    }

    // 2) Fallback to /auth/me if cookie missing
    try {
      const data = await api.get<User>(ENDPOINTS.AUTH.ME, {
        skipAuthRedirect: true,
      });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user once after mount (prevents hydration mismatch)
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
