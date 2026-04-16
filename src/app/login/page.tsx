'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

function getErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':    'No account found with this email.',
    'auth/wrong-password':    'Incorrect password. Please try again.',
    'auth/invalid-email':     'Please enter a valid email address.',
    'auth/invalid-credential':'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) router.replace('/dashboard');
    });
  }, [router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally { setLoading(false); }
  }

  async function handleGoogleLogin() {
    setLoading(true); setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') setError(getErrorMessage(err.code));
    } finally { setLoading(false); }
  }

  return (
    <main className="page grid-bg" style={{ position: 'relative' }}>
      <div className="orb orb-blue" style={{ width: 400, height: 400, top: -150, right: -100 }} aria-hidden />

      <nav className="navbar">
        <Link href="/" className="navbar-logo">⚡ CrowdFlow</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 20px' }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 8 }}>Welcome back 👋</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your live queue dashboard.</p>
          </div>

          {error && <div className="alert alert-error" role="alert" aria-live="polite">{error}</div>}

          {/* Google Sign-In */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-ghost btn-full"
            style={{ marginBottom: 20, gap: 12 }}
            aria-label="Continue with Google"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>or</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <form onSubmit={handleEmailLogin} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" aria-required="true" disabled={loading} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password" aria-required="true" disabled={loading} />
            </div>
            <button id="btn-email-login" type="submit" className="btn btn-primary btn-full" disabled={loading} aria-busy={loading}>
              {loading ? <><span className="spinner" aria-hidden />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            New to CrowdFlow?{' '}
            <Link href="/register" style={{ color: 'var(--electric)', fontWeight: 600, textDecoration: 'none' }}>
              Create account →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
