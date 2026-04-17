import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { seedQueues } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = getAdminAuth();
  const db = getAdminDb();

  // 1. Verify admin token
  const token = req.headers.get('Authorization')?.slice(7);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let userId: string;
  try {
    const decoded = await auth.verifyIdToken(token);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // 2. Check admin role
  const userSnap = await db.collection('users').doc(userId).get();
  if (userSnap.data()?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 3. Run seed
  await seedQueues();

  return NextResponse.json({ success: true, seeded: true });
}
