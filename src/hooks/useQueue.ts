'use client';
// CrowdFlow — Queue & Slot Real-Time Hooks
// Uses Firestore onSnapshot listeners (not polling) for live updates

import { useEffect, useState } from 'react';
import { doc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { QueueDoc, SlotDoc } from '@/lib/firestore';

/** Subscribe to a single queue document in real time */
export function useQueue(queueId: string | null) {
  const [queue, setQueue] = useState<QueueDoc | null>(null);

  useEffect(() => {
    if (!queueId) { setQueue(null); return; }
    return onSnapshot(doc(db, 'queues', queueId), (snap) => {
      setQueue(snap.exists() ? ({ id: snap.id, ...snap.data() } as QueueDoc) : null);
    });
  }, [queueId]);

  return queue;
}

/** Subscribe to a single slot document in real time */
export function useSlot(slotId: string | null) {
  const [slot, setSlot] = useState<SlotDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slotId) { setSlot(null); setLoading(false); return; }
    return onSnapshot(doc(db, 'slots', slotId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setSlot({
          id: snap.id,
          ...d,
          assignedAt: d.assignedAt?.toDate?.() ?? new Date(),
          expiresAt: d.expiresAt?.toDate?.() ?? new Date(),
          missedAt: d.missedAt?.toDate?.() ?? null,
        } as SlotDoc);
      } else {
        setSlot(null);
      }
      setLoading(false);
    });
  }, [slotId]);

  return { slot, loading };
}

/** Subscribe to all 5 queues — for admin panel and dashboard summary */
export function useAllQueues() {
  const [queues, setQueues] = useState<QueueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = query(collection(db, 'queues'), orderBy('__name__'));
    return onSnapshot(ref, (snap) => {
      setQueues(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueueDoc)));
      setLoading(false);
    });
  }, []);

  return { queues, loading };
}

/** Calculate estimated minutes to be served (rough: 2 min per person ahead) */
export function estimatedWaitMins(
  slot: SlotDoc | null,
  queue: QueueDoc | null
): number | null {
  if (!slot || !queue) return null;
  const ahead = Math.max(0, slot.number - queue.currentServing - 1);
  return ahead * 2; // 2 min avg per person
}
