import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { seedQueues } from '@/lib/queue';

export async function POST(req: NextRequest) {
  // Verify admin token
  const token = req.headers.get('Authorization')?.slice(7);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    if (userSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  await seedQueues();
  return NextResponse.json({ success: true, message: 'Queues seeded successfully' });
}
