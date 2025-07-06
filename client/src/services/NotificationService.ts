import axios from 'axios';

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    types: {
      voiceProcessingComplete: boolean;
      newMessageReceived: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
      accountActivity: boolean;
    };
  };
  push: {
    enabled: boolean;
    browser: boolean;
    mobile: boolean;
    types: {
      voiceProcessingComplete: boolean;
      newMessageReceived: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
      accountActivity: boolean;
    };
  };
  desktop: {
    enabled: boolean;
    types: {
      voiceProcessingComplete: boolean;
      newMessageReceived: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
      accountActivity: boolean;
    };
  };
}

export interface NotificationMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private webPushSubscription: PushSubscription | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initializeNotifications(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.registerServiceWorker();
      }
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/notification-worker.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      });
      this.webPushSubscription = subscription;
      await this.updatePushSubscription(subscription);
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  }

  async updatePushSubscription(subscription: PushSubscription): Promise<void> {
    try {
      await axios.post('/api/notifications/subscribe', {
        subscription,
      });
    } catch (error) {
      console.error('Failed to update push subscription:', error);
    }
  }

  async getUserPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await axios.get('/api/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await axios.put('/api/notifications/preferences', preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  async sendTestNotification(type: 'email' | 'push' | 'desktop'): Promise<void> {
    try {
      await axios.post('/api/notifications/test', { type });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  async getNotificationHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: NotificationMessage[]; total: number }> {
    try {
      const response = await axios.get('/api/notifications/history', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await axios.delete('/api/notifications/clear');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      throw error;
    }
  }

  // Desktop notification helper
  async showDesktopNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}

export default NotificationService; 