'use client';

export const dynamic = 'force-dynamic';

export default function OfflinePage() {
  return (
    <main style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '40px 24px', background: '#080e1a', color: '#e8edf5',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>📶</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>You're offline</h1>
      <p style={{ color: '#8899aa', maxWidth: 320, lineHeight: 1.7, marginBottom: 28 }}>
        No internet connection. Your queue number is still saved — reconnect to see live updates.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '14px 28px', background: '#4f9fff', color: '#080e1a',
          border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Retry Connection
      </button>
    </main>
  );
}
