import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const varsToCheck = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'CRON_SECRET',
    'GEMINI_API_KEY',
    'MAPS_API_KEY',
    'NEXT_PUBLIC_MAPS_API_KEY',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'GA_MEASUREMENT_ID'
  ];

  const results: Record<string, string> = {};

  varsToCheck.forEach(v => {
    const val = process.env[v];
    if (!val) {
      results[v] = '❌ MISSING';
    } else if (val.trim() === '') {
      results[v] = '⚠️ EMPTY STRING';
    } else {
      // Just for debugging Private Key specifically as it often has \n issues
      if (v === 'FIREBASE_PRIVATE_KEY') {
        results[v] = `✅ PRESENT (Length: ${val.length}, Has Newlines: ${val.includes('\n')})`;
      } else {
        results[v] = `✅ PRESENT (Length: ${val.length})`;
      }
    }
  });

  return NextResponse.json({
    status: 'Cloud Run Diagnostic Report',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: results
  });
}
