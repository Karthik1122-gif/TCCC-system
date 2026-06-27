import { useState, useEffect, useMemo } from 'react';
import { HYDERABAD_SIGNALS } from '../utils/hyderabadData';
import { isNearSignal } from '../utils/haversine';

/**
 * SignalProximityAlert
 * Checks ambulance location against all Hyderabad signals using Haversine.
 * Shows a real-time alert when ambulance is within 300m of a signal.
 */
const SignalProximityAlert = ({
  currentLocation,
  onSignalNear,
  onOfficerSignalRequest,
  requestedOfficerSignalIds = [],
  routeSignalIds = []
}) => {
  const [signalStatuses, setSignalStatuses] = useState(
    HYDERABAD_SIGNALS.reduce((acc, s) => ({ ...acc, [s.id]: { ...s, extended: false } }), {})
  );

  const nearbySignals = useMemo(() => {
    if (!currentLocation) return [];

    const allowedRouteIds = new Set(routeSignalIds);
    const shouldFilterByRoute = allowedRouteIds.size > 0;

    return HYDERABAD_SIGNALS.map(signal => {
      if (shouldFilterByRoute && !allowedRouteIds.has(signal.id)) {
        return null;
      }

      const { isNear, distance } = isNearSignal(
        currentLocation.lat, currentLocation.lng,
        signal.location.lat, signal.location.lng,
        300
      );
      return isNear ? { ...signal, distance } : null;
    }).filter(Boolean);
  }, [currentLocation, routeSignalIds]);

  useEffect(() => {
    if (nearbySignals.length > 0 && onSignalNear) {
      onSignalNear(nearbySignals);
    }
  }, [nearbySignals, onSignalNear]);

  const extendSignal = (signalId) => {
    setSignalStatuses(prev => ({
      ...prev,
      [signalId]: { ...prev[signalId], extended: true, currentGreenTime: prev[signalId].currentGreenTime + 30 }
    }));
  };

  return (
    <div className="space-y-3">
      {nearbySignals.length === 0 ? (
        <div className="p-6 text-center rounded-xl"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px dashed rgba(16,185,129,0.3)' }}>
          <p className="text-2xl mb-2">🟢</p>
          <p className="font-semibold text-sm" style={{ color: '#6ee7b7' }}>All Clear</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No signals within 300m of current location
          </p>
        </div>
      ) : (
        nearbySignals.map(sig => {
          const status = signalStatuses[sig.id];
          const isOfficerSignal = sig.controlType === 'officer';
          const isOfficerRequestSent = requestedOfficerSignalIds.includes(sig.id);

          return (
            <div key={sig.id} className="p-4 rounded-xl border animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 15px rgba(239,68,68,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#ef4444' }}></span>
                <span className="font-bold text-sm text-red-300">⚠ ALERT: Signal Approaching</span>
              </div>
              <p className="font-semibold text-white">{sig.junctionName}</p>
              <p className="text-xs mt-1" style={{ color: isOfficerSignal ? '#fcd34d' : 'rgba(191,219,254,0.9)' }}>
                {isOfficerSignal ? 'Officer-operated signal' : 'Automatic signal cycle'}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2 rounded" style={{ background: 'rgba(30,58,138,0.35)' }}>
                  <p style={{ color: 'rgba(96,165,250,0.72)' }}>Distance</p>
                  <p className="font-bold text-white">{sig.distance} m</p>
                </div>
                <div className="p-2 rounded" style={{ background: 'rgba(30,58,138,0.35)' }}>
                  <p style={{ color: 'rgba(96,165,250,0.72)' }}>Green Time</p>
                  <p className="font-bold text-white">{status?.currentGreenTime}s {status?.extended ? '+30s' : ''}</p>
                </div>
              </div>
              {isOfficerSignal ? (
                isOfficerRequestSent ? (
                  <div className="mt-3 py-2 text-center text-xs font-semibold rounded-lg"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)' }}>
                    ✓ Request sent to traffic officer
                  </div>
                ) : (
                  <button
                    onClick={() => onOfficerSignalRequest && onOfficerSignalRequest(sig)}
                    className="mt-3 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
                    📡 Send Signal To Officer
                  </button>
                )
              ) : !status?.extended ? (
                <button
                  onClick={() => extendSignal(sig.id)}
                  className="btn-gold mt-3 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                  🟢 Extend Green Signal (+30s)
                </button>
              ) : (
                <div className="mt-3 py-2 text-center text-xs font-semibold rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
                  ✓ Signal Extended — Ambulance Priority Active
                </div>
              )}
            </div>
          );
        })
      )}

      {/* All Signals Overview */}
      <div className="mt-4">
        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(96,165,250,0.72)' }}>HYDERABAD SIGNAL MAP</p>
        <div className="grid grid-cols-2 gap-2">
          {HYDERABAD_SIGNALS.slice(0, 6).map(s => {
            const status = signalStatuses[s.id];
            const isNear = nearbySignals.some(n => n.id === s.id);
            return (
              <div key={s.id} className="p-2 rounded-lg text-xs border"
                style={{
                  background: isNear ? 'rgba(239,68,68,0.1)' : status?.extended ? 'rgba(16,185,129,0.08)' : 'rgba(30,58,138,0.30)',
                  borderColor: isNear ? 'rgba(239,68,68,0.4)' : status?.extended ? 'rgba(16,185,129,0.3)' : 'rgba(96,165,250,0.2)'
                }}>
                <p className="font-medium text-white truncate">{s.junctionName}</p>
                <p style={{ color: 'rgba(96,165,250,0.6)' }}>
                  {isNear ? '🚨 Amber Alert' : status?.extended ? '🟢 Extended' : `🔵 ${s.currentGreenTime}s`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SignalProximityAlert;




