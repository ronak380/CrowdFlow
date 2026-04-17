// CrowdFlow — Firebase Admin SDK (Server-Side Only)
// Refactored with Lazy Initialization (via Proxies) to prevent build-time failures

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

/**
 * Lazy-initializes the Firebase Admin App only when needed.
 * This avoids errors during the Next.js build phase when environment variables are missing.
 */
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    // This will be triggered during "Collecting page data" if not marked as dynamic.
    // We throw a descriptive error that will only be hit if someone tries to use 
    // the DB during the build phase.
    throw new Error('Firebase Admin secrets are not available in the current environment.');
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

/**
 * Proxies allow us to use 'adminDb' as a constant while only
 * initializing the SDK when a property (like .collection) is accessed.
 */
export const adminDb = new Proxy({} as any, {
  get(_, prop) {
    const db = getFirestore(getAdminApp());
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  }
});

export const adminAuth = new Proxy({} as any, {
  get(_, prop) {
    const auth = getAuth(getAdminApp());
    const val = (auth as any)[prop];
    return typeof val === 'function' ? val.bind(auth) : val;
  }
});

export const adminMessaging = new Proxy({} as any, {
  get(_, prop) {
    const messaging = getMessaging(getAdminApp());
    const val = (messaging as any)[prop];
    return typeof val === 'function' ? val.bind(messaging) : val;
  }
});
