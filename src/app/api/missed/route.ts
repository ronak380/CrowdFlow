import { NextRequest, NextResponse } from 'next/server';
import { processMissedSlots } from '@/lib/queue';

// Called by:
//   1. Cloud Scheduler every 2 minutes (with CRON_SECRET header)
//   2. Admin panel manually (with 'admin-manual-trigger')
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');

  const isCloudScheduler = secret === process.env.CRON_SECRET;
  const isAdminManual    = secret === 'admin-manual-trigger';

  if (!isCloudScheduler && !isAdminManual) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { processed } = await processMissedSlots();

  return NextResponse.json({ success: true, processed });
}
