// CrowdFlow — Queue Assignment Engine (Server-Side)
// Uses Firestore transactions to guarantee atomic, race-condition-free assignment

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, adminMessaging } from './firebase-admin';

export const QUEUE_GATES: Record<string, string> = {
  Q1: 'Gate A — North Stand',
  Q2: 'Gate B — South Stand',
  Q3: 'Gate C — East Stand',
  Q4: 'Gate D — West Stand',
  Q5: 'Gate E — VIP Entrance',
};

export const QUEUE_IDS = Object.keys(QUEUE_GATES);
export const QUEUE_CAPACITY = 50;
export const MISSED_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface AssignResult {
  success: boolean;
  queueId?: string;
  gate?: string;
  number?: number;
  slotId?: string;
  error?: 'already_checked_in' | 'all_queues_full' | 'user_not_found' | 'transaction_failed';
}

/**
 * Atomically assign the user to the shortest available queue.
 * Runs inside a Firestore transaction — safe for concurrent check-ins.
 */
export async function assignQueue(userId: string): Promise<AssignResult> {
  const usersRef = adminDb.collection('users');
  const queuesRef = adminDb.collection('queues');
  const slotsRef = adminDb.collection('slots');

  try {
    return await adminDb.runTransaction(async (tx) => {
      // 1. Validate user exists and has no active slot
      const userSnap = await tx.get(usersRef.doc(userId));
      if (!userSnap.exists) return { success: false, error: 'user_not_found' };
      const userData = userSnap.data()!;
      if (userData.activeSlotId) return { success: false, error: 'already_checked_in' };

      // 2. Read all queues to find the one with fewest active members
      const queueSnaps = await Promise.all(
        QUEUE_IDS.map((id) => tx.get(queuesRef.doc(id)))
      );

      let bestQueueSnap: FirebaseFirestore.DocumentSnapshot | null = null;
      let minActive = Infinity;

      for (const snap of queueSnaps) {
        if (!snap.exists) continue;
        const data = snap.data()!;
        const active: number = data.activeCount ?? 0;
        if (active < QUEUE_CAPACITY && active < minActive) {
          minActive = active;
          bestQueueSnap = snap;
        }
      }

      if (!bestQueueSnap) return { success: false, error: 'all_queues_full' };

      const queueData = bestQueueSnap.data()!;
      const newNumber: number = (queueData.lastAssigned ?? 0) + 1;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + MISSED_TIMEOUT_MS);

      // 3. Create the slot document
      const slotRef = slotsRef.doc(); // auto-ID
      tx.set(slotRef, {
        userId,
        queueId: bestQueueSnap.id,
        number: newNumber,
        status: 'waiting',
        assignedAt: now,
        expiresAt,
        missedAt: null,
        fcmToken: userData.fcmToken ?? null,
      });

      // 4. Atomically update queue counters
      tx.update(queuesRef.doc(bestQueueSnap.id), {
        lastAssigned: newNumber,
        activeCount: FieldValue.increment(1),
      });

      // 5. Link slot to user
      tx.update(usersRef.doc(userId), { activeSlotId: slotRef.id });

      return {
        success: true,
        queueId: bestQueueSnap.id,
        gate: QUEUE_GATES[bestQueueSnap.id],
        number: newNumber,
        slotId: slotRef.id,
      };
    });
  } catch (err) {
    console.error('[Queue] Transaction failed:', err);
    return { success: false, error: 'transaction_failed' };
  }
}

/**
 * Advance the "currentServing" number for a given queue.
 * Marks the current slot as completed, notifies next user via FCM.
 */
export async function advanceQueue(
  queueId: string
): Promise<{ success: boolean; newServing?: number }> {
  const queuesRef = adminDb.collection('queues');
  const slotsRef = adminDb.collection('slots');

  try {
    return await adminDb.runTransaction(async (tx) => {
      const qSnap = await tx.get(queuesRef.doc(queueId));
      if (!qSnap.exists) return { success: false };

      const qData = qSnap.data()!;
      const prevServing: number = qData.currentServing ?? 0;
      const newServing = prevServing + 1;

      // Mark current slot as completed
      const completedQuery = await slotsRef
        .where('queueId', '==', queueId)
        .where('number', '==', prevServing)
        .where('status', '==', 'waiting')
        .limit(1)
        .get();

      if (!completedQuery.empty) {
        tx.update(completedQuery.docs[0].ref, { status: 'completed' });
        tx.update(queuesRef.doc(queueId), {
          currentServing: newServing,
          activeCount: FieldValue.increment(-1),
        });
      } else {
        tx.update(queuesRef.doc(queueId), { currentServing: newServing });
      }

      return { success: true, newServing };
    });
  } catch (err) {
    console.error('[Queue] Advance failed:', err);
    return { success: false };
  }
}

/**
 * Send FCM push notification to a specific token.
 * Fails silently — notification is non-critical.
 */
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  if (!fcmToken) return;
  try {
    await adminMessaging.send({
      token: fcmToken,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
  } catch (err) {
    console.warn('[FCM] Notification send failed (non-critical):', err);
  }
}

/**
 * Mark all expired waiting slots as "missed" and free their queue capacity.
 * Called by the /api/missed cron route every 2 minutes via Cloud Scheduler.
 */
export async function processMissedSlots(): Promise<{ processed: number }> {
  const now = new Date();
  const slotsRef = adminDb.collection('slots');
  const usersRef = adminDb.collection('users');
  const queuesRef = adminDb.collection('queues');

  const expiredSnap = await slotsRef
    .where('status', '==', 'waiting')
    .where('expiresAt', '<=', now)
    .limit(50) // process in batches to stay within transaction limits
    .get();

  if (expiredSnap.empty) return { processed: 0 };

  const batch = adminDb.batch();
  const queueDecrements: Record<string, number> = {};

  for (const slotDoc of expiredSnap.docs) {
    const data = slotDoc.data();
    batch.update(slotDoc.ref, { status: 'missed', missedAt: now });
    batch.update(usersRef.doc(data.userId), { activeSlotId: null });
    queueDecrements[data.queueId] = (queueDecrements[data.queueId] ?? 0) + 1;
  }

  for (const [queueId, count] of Object.entries(queueDecrements)) {
    batch.update(queuesRef.doc(queueId), {
      activeCount: FieldValue.increment(-count),
    });
  }

  await batch.commit();

  // Send FCM notifications (non-blocking)
  for (const slotDoc of expiredSnap.docs) {
    const data = slotDoc.data();
    if (data.fcmToken) {
      sendPushNotification(
        data.fcmToken,
        '⏰ You missed your slot!',
        'Tap to rejoin the queue for Wankhede Stadium.',
        { action: 'rejoin' }
      );
    }
  }

  return { processed: expiredSnap.size };
}

/**
 * Seed the 5 queue documents if they don't already exist.
 * Safe to call multiple times — only creates missing queues.
 */
export async function seedQueues(): Promise<void> {
  const queuesRef = adminDb.collection('queues');
  const batch = adminDb.batch();
  let created = 0;

  for (const [id, gate] of Object.entries(QUEUE_GATES)) {
    const snap = await queuesRef.doc(id).get();
    if (!snap.exists) {
      batch.set(queuesRef.doc(id), {
        gate,
        currentServing: 0,
        lastAssigned: 0,
        activeCount: 0,
        capacity: QUEUE_CAPACITY,
        createdAt: new Date(),
      });
      created++;
    }
  }

  if (created > 0) await batch.commit();
  console.log(`[Seed] Created ${created} queue(s).`);
}
