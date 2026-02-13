"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { env } from "@/lib/config/env";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
} from "@/types/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.get<UnreadCountResponse>(
        ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
      );
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Fetch notification list (backend defaults to 10 latest)
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<NotificationListResponse>(
        ENDPOINTS.NOTIFICATIONS.LIST
      );
      setNotifications(data.notifications ?? []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent fail
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  }, []);

  // SSE connection
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const url = `${env.apiUrl}${ENDPOINTS.NOTIFICATIONS.STREAM}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("notification", (event) => {
      try {
        const newNotification: Notification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
        setUnreadCount((prev) => prev + 1);
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener("unread-count", (event) => {
      try {
        const data = JSON.parse(event.data);
        setUnreadCount(data.unread_count);
      } catch {
        // ignore
      }
    });

    es.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
