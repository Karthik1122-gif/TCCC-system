/**
 * Haversine Formula — Calculate great-circle distance between two GPS points
 * Returns distance in meters
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
}

/**
 * Check if ambulance is near a signal (within threshold meters)
 */
export function isNearSignal(ambulanceLat, ambulanceLng, signalLat, signalLng, thresholdMeters = 300) {
  const d = getDistance(ambulanceLat, ambulanceLng, signalLat, signalLng);
  return { isNear: d <= thresholdMeters, distance: Math.round(d) };
}

/**
 * Find the nearest signal from a list of signals 
 */
export function findNearestSignal(ambulanceLat, ambulanceLng, signals) {
  if (!signals || signals.length === 0) return null;
  return signals.reduce((nearest, signal) => {
    const d = getDistance(ambulanceLat, ambulanceLng, signal.location.lat, signal.location.lng);
    return d < nearest.dist ? { signal, dist: d } : nearest;
  }, { signal: null, dist: Infinity }).signal;
}

/**
 * Find the nearest hospital from a list of hospitals
 */
export function findNearestHospital(lat, lng, hospitals) {
  if (!hospitals || hospitals.length === 0) return null;
  return hospitals.reduce((nearest, h) => {
    const d = getDistance(lat, lng, h.lat, h.lng);
    return d < nearest.dist ? { hospital: h, dist: d } : nearest;
  }, { hospital: null, dist: Infinity });
}

