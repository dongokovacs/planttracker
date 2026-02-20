import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private permissionGranted = false;

  notifications$ = this.notificationSubject.asObservable();

  constructor() {
    this.checkPermission();
  }

  /**
   * Check if browser notifications are supported and permission granted
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  /**
   * Show a toast notification (in-app)
   */
  showToast(message: string, type: Notification['type'] = 'info', duration: number = 3000): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };
    
    this.notificationSubject.next(notification);
  }

  /**
   * Show success toast
   */
  success(message: string): void {
    this.showToast(message, 'success');
  }

  /**
   * Show error toast
   */
  error(message: string): void {
    this.showToast(message, 'error', 5000);
  }

  /**
   * Show warning toast
   */
  warning(message: string): void {
    this.showToast(message, 'warning', 4000);
  }

  /**
   * Show info toast
   */
  info(message: string): void {
    this.showToast(message, 'info');
  }

  /**
   * Show browser push notification
   */
  showPushNotification(title: string, options?: NotificationOptions): void {
    if (!this.permissionGranted) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (error) {
      console.error('Error showing push notification:', error);
    }
  }

  /**
   * Schedule care task reminder
   */
  scheduleReminder(plantName: string, task: string, dueDate: Date): void {
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();

    // Only schedule if due date is in the future
    if (timeUntilDue > 0) {
      setTimeout(() => {
        this.showPushNotification(
          `🌱 Gondozási feladat: ${plantName}`,
          {
            body: task,
            tag: `plant-reminder-${plantName}`,
            requireInteraction: true
          }
        );
        
        this.showToast(`Gondozási feladat esedékes: ${task} (${plantName})`, 'warning');
      }, timeUntilDue);
    }
  }

  /**
   * Notify about upcoming harvest
   */
  notifyHarvestReady(plantName: string, daysUntil: number): void {
    if (daysUntil <= 7 && daysUntil > 0) {
      this.showToast(
        `🍅 ${plantName} hamarosan szedésre kész! (${daysUntil} nap múlva)`,
        'info'
      );
    } else if (daysUntil === 0) {
      this.showPushNotification(
        `🎉 Szedési idő! - ${plantName}`,
        {
          body: 'A növényed szedésre kész!',
          tag: `harvest-ready-${plantName}`
        }
      );
      
      this.success(`${plantName} most szedésre kész!`);
    }
  }

  /**
   * Generate unique ID for notifications
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return 'Notification' in window ? Notification.permission : 'denied';
  }
}
