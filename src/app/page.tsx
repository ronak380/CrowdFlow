'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { VENUE } from '@/lib/geofence';

export const dynamic = 'force-dynamic';

const FEATURES = [
  { icon: '📝', title: 'Register Once', desc: 'Create your profile with your match ticket ID before the event.' },
  { icon: '📍', title: 'Arrive & Check In', desc: 'Within 300m of Wankhede? The check-in button activates automatically.' },
  { icon: '🎫', title: 'Shortest Queue', desc: 'We auto-assign you to the gate with the fewest people waiting.' },
  { icon: '🔔', title: 'Live Updates', desc: 'Watch your number countdown in real time. Get notified when it\'s your turn.' },
];

export default function LandingPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  // Redirect logged-in users
  useEffect(() => {
    if (!loading && profile) router.replace('/dashboard');
  }, [profile, loading, router]);

  if (loading) return null;

  return (
    <main className="page grid-bg" style={{ position: 'relative', overflowX: 'hidden' }}>

      {/* Decorative orbs */}
      <div className="orb orb-blue" style={{ width: 500, height: 500, top: -200, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }} aria-hidden />
      <div className="orb orb-green" style={{ width: 300, height: 300, bottom: 100, right: -100, zIndex: 0 }} aria-hidden />

      {/* ── Navbar ── */}
      <nav className="navbar" style={{ position: 'relative', zIndex: 10 }}>
        <span className="navbar-logo">⚡ CrowdFlow</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login"    className="btn btn-ghost btn-sm">Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '72px 24px 60px', position: 'relative', zIndex: 1 }}
        className="anim-fade-in"
      >
        {/* Venue pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,159,255,0.1)', border: '1px solid rgba(79,159,255,0.2)', borderRadius: 'var(--r-full)', padding: '6px 18px', marginBottom: 32, fontSize: '0.85rem', color: 'var(--electric)' }}>
          🏏 {VENUE.name}
        </div>

        <h1 style={{ fontSize: 'clamp(2.6rem, 9vw, 5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: 24, background: 'linear-gradient(140deg, #e8edf5 0%, var(--electric) 55%, var(--neon) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', maxWidth: 600 }}>
          Beat the Queue.<br />Enjoy the Game.
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: 460, marginBottom: 44, lineHeight: 1.75 }}>
          CrowdFlow gives you a real-time gate queue number the moment you're 300m from Wankhede. No lines, no chaos.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72 }}>
          <Link href="/register" className="btn btn-primary btn-lg" id="cta-register">Get Your Queue Number →</Link>
          <Link href="/login"    className="btn btn-ghost btn-lg"  id="cta-login">Sign In</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, maxWidth: 420, width: '100%' }}>
          {[
            { value: '5',    label: 'Gates',      icon: '🚪' },
            { value: '250',  label: 'Capacity',   icon: '👥' },
            { value: '~2m',  label: 'Avg Wait/person', icon: '⏱' },
          ].map(s => (
            <div key={s.label} className="card card-pad-sm" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--electric)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 28, letterSpacing: '0.05em', textTransform: 'uppercase' }}>How It Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card card-pad-sm" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', animationDelay: `${i * 80}ms` }}>
                <div style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', background: 'var(--electric-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }} aria-hidden>{f.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', position: 'relative', zIndex: 1 }}>
        CrowdFlow © 2026 · {VENUE.name} · Built for Prompt Wars Virtual
      </footer>
    </main>
  );
}
