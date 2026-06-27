import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';
import { useNavigate } from 'react-router-dom';
import DriverMap from '../components/DriverMap';
import { createGPSTracker, formatDistance } from '../utils/realtimeGPS';
import axios from 'axios';

const VoiceAssistant = lazy(() => import('../components/VoiceAssistant'));
const HospitalFinder = lazy(() => import('../components/HospitalFinder'));
const SignalProximityAlert = lazy(() => import('../components/SignalProximityAlert'));

const DriverDashboard = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const { connectSocket, disconnectSocket, emitLocationUpdate, emitTriggerAlarm, emitOfficerSignalRequest, isConnected } = useSocketStore();
  const [gpsReady, setGpsReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [destinationName, setDestinationName] = useState('');
  const [eta, setEta] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [sirenActive, setSirenActive] = useState(false);
  const [tab, setTab] = useState('map');
  const [signalAlerts, setSignalAlerts] = useState([]);
  const [routeSignals, setRouteSignals] = useState([]);
  const [requestedOfficerSignalIds, setRequestedOfficerSignalIds] = useState([]);
  const [routeOfficerContacts, setRouteOfficerContacts] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('initializing');
  const gpsTrackerRef = useRef(null);

  // Initialize GPS tracker with auto-recalculation
  useEffect(() => {
    connectSocket();
    
    if (navigator.geolocation) {
      setGpsReady(true);
      
      // Create GPS tracker instance
      gpsTrackerRef.current = createGPSTracker({
        recalculationThreshold: 50, // meters - recalculate route when moved 50m
        updateInterval: 2000, // 2 seconds
        
        onLocationUpdate: ({ position, distanceMoved, totalDistance: total }) => {
          setCurrentLocation(position);
          setTotalDistance(total);
          
          // Emit location update to backend
          emitLocationUpdate({ 
            ...position, 
            speed: position.speed, 
            heading: position.heading, 
            activeIncident: null,
            distanceMoved: distanceMoved
          });
        },
        
        onRouteRecalculation: ({ distanceMoved, reason }) => {
          console.log(`🔄 Route recalculation triggered: ${reason}, moved ${formatDistance(distanceMoved)}`);
          // DriverMap will automatically recalculate when currentLocation changes
          // Could emit socket event here if backend needs notification
        },
        
        onError: (errorInfo) => {
          console.error('GPS Error:', errorInfo.message);
          setGpsReady(false);
          setGpsStatus('error');
        },
        
        onStatusChange: ({ status, message }) => {
          setGpsStatus(status);
          setGpsReady(status === 'active');
          if (message) console.log('GPS Status:', message);
        }
      });
      
      // Start GPS tracking
      gpsTrackerRef.current.start();
    } else {
      console.error('Geolocation not supported');
      setGpsReady(false);
    }
    
    return () => {
      disconnectSocket();
      if (gpsTrackerRef.current) {
        gpsTrackerRef.current.stop();
      }
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleHospitalRanked = async (rankedData) => {
    setAiAnalysis(typeof rankedData.result === 'string' ? rankedData.result : JSON.stringify(rankedData));
    const mockDest = { lat: 17.444, lng: 78.461 };
    setDestinationLocation(mockDest);
    const { trainAndPredictETA } = await import('../utils/tfPredictor');
    const predicted = await trainAndPredictETA(5, 7);
    setEta(predicted);
    emitTriggerAlarm({ junctionId: 'nearest', junctionName: 'Begumpet Pipeline', eta: predicted, message: 'AI Auto-Dispatch' });
    setTab('ai');
  };

  const handleSelectHospital = (hospital) => {
    setDestinationLocation({ lat: hospital.lat, lng: hospital.lng });
    setDestinationName(hospital.name);
    setTab('map');
  };

  const handleSiren = () => {
    setSirenActive(true);
    emitTriggerAlarm({ junctionId: 'nearest', junctionName: 'Ahead', eta: 2, message: 'Manual SOS Emergency' });
    setTimeout(() => setSirenActive(false), 5000);
  };

  const officerSignalsOnSelectedRoute = routeSignals.filter((signal) => signal.controlType === 'officer');
  const encounteredSignalIds = useMemo(() => new Set((signalAlerts || []).map((s) => s.id)), [signalAlerts]);
  const encounteredOfficerSignals = useMemo(
    () => officerSignalsOnSelectedRoute.filter((signal) => encounteredSignalIds.has(signal.id)),
    [officerSignalsOnSelectedRoute, encounteredSignalIds]
  );
  const officerSignalRequestPayload = useMemo(() => {
    const deduped = Array.from(
      new Map(
        encounteredOfficerSignals.map((signal) => [
          signal.id,
          { signalId: signal.id, junctionName: signal.junctionName }
        ])
      ).values()
    );
    return deduped;
  }, [encounteredOfficerSignals]);
  const officerSignalPayloadKey = useMemo(
    () => officerSignalRequestPayload.map((item) => item.signalId).sort().join('|'),
    [officerSignalRequestPayload]
  );

  useEffect(() => {
    const fetchOfficerContacts = async () => {
      if (!user?.token || officerSignalRequestPayload.length === 0) {
        setRouteOfficerContacts([]);
        return;
      }

      try {
        const payload = {
          officerSignals: officerSignalRequestPayload
        };
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/officers-for-route`,
          payload,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        setRouteOfficerContacts(Array.isArray(data?.officers) ? data.officers : []);
      } catch (error) {
        console.error('Failed to fetch route officer contacts:', error);
        setRouteOfficerContacts([]);
      }
    };

    fetchOfficerContacts();
  }, [user?.token, officerSignalPayloadKey, officerSignalRequestPayload]);

  const handleOfficerSignalRequest = (signal) => {
    if (!signal?.id) return;

    emitOfficerSignalRequest({
      signalId: signal.id,
      junctionId: signal.id,
      junctionName: signal.junctionName,
      junctionLocation: signal.location,
      ambulanceLocation: currentLocation,
      eta: signal?.status?.nextChangeIn ? Math.max(1, Math.ceil(signal.status.nextChangeIn / 60)) : null,
      note: `Manual green request from ${user?.vehicleNumber || 'ambulance'}`,
    });

    setRequestedOfficerSignalIds((prev) => (prev.includes(signal.id) ? prev : [...prev, signal.id]));
  };

  const tabs = [
    { id: 'map',       label: '🗺 Live Map' },
    { id: 'hospitals', label: '🏥 Hospitals' },
    { id: 'signals',   label: `🚦 Signals${signalAlerts.length > 0 ? ` (${signalAlerts.length}!)` : ''}` },
    { id: 'ai',        label: '🤖 AI Dispatch' },
    { id: 'voice',     label: '🎤 Voice' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1e40af 0%, #60a5fa 55%, #bae6fd 100%)' }}>

      {/* Top Nav */}
      <nav className="nav-page sticky top-0 z-50 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center animate-pulsate"
              style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
              <span className="text-base">🚑</span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>AmbulanceSync</p>
              <p className="text-xs" style={{ color: 'rgba(96,165,250,0.72)' }}>Driver Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: gpsReady ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: gpsReady ? '#6ee7b7' : '#fca5a5', border: `1px solid ${gpsReady ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: gpsReady ? '#10b981' : '#ef4444' }}></span>
              GPS {gpsReady ? 'Active' : 'Searching'}
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: isConnected ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)', color: isConnected ? '#93c5fd' : '#fca5a5', border: `1px solid ${isConnected ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: isConnected ? '#3b82f6' : '#ef4444' }}></span>
              {isConnected ? 'Live' : 'Offline'}
            </div>
            <span className="hidden md:block text-sm" style={{ color: 'rgba(255,247,247,0.7)' }}>{user?.name}</span>
            <button onClick={handleLogout} className="btn-navy px-4 py-1.5 rounded-lg text-xs font-semibold">Logout</button>
          </div>
        </div>
      </nav>

      {/* Signal Proximity Flash */}
      {signalAlerts.length > 0 && (
        <div className="w-full py-2 text-center font-bold uppercase tracking-widest text-sm animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}>
          🚦 SIGNAL APPROACHING — {signalAlerts[0]?.junctionName} — {signalAlerts[0]?.distance}m away
        </div>
      )}

      <main className="flex-1 max-w-screen-xl mx-auto w-full p-6 space-y-5">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up">
          {[
            { label: 'Vehicle No.', value: user?.vehicleNumber || 'Unassigned', icon: '🚑' },
            { label: 'GPS Tracker', value: gpsReady ? formatDistance(totalDistance) : 'Searching', icon: '📡', subtitle: gpsReady ? gpsStatus : null },
            { label: 'Destination', value: destinationName || 'Not Set', icon: '🏥' },
            { label: 'TF.js ETA', value: eta ? `${eta} min` : 'Calculating', icon: '⏱' },
          ].map((s, i) => (
            <div key={i} className={`glass-card p-4 animate-fade-in-up delay-${(i + 1) * 100}`}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-xs mb-1" style={{ color: 'rgba(96,165,250,0.72)' }}>{s.label}</p>
              <p className="text-sm font-bold text-white truncate">{s.value}</p>
              {s.subtitle && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.subtitle}</p>}
            </div>
          ))}
        </div>

        {/* Emergency Siren */}
        <div className="glass-card p-4 flex items-center justify-between animate-fade-in-up delay-200">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(96,165,250,0.9)' }}>Emergency Signal Override</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Broadcasts SOS alarm to all police on your route
            </p>
          </div>
          <button onClick={handleSiren}
            className="px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs transition-all duration-300 whitespace-nowrap"
            style={{
              background: sirenActive ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #60a5fa, #2563eb)',
              color: 'white',
              boxShadow: sirenActive ? '0 0 30px rgba(239,68,68,0.8)' : '0 4px 15px rgba(239,68,68,0.3)',
              animation: sirenActive ? 'pulsate 0.5s infinite' : 'none'
            }}>
            {sirenActive ? '🔴 ALARM ACTIVE!' : '🚨 Trigger Siren'}
          </button>
        </div>

        {/* Tab Bar */}
        <div className="glass-card p-1.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="py-2.5 rounded-lg text-xs font-semibold transition-all duration-300"
              style={{
                background: tab === t.id ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'transparent',
                color: tab === t.id ? '#ffffff' : 'rgba(96,165,250,0.6)',
                boxShadow: tab === t.id ? '0 4px 12px rgba(96,165,250,0.35)' : 'none'
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Map Tab */}
        {tab === 'map' && (
          <div className="glass-card p-3 animate-fade-in" style={{ minHeight: '500px' }}>
            <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-sm font-bold" style={{ color: '#60a5fa' }}>🗺 Live Navigation — Hyderabad</h3>
              {destinationName && (
                <span className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
                  → {destinationName}
                </span>
              )}
            </div>
            <div style={{ height: '500px' }}>
              <DriverMap
                currentLocation={currentLocation}
                destinationLocation={destinationLocation}
                onHospitalSelect={handleSelectHospital}
                onRouteSignalsChange={setRouteSignals}
              />
            </div>

            {officerSignalsOnSelectedRoute.length > 0 && (
              <div className="mt-4 rounded-xl p-4 border"
                style={{ background: 'rgba(30,58,138,0.28)', borderColor: 'rgba(245,158,11,0.35)' }}>
                <p className="text-sm font-bold mb-3" style={{ color: '#fcd34d' }}>
                  👮 Officer-Operated Signals On Selected Route ({officerSignalsOnSelectedRoute.length})
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  Contact will appear below only when these signals are encountered (within 300m) and alert is sent.
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl p-4 border"
              style={{ background: 'rgba(15,23,42,0.45)', borderColor: 'rgba(34,197,94,0.35)' }}>
              <p className="text-sm font-bold mb-3" style={{ color: '#86efac' }}>
                🤝 Driver-Police Coordination Box
              </p>
              {routeOfficerContacts.length === 0 ? (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  No encountered officer-controlled signal yet on your selected route.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {routeOfficerContacts.map((officer) => (
                    <div key={`route-officer-contact-${officer.officerId}`} className="rounded-lg p-3"
                      style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <p className="text-sm font-semibold text-white">{officer.name}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(187,247,208,0.9)' }}>
                        Signal: {officer.matchedSignalJunction}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(148,163,184,0.9)' }}>
                        Junction: {officer.junctionLocation}
                      </p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#4ade80' }}>
                        📱 {officer.phoneNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Hospitals Tab */}
        {tab === 'hospitals' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
              🏥 Nearest Hospitals — Hyderabad
            </h3>
            <Suspense fallback={<p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Loading hospitals...</p>}>
              <HospitalFinder currentLocation={currentLocation} onSelectHospital={handleSelectHospital} />
            </Suspense>
          </div>
        )}

        {/* Signals Tab */}
        {tab === 'signals' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
              🚦 Signal Proximity Monitor (300m Radius)
            </h3>
            <Suspense fallback={<p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Loading signal monitor...</p>}>
              <SignalProximityAlert
                currentLocation={currentLocation}
                onSignalNear={(signals) => setSignalAlerts(signals)}
                onOfficerSignalRequest={handleOfficerSignalRequest}
                requestedOfficerSignalIds={requestedOfficerSignalIds}
                routeSignalIds={routeSignals.map((signal) => signal.id)}
              />
            </Suspense>
          </div>
        )}

        {/* AI Tab */}
        {tab === 'ai' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
              🤖 AI Dispatch Recommendation
            </h3>
            {aiAnalysis ? (
              <div className="rounded-lg p-4 text-sm leading-relaxed"
                style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(96,165,250,0.24)', color: 'rgba(255,247,247,0.85)' }}>
                {aiAnalysis}
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-5xl mb-4">🤖</p>
                <p className="font-semibold">No Recommendation Yet</p>
                <p className="text-sm mt-1">Use the Voice tab to issue a voice dispatch request.</p>
              </div>
            )}
            {eta && (
              <div className="mt-4 p-4 rounded-lg flex items-center gap-4"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <span className="text-3xl">⏱</span>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(147,197,253,0.7)' }}>TensorFlow.js Predicted ETA</p>
                  <p className="text-2xl font-bold text-blue-300">{eta} minutes</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Tab */}
        {tab === 'voice' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
              🎤 AI Voice Dispatch Assistant
            </h3>
            <Suspense fallback={<p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Loading voice assistant...</p>}>
              <VoiceAssistant onHospitalRanked={handleHospitalRanked} />
            </Suspense>
          </div>
        )}

        {/* GPS Coordinates */}
        {currentLocation && (
          <div className="glass-card px-6 py-4 flex items-center gap-4 animate-fade-in">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-xs" style={{ color: 'rgba(96,165,250,0.72)' }}>Live GPS Coordinates</p>
              <p className="font-mono text-sm font-bold" style={{ color: '#bfdbfe' }}>
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;






