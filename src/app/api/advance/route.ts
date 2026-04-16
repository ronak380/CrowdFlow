import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, adminMessaging } from '@/lib/firebase-admin';
import { advanceQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  // 1. Verify admin token
  const token = req.headers.get('Authorization')?.slice(7);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // 2. Check admin role
  const userSnap = await adminDb.collection('users').doc(userId).get();
  if (userSnap.data()?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 3. Parse body
  let body: { queueId?: string } = {};
  try { body = await req.json(); } catch { /* */ }

  const { queueId } = body;
  if (!queueId) return NextResponse.json({ error: 'missing_queueId' }, { status: 400 });

  // 4. Advance the queue
  const result = await advanceQueue(queueId);
  if (!result.success) {
    return NextResponse.json({ error: 'advance_failed' }, { status: 500 });
  }

  // 5. Notify the next user in line (non-blocking)
  const newServing = result.newServing!;
  notifyNextUser(queueId, newServing).catch(() => {});
  // Also notify user after that (heads-up: "you're next")
  notifyNextUser(queueId, newServing + 1, true).catch(() => {});

  return NextResponse.json({ success: true, newServing });
}

async function notifyNextUser(
  queueId: string,
  number: number,
  headsUp = false
): Promise<void> {
  const snap = await adminDb.collection('slots')
    .where('queueId', '==', queueId)
    .where('number', '==', number)
    .where('status', '==', 'waiting')
    .limit(1)
    .get();

  if (snap.empty) return;
  const slotData = snap.docs[0].data();
  const fcmToken: string | null = slotData.fcmToken ?? null;
  if (!fcmToken) return;

  const title = headsUp ? '⏳ Get Ready!' : '🎫 Your Turn!';
  const body  = headsUp
    ? `You're next in line at Wankhede Stadium. Head to your gate now.`
    : `Number #${number} — Please proceed to your gate immediately!`;

  try {
    await adminMessaging.send({
      token: fcmToken,
      notification: { title, body },
      data: { queueId, number: String(number), action: 'proceed' },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
  } catch {
    // FCM failure is non-critical
  }
}
