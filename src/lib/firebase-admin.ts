// CrowdFlow — Firebase Admin SDK (Server-Side Only)
// Used exclusively in Next.js API routes — never imported client-side

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

let adminApp: App;

function initAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

adminApp = initAdmin();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminMessaging = getMessaging(adminApp);
export { adminApp };
