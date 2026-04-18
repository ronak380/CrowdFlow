// CrowdFlow — Runtime Configuration Injection
// This handles the 'Next.js Build-Time Inlining' problem in Cloud Run.
// All keys are read from the server-side environment at runtime and passed to the client.

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  vapidKey?:          string;
  mapsApiKey?:        string;
  gaMeasurementId?:   string;
  gtmId?:             string;
}

/**
 * Gets the Firebase configuration from the server-side environment.
 * These variables should be set in the Google Cloud Run console.
 */
export function getFirebaseRuntimeConfig(): FirebaseConfig {
  return {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain:        (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId:         (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '').trim(),
    storageBucket:     (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId:             (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '').trim(),
    measurementId:     (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || '').trim(),
    vapidKey:          (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || process.env.FIREBASE_VAPID_KEY || '').trim(),
    mapsApiKey:        (process.env.NEXT_PUBLIC_MAPS_API_KEY || process.env.MAPS_API_KEY || '').trim(),
    gaMeasurementId:   (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || '').trim(),
    gtmId:             (process.env.NEXT_PUBLIC_GTM_ID || 'GTM-NWX352C6').trim(),
  };
}

/**
 * Client-side helper to get the config from either the window object 
 * (injected by layout.tsx) or process.env (fallback for local development).
 */
export function getClientConfig(): FirebaseConfig {
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) {
    return (window as any).__FIREBASE_CONFIG__;
  }
  
  return {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    vapidKey:          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    mapsApiKey:        process.env.NEXT_PUBLIC_MAPS_API_KEY,
    gaMeasurementId:   process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };
}
