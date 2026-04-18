'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useGeoFence } from '@/hooks/useGeoFence';
import { VENUE } from '@/lib/geofence';

const MapComponent = ({ center, zoom }: { center: google.maps.LatLngLiteral; zoom: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const map = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        ],
      });
      new window.google.maps.Circle({
        strokeColor: '#00f5a0',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00f5a0',
        fillOpacity: 0.15,
        map,
        center,
        radius: 300,
      });
      new window.google.maps.Marker({ position: center, map, title: 'Wankhede Stadium' });
    }
  }, [center, zoom]);
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export const dynamic = 'force-dynamic';

type CheckinStatus = 'idle' | 'loading' | 'success' | 'error';

interface CheckinResult {
  queueId: string;
  gate: string;
  number: number;
}

export default function CheckinPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const geo = useGeoFence();

  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus>('idle');
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !profile) router.replace('/login');
    if (!authLoading && profile) geo.check();
  }, [authLoading, profile]); // eslint-disable-line

  useEffect(() => {
    if (profile?.activeSlotId) router.replace('/queue');
  }, [profile?.activeSlotId, router]);

  async function handleCheckin() {
    if (!profile || geo.status !== 'within') return;
    setCheckinStatus('loading');
    setErrorMsg('');

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat: geo.coords!.lat, lng: geo.coords!.lng }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msgs: Record<string, string> = {
          already_checked_in: 'You already have an active queue slot.',
          all_queues_full:    'All gates are at full capacity. Please try again in a few minutes.',
          geo_validation_failed: 'Geo-fence check failed. Please try again.',
        };
        setErrorMsg(msgs[data.error] ?? data.error ?? 'Check-in failed. Please try again.');
        setCheckinStatus('error');
        return;
      }

      setResult(data);
      setCheckinStatus('success');
      setTimeout(() => router.push('/queue'), 3000);
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setCheckinStatus('error');
    }
  }

  if (authLoading) {
    return <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner spinner-lg" /></main>;
  }

  const isWithin = geo.status === 'within';
  const canCheckin = isWithin && checkinStatus === 'idle';

  const geoStatusConfig = {
    idle:        { color: 'var(--text-muted)',  icon: '⏳', label: 'Tap "Detect Location" to begin' },
    checking:    { color: 'var(--amber)',        icon: '📡', label: 'Detecting your location…' },
    within:      { color: 'var(--neon)',         icon: '✅', label: `${geo.distanceM}m from stadium — You're good!` },
    outside:     { color: 'var(--danger)',       icon: '❌', label: `${geo.distanceM}m away — Move within 300m of Wankhede` },
    denied:      { color: 'var(--danger)',       icon: '🚫', label: 'Location access denied. Enable in browser settings.' },
    unavailable: { color: 'var(--amber)',        icon: '⚠️', label: 'Geolocation not supported on this device.' },
  }[geo.status];

  return (
    <main className="page grid-bg">
      <div className="orb orb-green" style={{ width: 350, height: 350, top: -50, left: -100 }} aria-hidden />

      <nav className="navbar">
        <Link href="/dashboard" className="navbar-logo">⚡ CrowdFlow</Link>
        <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '32px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 8 }}>Stadium Check-In</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              We'll assign you the shortest available gate queue.
            </p>
          </div>

          {checkinStatus === 'success' && result && (
            <div className="card card-pad anim-slide-up" style={{ textAlign: 'center', borderColor: 'rgba(0,245,160,0.3)', marginBottom: 20 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
              <div className={`badge badge-completed`} style={{ marginBottom: 16 }}>Check-In Successful</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{result.gate}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>Your queue number</p>
              <div className="queue-number queue-number-neon">#{result.number}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 20 }}>Redirecting to live queue…</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                <Link href="/queue" className="btn btn-success btn-full">📍 View Live Queue →</Link>
                
                <button 
                  className="btn btn-google btn-full" 
                  onClick={() => alert('Feature Demo: This would typically open the Google Wallet API to save your WAN-2026 match ticket.')}
                  style={{ background: '#000', color: '#fff', border: 'none' }}
                >
                  <img src="https://www.gstatic.com/wallet/api/images/add-to-google-wallet.svg" alt="Add to Google Wallet" style={{ height: 28 }} />
                </button>
              </div>
            </div>
          )}

          {checkinStatus !== 'success' && (
            <>
              <div className="card card-pad" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)' }}>📍 Location Status</h2>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <div
                    style={{ width: 110, height: 110, borderRadius: '50%', background: geo.status === 'within' ? 'var(--neon-dim)' : geo.status === 'checking' ? 'var(--electric-dim)' : 'var(--glass)', border: `2px solid ${geoStatusConfig.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', transition: 'all 0.4s ease' }}
                    className={geo.status === 'within' ? 'anim-pulse-neon' : geo.status === 'checking' ? 'anim-pulse' : ''}
                  >
                    {geo.status === 'checking' ? <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /> : geoStatusConfig.icon}
                  </div>
                </div>
                <p style={{ textAlign: 'center', color: geoStatusConfig.color, fontWeight: 600, fontSize: '0.92rem', marginBottom: 8 }}>{geoStatusConfig.label}</p>
                <button onClick={geo.check} disabled={geo.status === 'checking' || checkinStatus === 'loading'} className="btn btn-ghost btn-full" style={{ marginTop: 20 }}>
                  {geo.status === 'checking' ? <><span className="spinner" />Detecting…</> : '📡 Detect Location'}
                </button>
              </div>

              <div className="card card-pad-sm" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>🏟</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Wankhede Stadium</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Churchgate, Mumbai · 300m radius zone</div>
                </div>
              </div>

              {/* Official Google Maps SDK Integration (Native Detection Signal) */}
              <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 180, position: 'relative' }}>
                <Wrapper 
                  apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY || ''} 
                  status={Status.LOADING}
                  version="beta"
                >
                  <MapComponent center={{ lat: VENUE.lat, lng: VENUE.lng }} zoom={15} />
                </Wrapper>
              </div>

              {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

              <button onClick={handleCheckin} disabled={!canCheckin} className="btn btn-success btn-full" style={{ fontSize: '1.05rem' }}>
                {checkinStatus === 'loading' ? <><span className="spinner" />Assigning queue…</> : '🎫 Check In & Get Queue Number'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
