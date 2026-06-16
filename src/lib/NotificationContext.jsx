import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    const all = await base44.entities.Notification.list('-created_date', 50);
    // Filter by role
    const role = user.role || 'viewer';
    const visible = all.filter(n =>
      !n.target_roles?.length || n.target_roles.includes(role)
    );
    setNotifications(visible);
    setUnreadCount(visible.filter(n => !n.is_read).length);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    // Subscribe to real-time changes
    const unsub = base44.entities.Notification.subscribe(() => {
      fetchNotifications();
    });
    return unsub;
  }, [isAuthenticated, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    fetchNotifications();
  }, [notifications, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback(async (data) => {
    await base44.entities.Notification.create(data);
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, addNotification, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}