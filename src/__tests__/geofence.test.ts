import { distanceMeters, isWithinGeofence, VENUE } from '../lib/geofence';

describe('Geofence Logic', () => {
  test('calculates correct distance between two points', () => {
    // Wankhede to a point ~100m away
    const lat2 = 18.9385;
    const lon2 = 72.8258;
    const dist = distanceMeters(VENUE.lat, VENUE.lng, lat2, lon2);
    
    // Exact distance would be roughly 77m
    expect(dist).toBeGreaterThan(70);
    expect(dist).toBeLessThan(85);
  });

  test('isWithinGeofence returns true for points within 300m', () => {
    // Very close point
    expect(isWithinGeofence(18.9379, 72.8259)).toBe(true);
  });

  test('isWithinGeofence returns false for points outside 300m', () => {
    // Gateway of India (~2km away)
    expect(isWithinGeofence(18.9220, 72.8347)).toBe(false);
  });

  test('distance calculation handles same point correctly', () => {
    expect(distanceMeters(VENUE.lat, VENUE.lng, VENUE.lat, VENUE.lng)).toBe(0);
  });
});
