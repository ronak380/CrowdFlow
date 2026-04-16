'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useAllQueues } from '@/hooks/useQueue';
import { QUEUE_GATES } from '@/lib/queue';

const GATE_COLORS: Record<string, string> = {
  Q1: '#4f9fff', Q2: '#00f5a0', Q3: '#ffb800', Q4: '#ff6b9d', Q5: '#c084fc',
};

interface ActionState {
  [queueId: string]: 'idle' | 'loading' | 'done';
}

export default function AdminPage() {
  const router = useRouter();
  const { profile, loading, isAdmin } = useAuth();
  const { queues, loading: queuesLoading } = useAllQueues();
  const [actions, setActions] = useState<ActionState>({});
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [missedStatus, setMissedStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [missedCount, setMissedCount] = useState<number | null>(null);
  const [advanceError, setAdvanceError] = useState('');

  useEffect(() => {
    if (!loading && !profile) router.replace('/login');
    if (!loading && profile && !isAdmin) router.replace('/dashboard');
  }, [profile, loading, isAdmin, router]);

  async function handleAdvance(queueId: string) {
    setActions(prev => ({ ...prev, [queueId]: 'loading' }));
    setAdvanceError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ queueId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setAdvanceError(d.error ?? 'Advance failed.');
      }
      setActions(prev => ({ ...prev, [queueId]: 'done' }));
      setTimeout(() => setActions(prev => ({ ...prev, [queueId]: 'idle' })), 1500);
    } catch {
      setAdvanceError('Network error. Please try again.');
      setActions(prev => ({ ...prev, [queueId]: 'idle' }));
    }
  }

  async function handleSeed() {
    setSeedStatus('loading');
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeedStatus(res.ok ? 'done' : 'error');
      setTimeout(() => setSeedStatus('idle'), 3000);
    } catch {
      setSeedStatus('error');
      setTimeout(() => setSeedStatus('idle'), 3000);
    }
  }

  async function handleProcessMissed() {
    setMissedStatus('loading');
    try {
      const res = await fetch('/api/missed', {
        method: 'POST',
        headers: { 'x-cron-secret': 'admin-manual-trigger' },
      });
      const d = await res.json();
      setMissedCount(d.processed ?? 0);
      setMissedStatus('done');
      setTimeout(() => { setMissedStatus('idle'); setMissedCount(null); }, 4000);
    } catch {
      setMissedStatus('idle');
    }
  }

  if (loading || queuesLoading) {
    return <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner spinner-lg" /></main>;
  }

  const totalActive   = queues.reduce((s, q) => s + (q.activeCount ?? 0), 0);
  const totalCapacity = queues.reduce((s, q) => s + (q.capacity ?? 50), 0);
  const fillPct       = totalCapacity > 0 ? Math.round((totalActive / totalCapacity) * 100) : 0;

  return (
    <main className="page grid-bg">
      <div className="orb orb-blue" style={{ width: 400, height: 400, top: -100, right: -80 }} aria-hidden />

      <nav className="navbar">
        <Link href="/admin" className="navbar-logo">⚡ CrowdFlow</Link>
        <div className="navbar-actions">
          <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.85rem' }}>🛡 Admin</span>
          <button onClick={() => signOut(auth).then(() => router.push('/login'))} className="btn btn-ghost btn-sm">Sign Out</button>
        </div>
      </nav>

      <div style={{ flex: 1, padding: '28px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div className="container-lg anim-fade-in" style={{ width: '100%' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>Gate Control Panel</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wankhede Stadium · Live queue management</p>
          </div>

          {/* Overall stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Active Attendees', value: totalActive, color: 'var(--electric)' },
              { label: 'Total Capacity',   value: totalCapacity, color: 'var(--neon)' },
              { label: 'Fill Rate',         value: `${fillPct}%`, color: fillPct > 80 ? 'var(--danger)' : 'var(--amber)' },
            ].map(s => (
              <div key={s.label} className="card card-pad-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.3rem,4vw,1.8rem)', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Fill bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Overall venue fill</span><span>{fillPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillPct > 80 ? 'linear-gradient(90deg, var(--amber), var(--danger))' : undefined }} />
            </div>
          </div>

          {advanceError && <div className="alert alert-error" role="alert">{advanceError}</div>}

          {/* Per-gate queue cards */}
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gate Queues</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {queues.map(q => {
              const color   = GATE_COLORS[q.id] ?? 'var(--electric)';
              const pct     = q.capacity > 0 ? Math.round((q.activeCount / q.capacity) * 100) : 0;
              const aState  = actions[q.id] ?? 'idle';

              return (
                <div key={q.id} className="card card-pad" style={{ borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color, marginBottom: 4 }}>{q.gate ?? QUEUE_GATES[q.id]}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Queue {q.id}</span>
                        <span className={`badge ${pct >= 90 ? 'badge-missed' : pct >= 60 ? 'badge-called' : 'badge-waiting'}`} style={{ fontSize: '0.72rem' }}>
                          {q.activeCount}/{q.capacity} active
                        </span>
                      </div>
                    </div>
                    <button
                      id={`btn-advance-${q.id}`}
                      onClick={() => handleAdvance(q.id)}
                      disabled={aState === 'loading'}
                      className={`btn btn-sm ${aState === 'done' ? 'btn-success' : 'btn-primary'}`}
                      aria-label={`Advance queue ${q.id}`}
                    >
                      {aState === 'loading' ? <><span className="spinner" />…</> : aState === 'done' ? '✓ Advanced' : '▶ Advance'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                    {[
                      { label: 'Now Serving', value: `#${q.currentServing}`, bright: true },
                      { label: 'Last Issued',  value: `#${q.lastAssigned}` },
                      { label: 'Fill',          value: `${pct}%` },
                    ].map(stat => (
                      <div key={stat.label} style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '10px 8px' }}>
                        <div style={{ fontSize: 'clamp(1rem,3.5vw,1.3rem)', fontWeight: 800, color: stat.bright ? color : 'var(--text-primary)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin utilities */}
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Utilities</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Seed button */}
            <div className="card card-pad-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Seed Queue Documents</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Creates Q1–Q5 in Firestore if they don't exist</div>
              </div>
              <button
                id="btn-seed-db"
                onClick={handleSeed}
                disabled={seedStatus === 'loading'}
                className={`btn btn-sm ${seedStatus === 'done' ? 'btn-success' : seedStatus === 'error' ? 'btn-danger' : 'btn-ghost'}`}
              >
                {seedStatus === 'loading' ? <><span className="spinner" />Seeding…</> :
                 seedStatus === 'done'    ? '✓ Seeded' :
                 seedStatus === 'error'   ? '✗ Error' : '🌱 Seed DB'}
              </button>
            </div>

            {/* Process missed slots */}
            <div className="card card-pad-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Process Missed Slots</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {missedStatus === 'done' && missedCount !== null
                    ? `Processed ${missedCount} expired slot(s)`
                    : 'Manually expire overdue queue slots (auto-runs every 2 min via Cloud Scheduler)'}
                </div>
              </div>
              <button
                id="btn-process-missed"
                onClick={handleProcessMissed}
                disabled={missedStatus === 'loading'}
                className={`btn btn-sm ${missedStatus === 'done' ? 'btn-success' : 'btn-amber'}`}
              >
                {missedStatus === 'loading' ? <><span className="spinner" />Running…</> :
                 missedStatus === 'done'    ? '✓ Done' : '⏰ Run Now'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
