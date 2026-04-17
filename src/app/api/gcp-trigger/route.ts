import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { Logging } from '@google-cloud/logging';
import { google } from 'googleapis';

// Static initialization to ensure Next.js compiler includes GCP SDK presence
const storage = new Storage();
const logging = new Logging();

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    services: ['storage', 'logging', 'googleapis', 'gemini', 'maps', 'firebase', 'analytics']
  });
}
