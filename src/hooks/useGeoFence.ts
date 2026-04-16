'use client';
// CrowdFlow — Geo-fence Hook
// Wraps browser Geolocation API with the Haversine 300m check

import { useState, useCallback } from 'react';
import { isWithinGeofence, distanceMeters, estimatedWalkMinutes } from '@/lib/geofence';

export type GeoStatus =
  | 'idle'
  | 'checking'
  | 'within'     // ✅ within 300m — check-in enabled
  | 'outside'    // ❌ too far away
  | 'denied'     // 🚫 permission denied
  | 'unavailable'; // ⚠️ Geolocation API not supported

export interface GeoState {
  status: GeoStatus;
  distanceM: number | null;
  walkMinutes: number | null;
  coords: { lat: number; lng: number } | null;
  check: () => void;
}

export function useGeoFence(): GeoState {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [walkMinutes, setWalkMinutes] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const check = useCallback(() => {
    if (!navigator?.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('checking');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = Math.round(distanceMeters(lat, lng));
        const walk = estimatedWalkMinutes(lat, lng);

        setCoords({ lat, lng });
        setDistanceM(dist);
        setWalkMinutes(walk);
        setStatus(isWithinGeofence(lat, lng) ? 'within' : 'outside');
      },
      (err) => {
        setStatus(err.code === GeolocationPositionError.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 30_000, // cache for 30s — reduces GPS power usage
      }
    );
  }, []);

  return { status, distanceM, walkMinutes, coords, check };
}
