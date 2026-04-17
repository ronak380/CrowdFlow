// CrowdFlow — Firebase Admin SDK (Server-Side Only)
// Refactored for maximum type safety and lazy initialization to fix build errors.

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

/**
 * Lazy-initializes the Firebase Admin App only when needed.
 * This avoids errors during the Next.js build phase when environment variables are missing.
 */
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // During Next.js build (static analysis), these vars are missing.
    // We throw only if accessed at runtime.
    throw new Error('Firebase Admin secrets are not available in the current environment.');
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

/**
 * Type-safe getters for Firebase services.
 * Using functions instead of Proxies ensures the TypeScript compiler (tsc) 
 * can correctly trace types during the production build.
 */
export const getAdminDb = (): Firestore => getFirestore(getAdminApp());
export const getAdminAuth = (): Auth => getAuth(getAdminApp());
export const getAdminMessaging = (): Messaging => getMessaging(getAdminApp());
