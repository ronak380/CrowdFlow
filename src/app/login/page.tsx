'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      const msgs: Record<string,string> = {
        'auth/user-not-found':   'No account found with this email.',
        'auth/wrong-password':   'Incorrect password.',
        'auth/invalid-email':    'Invalid email address.',
        'auth/too-many-requests': 'Account locked due to many attempts. Try later.',
      };
      setError(msgs[err.code] ?? 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  }

  async function handleGoogleLogin() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page grid-bg">
      <div className="orb orb-blue" style={{ width: 400, height: 400, top: -150, right: -150 }} />
      <nav className="navbar"><Link href="/" className="navbar-logo">⚡ CrowdFlow</Link></nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '32px 20px 80px' }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Welcome back! 👋</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to view your stadium queue status.</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          
          <button onClick={handleGoogleLogin} disabled={loading} className="btn btn-google btn-full" style={{ marginBottom: 20 }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{ width: 18, marginRight: 10 }} />
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span>OR EMAIL</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? <><span className="spinner" />Signing in…</> : 'Sign In →'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--electric)', fontWeight: 600 }}>Register →</Link>
          </p>

          {/* Evaluator Notice for Hackathon */}
          <div style={{ marginTop: 32, padding: 16, background: 'rgba(0, 245, 160, 0.05)', border: '1px solid var(--neon-dim)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Hackathon Evaluators</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  This application features a dual-module architecture. To test the <strong>Security Control Panel</strong> and queue advancement logic, you must log in with an account that has Firebase Custom Claims set to <code>admin: true</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
