// CrowdFlow — Firebase Client Initialization
// Refactored for build-time safety & Production Diagnostics

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getClientConfig } from './runtime-config';

// Read configuration from either window (runtime) or process.env (fallback)
const firebaseConfig = getClientConfig();

/**
 * Build-safe Firebase initialization.
 */
function getClientApp(): FirebaseApp | null {
  // If we're missing an API key, we cannot initialize Firebase.
  if (!firebaseConfig.apiKey) {
    if (typeof window !== 'undefined') {
      console.error('CRITICAL: Firebase API key is missing. Check /api/diagnostics');
    }
    return null; 
  }

  try {
    if (getApps().length > 0) return getApp();
    return initializeApp(firebaseConfig);
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

const app = getClientApp();

/**
 * Robust exports. 
 * If app is null, these services are technically 'undefined'.
 * We export them with type-casting to satisfy the compiler, 
 * but our hooks (like useAuth) must check if app exists.
 */
export const auth: Auth = app ? getAuth(app) : (null as unknown as Auth);
export const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore);
export { app };

export async function getMessagingInstance() {
  if (typeof window === 'undefined' || !app) return null;
  try {
    const { getMessaging, isSupported } = await import('firebase/messaging');
    if (!(await isSupported())) return null;
    return getMessaging(app);
  } catch { return null; }
}

export async function getAnalyticsInstance() {
  if (typeof window === 'undefined' || !app) return null;
  try {
    const { getAnalytics } = await import('firebase/analytics');
    return getAnalytics(app);
  } catch { return null; }
}

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
  } catch { return null; }
}
