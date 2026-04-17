// CrowdFlow — Firebase Client Initialization
// Refactored for build-time safety & Runtime Configuration Injection

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getClientConfig } from './runtime-config';

// Read configuration from either window (runtime) or process.env (fallback)
const firebaseConfig = getClientConfig();

/**
 * Build-safe Firebase initialization.
 * Prevents crashes during Next.js static generation if API keys are missing.
 */
function getClientApp(): FirebaseApp | null {
  // If we're on the server and missing an API key, don't try to initialize.
  // This satisfies the Next.js build worker.
  if (!firebaseConfig.apiKey) {
    if (typeof window !== 'undefined') {
      console.warn('Firebase API key is missing. Ensure variables are set in Cloud Run.');
    }
    return null; 
  }

  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

const app = getClientApp();

// Guarded exports for services. 
// These will throw if accessed at runtime without a valid app, but won't crash the build loader.
export const auth: Auth = app ? getAuth(app) : ({} as Auth);
export const db: Firestore = app ? getFirestore(app) : ({} as Firestore);
export { app };

// Lazy-loaded to avoid SSR issues
export async function getMessagingInstance() {
  if (typeof window === 'undefined' || !app) return null;
  try {
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

export async function getAnalyticsInstance() {
  if (typeof window === 'undefined' || !app) return null;
  try {
    const { getAnalytics } = await import('firebase/analytics');
    return getAnalytics(app);
  } catch {
    return null;
  }
}

// Request FCM permission and return token
export async function requestNotificationToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !app) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    const messaging = await getMessagingInstance();
    if (!messaging) return null;
    const { getToken } = await import('firebase/messaging');
    const vapidKey = firebaseConfig.vapidKey;
    return await getToken(messaging, { vapidKey, serviceWorkerRegistration: undefined });
  } catch {
    return null;
  }
}
