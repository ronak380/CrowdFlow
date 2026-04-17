'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSlot, useQueue, estimatedWaitMins } from '@/hooks/useQueue';
import { QUEUE_GATES } from '@/lib/queue-constants';

const GATE_COLORS: Record<string, string> = {
  Q1: '#4f9fff', Q2: '#00f5a0', Q3: '#ffb800', Q4: '#ff6b9d', Q5: '#c084fc',
};

export default function QueuePage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { slot, loading: slotLoading } = useSlot(profile?.activeSlotId ?? null);
  const queue = useQueue(slot?.queueId ?? null);
  const prevNumRef = useRef<number | null>(null);
  const waitMins = estimatedWaitMins(slot ?? null, queue);

  useEffect(() => {
    if (!authLoading && !profile) router.replace('/login');
    if (!authLoading && profile && !profile.activeSlotId) router.replace('/checkin');
  }, [profile, authLoading, router]);

  // Animate number when queue advances
  useEffect(() => {
    if (queue?.currentServing && prevNumRef.current !== queue.currentServing) {
      prevNumRef.current = queue.currentServing;
      const el = document.getElementById('live-serving-number');
      if (el) {
        el.classList.remove('anim-pop');
        void el.offsetWidth; // reflow
        el.classList.add('anim-pop');
      }
    }
  }, [queue?.currentServing]);

  if (authLoading || slotLoading) {
    return <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner spinner-lg" aria-label="Loading" /></main>;
  }

  if (!slot) return null;

  const isCompleted = slot.status === 'completed';
  const isMissed    = slot.status === 'missed';
  const gateColor   = QUEUE_GATES[slot.queueId] ? GATE_COLORS[slot.queueId] : 'var(--electric)';
  const aheadCount  = queue ? Math.max(0, slot.number - (queue.currentServing ?? 0) - 1) : '—';
  const progress    = queue
    ? Math.min(100, Math.round(((queue.currentServing ?? 0) / slot.number) * 100))
    : 0;

  return (
    <main className="page grid-bg safe-bottom">
      <div className="orb orb-blue"  style={{ width: 500, height: 500, top: -150, left: '50%', transform: 'translateX(-50%)' }} aria-hidden />

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/dashboard" className="navbar-logo">⚡ CrowdFlow</Link>
        <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
      </nav>

      <div style={{ flex: 1, padding: '28px 20px 60px', position: 'relative', zIndex: 1 }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>

          {/* Gate badge */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${gateColor}18`, border: `1px solid ${gateColor}40`, borderRadius: 'var(--r-full)', padding: '8px 20px', fontSize: '0.88rem', fontWeight: 600, color: gateColor }}>
              🚪 {QUEUE_GATES[slot.queueId] ?? slot.queueId}
            </div>
          </div>

          {/* ── Status: Completed ── */}
          {isCompleted && (
            <div className="card card-pad anim-slide-up" style={{ textAlign: 'center', borderColor: 'rgba(0,245,160,0.35)', marginBottom: 20 }}>
              <div style={{ fontSize: '4rem', marginBottom: 12 }}>🎊</div>
              <div className="badge badge-completed" style={{ marginBottom: 16 }}>Entry Complete</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Enjoy the match!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>You've been checked in successfully. Have a great time!</p>
            </div>
          )}

          {/* ── Status: Missed ── */}
          {isMissed && (
            <div className="card card-pad anim-slide-up" style={{ textAlign: 'center', borderColor: 'rgba(255,71,87,0.35)', marginBottom: 20 }}>
              <div style={{ fontSize: '4rem', marginBottom: 12 }}>⏰</div>
              <div className="badge badge-missed" style={{ marginBottom: 16 }}>Slot Missed</div>
              <h2 style={{ fontWeight: 700, marginBottom: 8 }}>You missed your slot</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Your 10-minute window expired. Rejoin to get a new number.</p>
              <Link href="/missed" className="btn btn-amber btn-full" id="btn-rejoin-from-queue">Rejoin Queue →</Link>
            </div>
          )}

          {/* ── Status: Waiting (main view) ── */}
          {!isCompleted && !isMissed && (
            <>
              {/* Now serving */}
              <div className="card card-pad" style={{ marginBottom: 16, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Now Serving at {QUEUE_GATES[slot.queueId]?.split('—')[0].trim()}
                </p>
                <div id="live-serving-number" className="queue-number queue-number-neon" aria-live="polite" aria-label={`Now serving number ${queue?.currentServing ?? '—'}`}>
                  #{queue?.currentServing ?? '—'}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 8 }}>
                  Updates live • No refresh needed
                </p>
              </div>

              {/* Your number */}
              <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Number</p>
                  <div className="queue-number queue-number-electric" style={{ fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', lineHeight: 1 }} aria-label={`Your queue number is ${slot.number}`}>
                    #{slot.number}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Ahead of you</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: typeof aheadCount === 'number' && aheadCount <= 5 ? 'var(--neon)' : 'var(--text-primary)' }}>
                    {aheadCount}
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>people</span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Entry progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={progress} aria-valuenmin={0} aria-valuenmax={100} />
                </div>
              </div>

              {/* ETA + expires */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="card card-pad-sm" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)' }}>
                    {waitMins !== null ? `~${waitMins}m` : '—'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>EST. WAIT</div>
                </div>
                <div className="card card-pad-sm" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)' }}>
                    {Math.max(0, Math.round((slot.expiresAt.getTime() - Date.now()) / 60000))}m
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>SLOT EXPIRES</div>
                </div>
              </div>

              <div className="alert alert-info" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                🔔 You'll receive a push notification when your turn is near
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
