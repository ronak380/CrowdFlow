import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getAdminDb();
  const auth = getAdminAuth();
  
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

  try {
    // 3. Reset Queues
    const queues = await db.collection('queues').get();
    const batch = db.batch();
    
    queues.docs.forEach(doc => {
      batch.update(doc.ref, {
        currentServing: 0,
        lastAssigned: 0,
        activeCount: 0
      });
    });

    // 4. Reset Slots (Delete all slots for the demo)
    const slots = await db.collection('slots').get();
    slots.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // 5. Update Users (Clear activeSlotId)
    const usersWithSlots = await db.collection('users').where('activeSlotId', '!=', null).get();
    usersWithSlots.docs.forEach(doc => {
      batch.update(doc.ref, { activeSlotId: null });
    });

    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reset Error:', err);
    return NextResponse.json({ error: 'reset_failed' }, { status: 500 });
  }
}
