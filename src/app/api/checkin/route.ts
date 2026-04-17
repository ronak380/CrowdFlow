import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { assignQueue } from '@/lib/queue';
import { isWithinGeofence } from '@/lib/geofence';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter: 5 check-ins per IP per minute
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateMap.get(ip);
  if (!record || now > record.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 5) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  // 2. Verify Firebase Auth token
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // 3. Parse body
  let body: { lat?: number; lng?: number; rejoin?: boolean } = {};
  try { body = await req.json(); } catch { /* no body */ }

  // 4. Geo-fence validation (skip for rejoin — user is already at venue)
  if (!body.rejoin) {
    const { lat, lng } = body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'missing_coordinates' }, { status: 400 });
    }
    if (!isWithinGeofence(lat, lng)) {
      return NextResponse.json({ error: 'geo_validation_failed' }, { status: 403 });
    }
  }

  // 5. For rejoin: clear previous missed slot first
  if (body.rejoin) {
    try {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      const activeSlotId = userSnap.data()?.activeSlotId;
      if (activeSlotId) {
        const slotSnap = await adminDb.collection('slots').doc(activeSlotId).get();
        const status = slotSnap.data()?.status;
        // Only allow re-assign if previous slot was missed or completed
        if (status === 'waiting') {
          return NextResponse.json({ error: 'already_checked_in' }, { status: 409 });
        }
        // Clear the stale reference
        await adminDb.collection('users').doc(userId).update({ activeSlotId: null });
      }
    } catch {
      // Non-critical — proceed
    }
  }

  // 6. Atomic queue assignment
  const result = await assignQueue(userId);

  if (!result.success) {
    const statusMap: Record<string, number> = {
      already_checked_in: 409,
      all_queues_full:    503,
      user_not_found:     404,
    };
    return NextResponse.json(
      { error: result.error },
      { status: statusMap[result.error ?? ''] ?? 500 }
    );
  }

  return NextResponse.json({
    queueId: result.queueId,
    gate:    result.gate,
    number:  result.number,
    slotId:  result.slotId,
  });
}
