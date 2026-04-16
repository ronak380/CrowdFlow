// CrowdFlow — Firebase Cloud Messaging Service Worker
// Replace the placeholder values below with your Firebase project config
// (same values as NEXT_PUBLIC_FIREBASE_* in .env.local)

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'your_api_key',
  authDomain: 'your_project_id.firebaseapp.com',
  projectId: 'your_project_id',
  storageBucket: 'your_project_id.appspot.com',
  messagingSenderId: 'your_sender_id',
  appId: 'your_app_id',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[CrowdFlow SW] Background message received:', payload);
  const { notification, data } = payload;
  const notificationTitle = notification?.title || 'CrowdFlow';
  const notificationOptions = {
    body: notification?.body || 'Your queue update is ready.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'crowdflow-queue',
    renotify: true,
    data: data || {},
    actions: [
      { action: 'view', title: '📍 View Queue' },
    ],
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const url = action === 'view' ? '/queue' : '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
