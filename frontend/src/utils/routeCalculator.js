import { HYDERABAD_SIGNALS } from './hyderabadData';

const ROUTE_SIGNAL_TOLERANCE_KM = 0.22;
const STANDARD_RED_TIME_SECONDS = 59;
const STANDARD_YELLOW_TIME_SECONDS = 3;
const STANDARD_GREEN_TIME_SECONDS = 59;
const MAX_ROUTE_OPTIONS = 3;

const kmToLatDegrees = (km) => km / 111.32;

const kmToLngDegrees = (km, lat) => {
  const cosLat = Math.cos((lat * Math.PI) / 180);
  if (Math.abs(cosLat) < 0.0001) return kmToLatDegrees(km);
  return km / (111.32 * cosLat);
};

const normalizeRoute = (route, index, customLabel) => {
  const path = (route?.geometry?.coordinates || []).map((coord) => ({
    lat: coord[1],
    lng: coord[0]
  }));

  return {
    path,
    distance: (route?.distance || 0) / 1000,
    duration: (route?.duration || 0) / 60,
    routeIndex: index,
    label: customLabel || (index === 0 ? '1st Shortest' : index === 1 ? '2nd Shortest' : '3rd Shortest')
  };
};

const getDirectDistanceKm = (start, end) => (
  calculateDistance(start.lat, start.lng, end.lat, end.lng)
);

const createPerpendicularWaypoint = (start, end, direction = 1) => {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;

  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const magnitude = Math.hypot(dLat, dLng);

  if (magnitude < 1e-8) {
    return {
      lat: midLat + kmToLatDegrees(0.8 * direction),
      lng: midLng + kmToLngDegrees(0.8 * direction, midLat)
    };
  }

  const tripDistanceKm = getDirectDistanceKm(start, end);
  const offsetKm = Math.min(6, Math.max(0.8, tripDistanceKm * 0.2));

  const unitPerpLat = (-dLng / magnitude) * direction;
  const unitPerpLng = (dLat / magnitude) * direction;

  return {
    lat: midLat + kmToLatDegrees(offsetKm * unitPerpLat),
    lng: midLng + kmToLngDegrees(offsetKm * unitPerpLng, midLat)
  };
};

const samplePathPoint = (path, ratio) => {
  if (!path || path.length === 0) return null;
  if (path.length === 1) return path[0];
  const index = Math.min(path.length - 1, Math.max(0, Math.floor((path.length - 1) * ratio)));
  return path[index];
};

const estimateRouteDifferenceKm = (routeA, routeB) => {
  if (!routeA?.path?.length || !routeB?.path?.length) return 0;

  const ratios = [0.2, 0.4, 0.6, 0.8];
  const distances = ratios
    .map((ratio) => {
      const pointA = samplePathPoint(routeA.path, ratio);
      const pointB = samplePathPoint(routeB.path, ratio);
      if (!pointA || !pointB) return 0;
      return calculateDistance(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
    })
    .filter((d) => d > 0);

  if (distances.length === 0) return 0;
  return distances.reduce((sum, value) => sum + value, 0) / distances.length;
};

const buildSyntheticAlternatePath = (primaryPath, start, end) => {
  if (!primaryPath || primaryPath.length < 2) {
    const waypoint = createPerpendicularWaypoint(start, end, 1);
    return [start, waypoint, end];
  }

  const first = primaryPath[0];
  const last = primaryPath[primaryPath.length - 1];
  const dLat = last.lat - first.lat;
  const dLng = last.lng - first.lng;
  const magnitude = Math.hypot(dLat, dLng) || 1;
  const unitPerpLat = -dLng / magnitude;
  const unitPerpLng = dLat / magnitude;

  const directDistanceKm = getDirectDistanceKm(start, end);
  const maxOffsetKm = Math.min(1.5, Math.max(0.35, directDistanceKm * 0.06));

  return primaryPath.map((point, idx) => {
    const t = primaryPath.length <= 1 ? 0 : idx / (primaryPath.length - 1);
    const wave = Math.sin(Math.PI * t); // zero offset at ends, max at center
    const localOffsetKm = maxOffsetKm * wave;

    return {
      lat: point.lat + kmToLatDegrees(localOffsetKm * unitPerpLat),
      lng: point.lng + kmToLngDegrees(localOffsetKm * unitPerpLng, point.lat)
    };
  });
};

const tryFetchDetourRoute = async (start, end, primaryRoute) => {
  const waypointCandidates = [
    createPerpendicularWaypoint(start, end, 1),
    createPerpendicularWaypoint(start, end, -1)
  ];

  const detourPromises = waypointCandidates.map(async (waypoint) => {
    const detourUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${waypoint.lng},${waypoint.lat};${end.lng},${end.lat}?geometries=geojson&overview=full&steps=true&alternatives=false`;
    const response = await fetch(detourUrl);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    const detour = normalizeRoute(data.routes[0], 1, '2nd Alternate');
    detour.routeDifferenceKm = estimateRouteDifferenceKm(primaryRoute, detour);
    return detour;
  });

  const detours = await Promise.allSettled(detourPromises);
  const validDetours = detours
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value)
    // Avoid routes that are essentially identical to the primary path.
    .filter((route) => route.routeDifferenceKm >= 0.12)
    // Avoid routes that are unrealistically long detours.
    .filter((route) => route.distance <= primaryRoute.distance * 1.75)
    .sort((a, b) => b.routeDifferenceKm - a.routeDifferenceKm);

  return validDetours[0] || null;
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Fetch multiple alternative routes from OSRM (1st, 2nd, 3rd shortest paths)
export const fetchRealRoute = async (start, end) => {
  try {
    // Request alternatives from OSRM; public instances handle boolean consistently.
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full&steps=true&alternatives=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // Process all available routes (up to 3)
      const allRoutes = data.routes
        .slice(0, MAX_ROUTE_OPTIONS)
        .map((route, index) => normalizeRoute(route, index));
      
      // If OSRM returns fewer than 2 routes, attempt a detour waypoint route.
      if (allRoutes.length === 1) {
        const route1 = allRoutes[0];
        const detourRoute = await tryFetchDetourRoute(start, end, route1);

        if (detourRoute) {
          allRoutes.push(detourRoute);
        } else {
          const syntheticPath = buildSyntheticAlternatePath(route1.path, start, end);
          allRoutes.push({
            path: syntheticPath,
            distance: route1.distance * 1.1,
            duration: route1.duration * 1.12,
            routeIndex: 1,
            label: '2nd Alternate'
          });
        }
      }
      
      console.log(`Found ${allRoutes.length} alternative routes`);
      return allRoutes;
    }
  } catch (error) {
    console.error('OSRM routing error:', error);
  }
  
  // Fallback to direct line if API fails
  const fallbackRoute = {
    path: [start, end],
    distance: calculateDistance(start.lat, start.lng, end.lat, end.lng),
    duration: calculateDistance(start.lat, start.lng, end.lat, end.lng) * 2,
    routeIndex: 0,
    label: '1st Shortest'
  };
  
  // Generate a smoother second fallback path with a bounded arc offset.
  const offsetPath = buildSyntheticAlternatePath(fallbackRoute.path, start, end);
  
  const fallbackRoute2 = {
    path: offsetPath,
    distance: fallbackRoute.distance * 1.1,
    duration: fallbackRoute.duration * 1.15,
    routeIndex: 1,
    label: '2nd Alternate'
  };
  
  return [fallbackRoute, fallbackRoute2];
};

// Find waypoints (traffic signals) along the route
export const findRouteWaypoints = (routePath) => {
  if (!routePath || routePath.length < 2) return [];
  
  const waypoints = [];
  const maxDistanceFromRoute = ROUTE_SIGNAL_TOLERANCE_KM;
  
  HYDERABAD_SIGNALS.forEach(signal => {
    if (!signal?.location || typeof signal.location.lat !== 'number' || typeof signal.location.lng !== 'number') {
      return;
    }

    // Check if signal is near any segment of the route
    let minDistance = Infinity;
    
    for (let i = 0; i < routePath.length - 1; i++) {
      const segmentStart = routePath[i];
      const segmentEnd = routePath[i + 1];
      
      // Calculate perpendicular distance from signal to route segment
      const distance = pointToSegmentDistance(
        signal.location,
        segmentStart,
        segmentEnd
      );
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    // Include signal if it falls inside the route corridor.
    if (minDistance < maxDistanceFromRoute) {
      waypoints.push({ ...signal, distanceFromRoute: minDistance });
    }
  });

  return waypoints
    .sort((a, b) => a.distanceFromRoute - b.distanceFromRoute)
    .filter((signal, index, arr) => arr.findIndex((item) => item.id === signal.id) === index);
};

// Calculate perpendicular distance from point to line segment
const pointToSegmentDistance = (point, segStart, segEnd) => {
  // Convert lat/lng to local meter coordinates for stable geometry math.
  const avgLatRad = ((segStart.lat + segEnd.lat + point.lat) / 3) * Math.PI / 180;
  const metersPerLat = 111320;
  const metersPerLng = 111320 * Math.cos(avgLatRad);

  const pX = point.lng * metersPerLng;
  const pY = point.lat * metersPerLat;
  const sX = segStart.lng * metersPerLng;
  const sY = segStart.lat * metersPerLat;
  const eX = segEnd.lng * metersPerLng;
  const eY = segEnd.lat * metersPerLat;

  const A = pX - sX;
  const B = pY - sY;
  const C = eX - sX;
  const D = eY - sY;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx;
  let yy;
  
  if (param < 0) {
    xx = sX;
    yy = sY;
  } else if (param > 1) {
    xx = eX;
    yy = eY;
  } else {
    xx = sX + param * C;
    yy = sY + param * D;
  }
  
  const dx = pX - xx;
  const dy = pY - yy;
  
  return Math.sqrt(dx * dx + dy * dy) / 1000;
};

// Calculate realistic route paths using real roads (returns 3 alternatives)
export const calculateRoutePath = async (start, end) => {
  if (!start || !end) return { routes: [], selectedRoute: null };
  
  // Fetch multiple alternative routes from OSRM
  const allRoutes = await fetchRealRoute(start, end);
  
  // Process each route to find signals
  const processedRoutes = allRoutes.map(routeData => {
    const signalsOnRoute = findRouteWaypoints(routeData.path);
    
    return {
      path: routeData.path,
      distance: routeData.distance,
      duration: Math.ceil(routeData.duration + signalsOnRoute.length * 1.5), // Add signal delays
      signalsOnRoute,
      routeIndex: routeData.routeIndex,
      label: routeData.label
    };
  });
  
  return {
    routes: processedRoutes,
    selectedRoute: processedRoutes[0] // Default to 1st shortest
  };
};

// Get realistic traffic signal status based on current state
export const getSignalStatus = (signal, options = {}) => {
  const timestampMs = options.timestampMs || Date.now();
  const side = options.side || 'N';

  const redTime = STANDARD_RED_TIME_SECONDS;
  const yellowTime = STANDARD_YELLOW_TIME_SECONDS;
  const greenTime = STANDARD_GREEN_TIME_SECONDS;
  const cycleTime = redTime + yellowTime + greenTime;

  const initialState = signal.currentState || signal.status || 'red';

  // Start each signal at its configured initial state.
  const stateStartOffset =
    initialState === 'green' ? redTime :
    initialState === 'yellow' ? redTime + greenTime :
    0;

  // Deterministic junction-specific seed so signals do not all switch together.
  const idSeed = (signal.id || 'signal').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const baseOffset = idSeed % cycleTime;

  // Per-side offset to mimic four-way junction approaches.
  const sideOffsets = {
    N: 0,
    E: Math.floor(cycleTime * 0.25),
    S: Math.floor(cycleTime * 0.5),
    W: Math.floor(cycleTime * 0.75)
  };
  const sideOffset = sideOffsets[side] || 0;

  const elapsedSeconds = Math.floor(timestampMs / 1000);
  const inCycle = (elapsedSeconds + baseOffset + sideOffset + stateStartOffset) % cycleTime;

  if (inCycle < redTime) {
    return {
      color: 'red',
      text: 'Stop',
      waitTime: redTime - inCycle,
      side,
      nextChangeIn: redTime - inCycle
    };
  }

  if (inCycle < redTime + greenTime) {
    const remaining = redTime + greenTime - inCycle;
    return {
      color: 'green',
      text: 'Clear',
      waitTime: 0,
      side,
      nextChangeIn: remaining
    };
  }

  const remaining = cycleTime - inCycle;
  return {
    color: 'yellow',
    text: 'Caution',
    waitTime: remaining,
    side,
    nextChangeIn: remaining
  };
};
