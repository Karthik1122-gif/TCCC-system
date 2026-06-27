import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HYDERABAD_SIGNALS, HYDERABAD_HOSPITALS } from '../utils/hyderabadData';
import { calculateRoutePath } from '../utils/routeCalculator';
import { getEnhancedSignalStatus } from '../utils/trafficSignalSystem';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hospital Icons - Simple + plus symbol
const hospitalIcon = L.divIcon({
  html: `<div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #ef4444; border-radius: 4px; font-size: 28px; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6); border: 2px solid #dc2626;">+</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const smallHospitalIcon = L.divIcon({
  html: `<div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: #ef4444; border-radius: 3px; font-size: 20px; color: white; font-weight: bold; box-shadow: 0 1px 6px rgba(239, 68, 68, 0.5); border: 1.5px solid #dc2626;">+</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const ROUTE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
const ROUTE_RECALC_THRESHOLD_KM = 0.05;

const getRoutePathLabel = (index) => {
  if (index === 0) return '1st path';
  if (index === 1) return '2nd path';
  if (index === 2) return '3rd path';
  return `${index + 1}th path`;
};

const PRIMARY_SELECTED_ROUTE_COLOR = '#3b82f6';

const createTrafficPoleIcon = () => {
  return L.divIcon({
    html: `<div style="width: 4px; height: 20px; background: linear-gradient(to right, #4b5563, #2d3748); border-radius: 2px;"></div>`,
    iconSize: [20, 42],
    iconAnchor: [10, 42],
    popupAnchor: [0, -42],
    className: 'traffic-pole-icon'
  });
};

// Helper functions
const getCardinalDirection = (start, end) => {
  const dy = end.lat - start.lat;
  const dx = end.lng - start.lng;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle >= -45 && angle < 45) return 'E';
  if (angle >= 45 && angle < 135) return 'N';
  if (angle >= -135 && angle < -45) return 'S';
  return 'W';
};

const getApproachSideForSignal = (signal, routePath) => {
  if (!routePath || routePath.length < 2) return 'N';
  let nearestIndex = 0, nearestDistance = Infinity;
  for (let i = 0; i < routePath.length - 1; i++) {
    const p = routePath[i];
    const dist = Math.hypot(signal.location.lat - p.lat, signal.location.lng - p.lng);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestIndex = i;
    }
  }
  const from = routePath[nearestIndex];
  const to = routePath[Math.min(nearestIndex + 1, routePath.length - 1)];
  return getCardinalDirection(from, to);
};

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapFollower = ({ currentLocation }) => {
  const map = useMap();
  const prevLocationRef = useRef(null);

  useEffect(() => {
    if (currentLocation) {
      const currentPos = [currentLocation.lat, currentLocation.lng];
      const prevLoc = prevLocationRef.current;
      if (!prevLoc || Math.abs(prevLoc.lat - currentLocation.lat) > 0.0001 || Math.abs(prevLoc.lng - currentLocation.lng) > 0.0001) {
        map.panTo(currentPos);
        prevLocationRef.current = currentLocation;
      }
    }
  }, [currentLocation, map]);

  return null;
};

const DriverMap = ({ currentLocation, destinationLocation, onHospitalSelect, onRouteSignalsChange }) => {
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeMetrics, setRouteMetrics] = useState(null);
  const [signalsOnRoute, setSignalsOnRoute] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [signalClock, setSignalClock] = useState(Date.now());
  const mapRef = useRef(null);
  const lastRouteRequestRef = useRef(null);
  const selectedRouteIndexRef = useRef(0);

  useEffect(() => {
    selectedRouteIndexRef.current = selectedRouteIndex;
  }, [selectedRouteIndex]);

  useEffect(() => {
    const timer = setInterval(() => setSignalClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!currentLocation || !destinationLocation) {
        setAllRoutes([]);
        setRouteMetrics(null);
        setSignalsOnRoute([]);
        lastRouteRequestRef.current = null;
        return;
      }

      const destinationKey = `${destinationLocation.lat.toFixed(5)}:${destinationLocation.lng.toFixed(5)}`;
      const lastRequest = lastRouteRequestRef.current;
      const destinationChanged = !lastRequest || lastRequest.destinationKey !== destinationKey;
      const movedEnough =
        !lastRequest ||
        calculateDistanceKm(
          lastRequest.origin.lat,
          lastRequest.origin.lng,
          currentLocation.lat,
          currentLocation.lng
        ) >= ROUTE_RECALC_THRESHOLD_KM;

      if (!destinationChanged && !movedEnough) return;

      setIsLoadingRoute(true);
      try {
        const routeData = await calculateRoutePath(currentLocation, destinationLocation);
        const routes = routeData.routes || [];
        setAllRoutes(routes);

        const safeSelectedIndex = routes.length
          ? Math.min(selectedRouteIndexRef.current, routes.length - 1)
          : 0;
        const selected = routes[safeSelectedIndex] || routeData.selectedRoute || routes[0];
        if (selected) {
          setSelectedRouteIndex(safeSelectedIndex);
          setRouteMetrics({
            distance: selected.distance?.toFixed(2) || '0',
            duration: selected.duration || 0,
            signals: selected.signalsOnRoute?.length || 0,
          });
          setSignalsOnRoute(selected.signalsOnRoute || []);
        }
        lastRouteRequestRef.current = { origin: currentLocation, destinationKey };
      } catch (error) {
        console.error('Route calculation error:', error);
        const fallback = [{
          path: [currentLocation, destinationLocation],
          distance: 0,
          duration: 0,
          signalsOnRoute: [],
          routeIndex: 0,
          label: '1st Shortest',
        }];
        setAllRoutes(fallback);
        const safeSelectedIndex = Math.min(selectedRouteIndexRef.current, fallback.length - 1);
        setSelectedRouteIndex(safeSelectedIndex);
        setRouteMetrics({ distance: '0', duration: 0, signals: 0 });
        setSignalsOnRoute(fallback[safeSelectedIndex]?.signalsOnRoute || []);
        lastRouteRequestRef.current = { origin: currentLocation, destinationKey };
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [currentLocation, destinationLocation]);

  const selectedRoute = allRoutes[selectedRouteIndex];

  const liveRouteSignals = useMemo(() => {
    if (!destinationLocation || !selectedRoute) return [];
    return (signalsOnRoute || []).map((signal) => {
      const side = getApproachSideForSignal(signal, selectedRoute?.path);
      const status = getEnhancedSignalStatus(signal, {
        timestampMs: signalClock,
        side,
        ambulanceLocation: currentLocation,
        // Keep map lights strictly time-driven so colors rotate visibly every second.
        preemptionEnabled: false,
      });
      return { ...signal, side, status };
    });
  }, [destinationLocation, signalsOnRoute, selectedRoute, signalClock, currentLocation]);

  useEffect(() => {
    if (!onRouteSignalsChange) return;
    if (!destinationLocation) {
      onRouteSignalsChange([]);
      return;
    }
    onRouteSignalsChange(liveRouteSignals);
  }, [onRouteSignalsChange, destinationLocation, liveRouteSignals]);

  const displayedSignalCount = destinationLocation ? liveRouteSignals.length : (routeMetrics?.signals || 0);

  const nearbyHospitals = useMemo(() => {
    if (!currentLocation) return [];
    return HYDERABAD_HOSPITALS.filter((hospital) => {
      const distance = calculateDistanceKm(currentLocation.lat, currentLocation.lng, hospital.lat, hospital.lng);
      return distance <= 50;
    });
  }, [currentLocation]);

  const handleRouteChange = (index) => {
    // Keep ref and state in sync immediately to survive fast GPS route refreshes.
    selectedRouteIndexRef.current = index;
    setSelectedRouteIndex(index);
    const selectedRoute = allRoutes[index];
    if (!selectedRoute) return;
    setRouteMetrics({
      distance: selectedRoute.distance?.toFixed(2) || '0',
      duration: selectedRoute.duration || 0,
      signals: selectedRoute.signalsOnRoute?.length || 0,
    });
    setSignalsOnRoute(selectedRoute.signalsOnRoute || []);
  };

  const center = currentLocation ? [currentLocation.lat, currentLocation.lng] : [17.436, 78.444];

  return (
    <div className="w-full h-full relative border border-gray-700 rounded-lg overflow-hidden">
      
      {!currentLocation && (
        <div className="absolute top-4 left-4 z-[1000] bg-yellow-50/95 border-2 border-yellow-500 text-gray-800 p-4 rounded-xl shadow-2xl max-w-sm backdrop-blur-md">
          <h4 className="font-bold text-yellow-700 text-lg">Waiting for GPS...</h4>
          <p className="text-sm text-gray-600">Enable location services to start navigation.</p>
        </div>
      )}

      {currentLocation && routeMetrics && allRoutes.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 border-2 border-blue-500 text-gray-800 p-4 rounded-xl shadow-2xl max-w-sm backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3 border-b-2 border-blue-500 pb-2">
            <div className={`w-3 h-3 rounded-full ${isLoadingRoute ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
            <h4 className="font-bold text-blue-600 text-lg">
              {isLoadingRoute ? 'Calculating Routes...' : 'Live Navigation'}
            </h4>
          </div>

          {allRoutes.length > 1 && (
            <div className="mb-3 pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Alternative Routes:</p>
              <div className="flex gap-2">
                {allRoutes.map((route, index) => (
                  <button
                    key={route.routeIndex ?? index}
                    onClick={() => handleRouteChange(index)}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                      selectedRouteIndex === index
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {route.label}
                    <div className="text-[10px] mt-0.5">
                      {route.distance?.toFixed(1)}km • {route.duration}min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="p-2 rounded bg-blue-50" style={{ borderLeft: '3px solid #3b82f6' }}>
              <p className="text-gray-600">Distance</p>
              <p className="font-bold text-gray-800">{routeMetrics.distance} km</p>
            </div>
            <div className="p-2 rounded bg-green-50" style={{ borderLeft: '3px solid #10b981' }}>
              <p className="text-gray-600">Duration</p>
              <p className="font-bold text-gray-800">{routeMetrics.duration} min</p>
            </div>
            <div className="p-2 rounded bg-purple-50" style={{ borderLeft: '3px solid #9333ea' }}>
              <p className="text-gray-600">Signals</p>
              <p className="font-bold text-gray-800">{displayedSignalCount}</p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        doubleClickZoom={false}
      >
        {/* CartoDB Voyager - BEST for Hyderabad with all small areas and detailed labels */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          maxZoom={20}
          minZoom={10}
        />

        <MapFollower currentLocation={currentLocation} />

        {/* Ambulance Location */}
        {currentLocation && (
          <CircleMarker
            center={[currentLocation.lat, currentLocation.lng]}
            radius={10}
            fill
            fillColor="#60a5fa"
            fillOpacity={0.8}
            stroke
            color="#2563eb"
            weight={2}
          >
            <Tooltip permanent>
              <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}>📍 Ambulance</span>
            </Tooltip>
          </CircleMarker>
        )}

        {/* Route Polylines: Only show selected route prominently */}
        {[...allRoutes]
          .map((route, index) => ({ route, index }))
          .sort((a, b) => (a.index === selectedRouteIndex ? 1 : 0) - (b.index === selectedRouteIndex ? 1 : 0))
          .map(({ route, index }) => {
            const isSelected = index === selectedRouteIndex;
            if (!isSelected) return null; // Only render selected route

            return (
              <Polyline
                key={`route-${index}`}
                positions={route.path.map(p => [p.lat, p.lng])}
                color={PRIMARY_SELECTED_ROUTE_COLOR}
                weight={5}
                opacity={1}
                dashArray=""
                eventHandlers={{
                  click: () => handleRouteChange(index),
                  dblclick: (event) => {
                    if (event?.originalEvent) {
                      event.originalEvent.preventDefault();
                    }
                    handleRouteChange(index);
                  },
                }}
              >
                <Tooltip sticky direction="top">
                  <span className="text-xs font-semibold">{getRoutePathLabel(index)}</span>
                </Tooltip>
              </Polyline>
            );
          })}


        {/* Hospital Destination */}
        {destinationLocation && (
          <Marker
            position={[destinationLocation.lat, destinationLocation.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="text-sm font-semibold text-blue-600">🏥 Destination Hospital</div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Hospitals */}
        {nearbyHospitals.map((hospital) => (
          <Marker
            key={`nearby-hospital-${hospital.id}`}
            position={[hospital.lat, hospital.lng]}
            icon={smallHospitalIcon}
            eventHandlers={{
              click: () => {
                if (onHospitalSelect) {
                  onHospitalSelect({ lat: hospital.lat, lng: hospital.lng, name: hospital.name });
                }
              }
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-blue-600">{hospital.name}</p>
                <p className="text-gray-600">{hospital.type}</p>
                <p className="text-gray-600 text-xs mt-2">Click marker to select</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Traffic Signal Poles - always visible at every configured signal location */}
        {HYDERABAD_SIGNALS.map((signal) => (
          <Marker
            key={`pole-${signal.id}`}
            position={[signal.location.lat, signal.location.lng]}
            icon={createTrafficPoleIcon()}
          >
            <Tooltip>{signal.junctionName}</Tooltip>
          </Marker>
        ))}

        {/* Only selected-route signals light up with dynamic values */}
        {destinationLocation && liveRouteSignals && liveRouteSignals.map((signal) => {
          if (!signal || !signal.location) return null;
          const statusColor =
            signal.status.color === 'green'
              ? '#10b981'
              : signal.status.color === 'red'
                ? '#ef4444'
                : '#f59e0b';

          const currentStateLabel = (signal.status.color || '').toUpperCase();
          const countdownSeconds = Math.max(0, signal.status.nextChangeIn || 0);
          const signalValue = `${currentStateLabel} ${countdownSeconds}s`;
          const statusTextClass =
            signal.status.color === 'green'
              ? 'text-green-600'
              : signal.status.color === 'red'
                ? 'text-red-600'
                : 'text-amber-600';

          return (
            <CircleMarker
              key={`route-signal-${signal.id}-${signal.status.color}-${countdownSeconds}`}
              center={[signal.location.lat, signal.location.lng]}
              radius={9}
              pathOptions={{
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: 0.9,
                weight: 2,
              }}
              pane="markerPane"
            >
              <Tooltip direction="top" permanent>
                <span className="font-semibold text-xs">{signalValue}</span>
              </Tooltip>
              <Popup>
                <div className="text-sm" style={{ color: '#1f2937' }}>
                  <p className="font-bold text-blue-600">{signal.junctionName}</p>
                  <p className={`font-semibold ${statusTextClass}`}>
                    {signalValue}
                  </p>
                  <p className="text-gray-700">
                    Control: {signal.controlType === 'officer' ? 'Officer Operated' : 'Automatic Cycle'}
                  </p>
                  <p className="text-gray-600">Status: {signal.status.text}</p>
                  <p className="text-gray-600">Approach: {signal.side}</p>
                  {signal.status.waitTime > 0 && <p className="text-gray-700">Wait: {signal.status.waitTime}s</p>}
                  <p className="text-gray-700">Next change: {signal.status.nextChangeIn}s</p>
                  {signal.status.emergencyMode && <p className="text-red-600 font-bold animate-pulse">🚑 PREEMPTION ACTIVE</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DriverMap;
