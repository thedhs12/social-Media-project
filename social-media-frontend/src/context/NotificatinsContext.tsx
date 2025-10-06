import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAPI } from '../api/api';

interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_REQUEST';
  fromUser: { username: string };
  post?: { id: string; title?: string };
  isRead: boolean;
  createdAt: string;
  followRequestId?: string;
  requestStatus?: 'ACCEPTED' | 'REJECTED';
}

interface NotificationsContextProps {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  reload: () => void;
}

const NotificationsContext = createContext<NotificationsContextProps>({
  notifications: [],
  markAsRead: () => {},
  reload: () => {},
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchAPI<{ notifications: Notification[] }>('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, markAsRead, reload: loadNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
