/**
 * ManaMart Hyperlocal Web Push & Offline Background Service Worker
 * Conforms to RFC 8292 VAPID standard & App Badging API
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Service Worker: Listen for Push Even When Website Closed
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'ManaMart Alert',
      body: event.data.text(),
    };
  }

  // Configure rich notification options with high-priority audio & action buttons
  const options = {
    body: payload.body || 'New neighborhood update available.',
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    silent: false,
    tag: payload.orderId || payload.tag || 'manamart-hyperlocal',
    renotify: true,
    requireInteraction: payload.priority === 'HIGH',
    data: {
      orderId: payload.orderId,
      url: payload.click_action || '/orders',
      soundType: payload.soundType || 'order',
    },
    actions: payload.actions || [
      { action: 'view', title: 'Open ManaMart' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title || 'ManaMart Hyperlocal', options),
      // Update App Badging API on OS Taskbar/Dock if supported
      navigator.setAppBadge ? navigator.setAppBadge(payload.unreadCount || 1) : Promise.resolve(),
    ])
  );
});

// 2. Notification Action Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

