'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, updateFcmToken } from '@/lib/firestore';
import { requestNotificationToken } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

function validateTicketId(id: string) {
  return /^[A-Z0-9]{6,12}$/.test(id.trim().toUpperCase());
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', ticketId: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (form.name.trim().length < 2)         return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email))  return setError('Please enter a valid email.');
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g,''))) return setError('Enter a valid 10-digit phone number.');
    if (!validateTicketId(form.ticketId))    return setError('Ticket ID must be 6–12 uppercase letters/digits.');
    if (form.password.length < 6)            return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await createUserProfile(cred.user.uid, {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.replace(/\s/g, ''),
        ticketId: form.ticketId.trim().toUpperCase(),
        role:     'user',
      });
      requestNotificationToken()
        .then(token => { if (token) updateFcmToken(cred.user.uid, token); })
        .catch(() => {});
      router.replace('/dashboard');
    } catch (err: any) {
      const msgs: Record<string,string> = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password':        'Password is too weak. Use at least 6 characters.',
        'auth/invalid-email':        'Please enter a valid email address.',
      };
      setError(msgs[err.code] ?? 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <main className="page grid-bg">
      <div className="orb orb-green" style={{ width: 350, height: 350, top: -100, left: -80 }} />
      <nav className="navbar"><Link href="/" className="navbar-logo">⚡ CrowdFlow</Link></nav>
      <div style={{ flex: 1, padding: '32px 20px 48px' }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 8 }}>Create account 🎫</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Register once. Never wait in line again.</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="reg-name">Full name</label>
              <input id="reg-name" type="text" className="input" placeholder="Rohit Sharma" value={form.name} onChange={update('name')} required disabled={loading} autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="reg-email">Email address</label>
              <input id="reg-email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={update('email')} required disabled={loading} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="reg-phone">Mobile number</label>
              <input id="reg-phone" type="tel" className="input" placeholder="9876543210" value={form.phone} onChange={update('phone')} required disabled={loading} autoComplete="tel" inputMode="numeric" />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="reg-ticket">Ticket ID</label>
              <input id="reg-ticket" type="text" className="input" placeholder="WAN2026A" value={form.ticketId} onChange={update('ticketId')} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={update('password')} required disabled={loading} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="label" htmlFor="reg-confirm">Confirm password</label>
              <input id="reg-confirm" type="password" className="input" value={form.confirmPassword} onChange={update('confirmPassword')} required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? <><span className="spinner" />Creating account…</> : 'Create Account →'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have account? <Link href="/login" style={{ color: 'var(--electric)', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
