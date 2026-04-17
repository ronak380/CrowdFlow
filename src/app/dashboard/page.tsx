'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSlot, useQueue, estimatedWaitMins } from '@/hooks/useQueue';
import { QUEUE_GATES } from '@/lib/queue-constants';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const { slot } = useSlot(profile?.activeSlotId ?? null);
  const queue = useQueue(slot?.queueId ?? null);
  const waitMins = estimatedWaitMins(slot ?? null, queue);

  useEffect(() => {
    if (!loading && !profile) router.replace('/login');
  }, [profile, loading, router]);

  if (loading || !profile) {
    return (
      <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner spinner-lg" aria-label="Loading" />
      </main>
    );
  }

  const firstName = profile.name.split(' ')[0];
  const hasActiveSlot = !!profile.activeSlotId && slot && slot.status === 'waiting';

  return (
    <main className="page grid-bg">
      <div className="orb orb-blue" style={{ width: 400, height: 400, top: -100, right: -100 }} aria-hidden />

      <nav className="navbar">
        <Link href="/dashboard" className="navbar-logo">⚡ CrowdFlow</Link>
        <div className="navbar-actions">
          {profile.role === 'admin' && (
            <Link href="/admin" className="btn btn-ghost btn-sm">🛡 Admin</Link>
          )}
          <Link href="/queue" className="btn btn-ghost btn-sm">📍 Queue</Link>
        </div>
      </nav>

      <div style={{ flex: 1, padding: '32px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>

          <div style={{ marginBottom: 28 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>
              Hey, {firstName}! 👋
            </h1>
          </div>

          {hasActiveSlot && slot && queue ? (
            <div className="card card-pad anim-slide-up" style={{ marginBottom: 20, borderColor: 'rgba(79,159,255,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span className={`badge badge-waiting`}>● Waiting</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
                    {QUEUE_GATES[slot.queueId] ?? slot.queueId}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YOUR NUMBER</div>
                  <div className="queue-number queue-number-electric" style={{ fontSize: 'clamp(2.5rem,12vw,4rem)', lineHeight: 1 }} aria-label={`Your queue number is ${slot.number}`}>
                    #{slot.number}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 16 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Now serving</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--neon)' }}>
                  #{queue.currentServing}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span>{Math.min(queue.currentServing, slot.number)}/{slot.number}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (queue.currentServing / slot.number) * 100)}%` }} />
                </div>
              </div>

              {waitMins !== null && (
                <div className="alert alert-info" style={{ margin: 0, textAlign: 'center' }}>
                  ⏱ Estimated wait: <strong>~{waitMins} minutes</strong>
                </div>
              )}

              <Link href="/queue" className="btn btn-primary btn-full" style={{ marginTop: 16 }} id="btn-view-live-queue">
                📍 View Live Queue →
              </Link>
            </div>
          ) : slot?.status === 'missed' ? (
            <div className="card card-pad anim-slide-up" style={{ marginBottom: 20, borderColor: 'rgba(255,71,87,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>😔</div>
              <h2 style={{ fontWeight: 700, marginBottom: 8 }}>You missed your slot</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                Your slot expired. Don't worry — you can rejoin the queue right now.
              </p>
              <Link href="/missed" className="btn btn-amber btn-full" id="btn-rejoin-queue">Rejoin Queue →</Link>
            </div>
          ) : (
            <div className="card card-pad anim-slide-up" style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>🏏</div>
              <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Ready to check in?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
                Get within 300m of Wankhede Stadium to activate your check-in and get your queue number.
              </p>
              <Link href="/checkin" className="btn btn-success btn-full" id="btn-go-checkin">
                📍 Check In Now →
              </Link>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 12 }}>
                Wankhede Stadium, Churchgate, Mumbai
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card card-pad-sm" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--electric)' }}>{profile.ticketId}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>TICKET ID</div>
            </div>
            <div className="card card-pad-sm" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: profile.role === 'admin' ? 'var(--amber)' : 'var(--neon)' }}>
                {profile.role === 'admin' ? '🛡 Admin' : '🎫 Attendee'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>ACCOUNT TYPE</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
