"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Notification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notifications";

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  markingAsRead: Set<string>;
  markingAllAsRead: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useNotifications(initialLimit: number = 10): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());
  const [markingAllAsRead, setMarkingAllAsRead] = useState<boolean>(false);

  // Prevent race conditions
  const fetchIdRef = useRef<number>(0);

  const fetchNotifications = useCallback(async (reset: boolean = true) => {
    const fetchId = ++fetchIdRef.current;

    if (reset) {
      setLoading(true);
      setError(null);
    }

    try {
      const currentPage = reset ? 1 : page;
      const data = await getNotifications(currentPage, initialLimit);

      // Check if this is still the latest request
      if (fetchId !== fetchIdRef.current) return;

      if (reset) {
        setNotifications(data.data);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...data.data]);
      }
      setTotal(data.meta.total);
    } catch (err: unknown) {
      if (fetchId !== fetchIdRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to load notifications";
      setError(message);
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, initialLimit]);

  const loadMore = useCallback(async () => {
    if (loading || notifications.length >= total) return;

    const nextPage = page + 1;
    setPage(nextPage);

    try {
      const data = await getNotifications(nextPage, initialLimit);
      setNotifications((prev) => [...prev, ...data.data]);
      setTotal(data.meta.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load more notifications";
      setError(message);
    }
  }, [loading, notifications.length, total, page, initialLimit]);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setMarkingAsRead((prev) => new Set(prev).add(notificationId));

    try {
      await markNotificationAsRead(notificationId);
    } catch (err: unknown) {
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: false } : n
        )
      );
      const message = err instanceof Error ? err.message : "Failed to mark as read";
      setError(message);
    } finally {
      setMarkingAsRead((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAllAsRead(true);

    try {
      await markAllNotificationsAsRead();
    } catch (err: unknown) {
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      const message = err instanceof Error ? err.message : "Failed to mark all as read";
      setError(message);
    } finally {
      setMarkingAllAsRead(false);
    }
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasMore = notifications.length < total;

  return {
    notifications,
    unreadCount,
    total,
    loading,
    error,
    markingAsRead,
    markingAllAsRead,
    refresh: () => fetchNotifications(true),
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
  };
}
