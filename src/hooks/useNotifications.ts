import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notifications';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  type: 'request' | 'approval' | 'system';
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    const initialNotifications = notificationService.getNotifications(userId);
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.isRead).length);

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      if (notification.userId === userId) {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    return unsubscribe;
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) {
        notificationService.markAsRead(n.id);
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};