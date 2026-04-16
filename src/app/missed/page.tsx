'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function MissedPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [rejoining, setRejoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !profile) router.replace('/login');
    // If user has an active waiting slot, go to queue
    if (!loading && profile?.activeSlotId) router.replace('/queue');
  }, [profile, loading, router]);

  async function handleRejoin() {
    if (!profile) return;
    setRejoining(true);
    setError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // Rejoin doesn't need geo — they're already at venue since they had a slot
        body: JSON.stringify({ rejoin: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          all_queues_full: 'All gates are currently full. Please wait a few minutes and try again.',
        };
        setError(msgs[data.error] ?? 'Rejoin failed. Please try again.');
        return;
      }
      router.push('/queue');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setRejoining(false);
    }
  }

  if (loading) {
    return <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner spinner-lg" /></main>;
  }

  return (
    <main className="page grid-bg" style={{ position: 'relative' }}>
      <div className="orb orb-blue" style={{ width: 350, height: 350, bottom: 50, right: -80 }} aria-hidden />

      <nav className="navbar">
        <Link href="/dashboard" className="navbar-logo">⚡ CrowdFlow</Link>
        <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div className="container anim-fade-in" style={{ width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ fontSize: '5rem', marginBottom: 16, lineHeight: 1 }} aria-hidden>⏰</div>

          {/* Status */}
          <div className="badge badge-missed" style={{ marginBottom: 24 }}>Slot Expired</div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 12 }}>
            You missed your slot
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, fontSize: '0.95rem' }}>
            Your 10-minute check-in window expired.<br />
            No worries — tap below to rejoin and get the next available number at the shortest gate.
          </p>

          {/* What happens info */}
          <div className="card card-pad" style={{ textAlign: 'left', marginBottom: 28 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>What happens when you rejoin?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🔍', text: 'We find the queue with the fewest people right now.' },
                { icon: '🎫', text: 'You get assigned the next number after the last person in that queue.' },
                { icon: '📱', text: 'Your live queue view updates instantly. Same experience as before.' },
              ].map(item => (
                <div key={item.icon} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-error" role="alert" aria-live="polite">{error}</div>}

          <button
            id="btn-rejoin-queue"
            onClick={handleRejoin}
            disabled={rejoining}
            className="btn btn-primary btn-full btn-lg"
            aria-busy={rejoining}
            style={{ marginBottom: 16 }}
          >
            {rejoining ? <><span className="spinner" aria-hidden />Getting your new number…</> : '🔄 Rejoin Queue Now'}
          </button>

          <Link href="/dashboard" className="btn btn-ghost btn-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
