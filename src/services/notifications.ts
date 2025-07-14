// Notification service for managing in-app notifications and SMS
import { smsService } from './sms';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  type: 'request' | 'approval' | 'system';
}

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'request' | 'approval' | 'system';
}

class NotificationService {
  private notifications: Notification[] = [];
  private subscribers: ((notification: Notification) => void)[] = [];

  /**
   * Create a new notification
   */
  async createNotification(payload: NotificationPayload): Promise<Notification> {
    const notification: Notification = {
      id: Date.now().toString(),
      userId: payload.userId,
      title: payload.title,
      body: payload.body,
      isRead: false,
      createdAt: new Date(),
      type: payload.type,
    };

    this.notifications.push(notification);
    
    // Notify subscribers (for real-time updates)
    this.subscribers.forEach(callback => callback(notification));

    // In a real app, this would save to database
    console.log('Notification created:', notification);
    
    return notification;
  }

  /**
   * Handle new request submission
   */
  async handleNewRequest(
    employeeName: string,
    requestType: string,
    managerMobile: string,
    managerId: string
  ): Promise<void> {
    // Create in-app notification
    await this.createNotification({
      userId: managerId,
      title: 'درخواست جدید',
      body: `${employeeName} درخواست ${requestType} ارسال کرده است`,
      type: 'request',
    });

    // Send SMS notification
    try {
      await smsService.sendNewRequestNotification(managerMobile, employeeName, requestType);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Handle request approval/rejection
   */
  async handleRequestStatusChange(
    employeeName: string,
    requestType: string,
    status: 'approved' | 'rejected',
    employeeMobile: string,
    employeeId: string
  ): Promise<void> {
    // Create in-app notification
    await this.createNotification({
      userId: employeeId,
      title: status === 'approved' ? 'درخواست تایید شد' : 'درخواست رد شد',
      body: `درخواست ${requestType} شما ${status === 'approved' ? 'تایید' : 'رد'} شد`,
      type: 'approval',
    });

    // Send SMS notification
    try {
      await smsService.sendRequestStatusNotification(employeeMobile, employeeName, status);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Subscribe to new notifications
   */
  subscribe(callback: (notification: Notification) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get notifications for a user
   */
  getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;