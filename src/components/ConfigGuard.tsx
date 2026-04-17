'use client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

/**
 * A safety wrapper that prevents the app from crashing if Firebase keys are missing.
 * Instead of a generic "Application error", it shows a clear diagnosis.
 */
export default function ConfigGuard({ children }: { children: React.ReactNode }) {
  const { isConfigMissing, loading } = useAuth();

  if (loading) return null;

  if (isConfigMissing) {
    return (
      <main style={{
        minHeight: '100dvh', background: '#080e1a', color: '#e8edf5',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', textAlign: 'center', fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>⚙️</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>Configuration Required</h1>
        <p style={{ color: '#8899aa', maxWidth: 450, lineHeight: 1.6, marginBottom: 32 }}>
          Your CrowdFlow deployment is active, but the **Firebase API keys** are missing in the Cloud Run environment.
        </p>
        
        <div style={{ background: '#121926', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500, border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#4f9fff', marginBottom: 12, textAlign: 'left' }}>Step 1: Check Diagnostics</h2>
          <p style={{ fontSize: '0.85rem', color: '#8899aa', textAlign: 'left', marginBottom: 20 }}>
            Visit the diagnostics page to see which variables are missing:
          </p>
          <Link 
            href="/api/diagnostics" 
            style={{ display: 'block', background: '#4f9fff', color: '#080e1a', padding: '12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', marginBottom: 24 }}
          >
            Go to /api/diagnostics →
          </Link>

          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#4f9fff', marginBottom: 12, textAlign: 'left' }}>Step 2: Add to Cloud Run</h2>
          <p style={{ fontSize: '0.82rem', color: '#8899aa', textAlign: 'left', lineHeight: 1.5 }}>
            Go to your **Cloud Run Settings** > **Variables** and add all the <code>NEXT_PUBLIC_FIREBASE_...</code> keys found in your <code>.env.local</code> file.
          </p>
        </div>

        <p style={{ marginTop: 40, fontSize: '0.75rem', color: '#475569' }}>
          CrowdFlow Diagnostic Engine v1.0
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
