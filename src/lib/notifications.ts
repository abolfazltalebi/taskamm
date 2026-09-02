/**
 * Notification Manager for Taskame
 * Real platform compliance:
 * - iOS Safari doesn't support Web Push unless added to Home Screen on iOS 16.4+
 * - Android supports standard Push & Notification API
 * - Quiet hours (e.g., 23:00 - 07:00)
 */

export interface NotificationSettings {
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietStartHour: number; // default 23
  quietEndHour: number; // default 7
  morningDigestEnabled: boolean; // default true
  dueReminderEnabled: boolean;
}

const SETTINGS_KEY = 'taskame_notification_settings';

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return {
      enabled: false,
      quietHoursEnabled: true,
      quietStartHour: 23,
      quietEndHour: 7,
      morningDigestEnabled: true,
      dueReminderEnabled: true,
    };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    enabled: false,
    quietHoursEnabled: true,
    quietStartHour: 23,
    quietEndHour: 7,
    morningDigestEnabled: true,
    dueReminderEnabled: true,
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function isQuietHour(settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;
  const currentHour = new Date().getHours();
  if (settings.quietStartHour > settings.quietEndHour) {
    // E.g. 23:00 to 07:00
    return currentHour >= settings.quietStartHour || currentHour < settings.quietEndHour;
  }
  return currentHour >= settings.quietStartHour && currentHour < settings.quietEndHour;
}

export function getPlatformCapabilities() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isStandalone: false, supportsNotification: false, canPush: false };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  const supportsNotification = 'Notification' in window;
  // On iOS, notifications only work if added to home screen (iOS 16.4+)
  const canPush = supportsNotification && (!isIOS || isStandalone);

  return {
    isIOS,
    isStandalone,
    supportsNotification,
    canPush,
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    const settings = getNotificationSettings();
    saveNotificationSettings({ ...settings, enabled: granted });
    return granted;
  } catch {
    return false;
  }
}

export function showAppNotification(title: string, options?: { body?: string; tag?: string }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  const settings = getNotificationSettings();
  if (!settings.enabled) return;
  if (isQuietHour(settings)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options?.body,
        tag: options?.tag,
        icon: '/icon.svg',
        dir: 'rtl',
        lang: 'fa',
      });
    } catch {
      // Notification failed
    }
  }
}
