import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { seedQueues } from '@/lib/queue';

export const dynamic = 'force-dynamic';

/**
 * TEMPORARY BOOTSTRAP ROUTE
 * Use this to initialize the database and promote the first user to admin.
 * URL: /api/bootstrap?email=your-email@example.com
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ 
      error: 'Please provide an email parameter: /api/bootstrap?email=your@email.com' 
    }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    // 1. Seed the queues (Gates 1-5)
    await seedQueues();

    // 2. Find the user by email and promote to admin
    const userQuery = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    
    if (userQuery.empty) {
      return NextResponse.json({ 
        status: 'Queues seeded ✅',
        message: `User with email ${email} not found. Please Register first, then refresh this page.`
      });
    }

    const userDoc = userQuery.docs[0];
    await userDoc.ref.update({ role: 'admin' });

    return NextResponse.json({ 
      status: 'Success! 🚀',
      message: `Queues seeded and user ${email} promoted to admin. You can now login and visit the /admin dashboard.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
