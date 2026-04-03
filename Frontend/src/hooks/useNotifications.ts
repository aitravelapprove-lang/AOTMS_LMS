import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';

export interface Notification {
  id: string;
  type: 'coupon' | 'system' | 'enrollment';
  title: string;
  message: string;
  data?: {
    code?: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/notifications') as Notification[];
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetchWithAuth('/notifications/mark-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      return false;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Assuming individual mark-read exists or we just use mark-read all for now
      // But user said "click cheste ...", so individual is better.
      // Let's check if backend supports it.
      await fetchWithAuth(`/notifications/${id}/mark-read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllAsRead,
    markAsRead
  };
}
