// CrowdFlow — Geo-fence Utilities
// Uses Haversine formula (client & server) — zero Google Maps API calls

export const VENUE = {
  name: 'Wankhede Stadium, Mumbai',
  lat: 18.9378,
  lng: 72.8258,
  address: 'D Rd, Churchgate, Mumbai, Maharashtra 400020',
};

const RADIUS_METERS = Number(process.env.NEXT_PUBLIC_VENUE_RADIUS_M ?? 300);
const EARTH_RADIUS_M = 6_371_000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula: calculate great-circle distance in metres.
 * O(1) — no external API required.
 */
export function distanceMeters(lat: number, lng: number): number {
  const dLat = toRadians(lat - VENUE.lat);
  const dLng = toRadians(lng - VENUE.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(VENUE.lat)) *
      Math.cos(toRadians(lat)) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Returns true if the given coordinates are within the 300m geo-fence */
export function isWithinGeofence(lat: number, lng: number): boolean {
  return distanceMeters(lat, lng) <= RADIUS_METERS;
}

/** Estimated walk time in minutes at 5 km/h */
export function estimatedWalkMinutes(lat: number, lng: number): number {
  const dist = distanceMeters(lat, lng);
  const walkSpeedMpm = (5 * 1000) / 60; // 5 km/h → m/min
  return Math.ceil(dist / walkSpeedMpm);
}
