import { useEffect, useState } from 'react';
import useSocketStore from '../store/useSocketStore';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { HYDERABAD_SIGNALS, HYDERABAD_HOSPITALS } from '../utils/hyderabadData';
import { getDistance, isNearSignal } from '../utils/haversine';
import { playEmergencyAlarm } from '../utils/audioAlarm';

const ControlCenter = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const { connectSocket, disconnectSocket, activeAmbulances, isConnected, alarms } = useSocketStore();
  const [tab, setTab] = useState('overview');
  const [signalStatuses, setSignalStatuses] = useState(
    HYDERABAD_SIGNALS.reduce((acc, s) => ({ ...acc, [s.id]: { ...s, extended: false } }), {})
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    connectSocket();
    // Refresh analytics every 5s
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => { disconnectSocket(); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (alarms.length > 0) playEmergencyAlarm();
  }, [alarms]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const units = Object.values(activeAmbulances);

  // Calculate which signals are near any ambulance
  const signalsUnderAlert = HYDERABAD_SIGNALS.filter(sig =>
    units.some(amb => isNearSignal(amb.location.lat, amb.location.lng, sig.location.lat, sig.location.lng, 300).isNear)
  );

  const extendSignal = (signalId) => {
    setSignalStatuses(prev => ({
      ...prev,
      [signalId]: { ...prev[signalId], extended: true, currentGreenTime: prev[signalId].currentGreenTime + 30 }
    }));
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'ambulances', label: `🚑 Ambulances (${units.length})` },
    { id: 'signals', label: `🚦 Signals (${signalsUnderAlert.length} Alert)` },
    { id: 'hospitals', label: '🏥 Hospitals' },
    { id: 'alarms', label: `🚨 Alarms (${alarms.length})` },
  ];

  const Analytics = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Active Ambulances', value: units.length, icon: '🚑', color: '#3b82f6' },
        { label: 'Signal Alerts', value: signalsUnderAlert.length, icon: '🚦', color: '#ef4444' },
        { label: 'Triggered Alarms', value: alarms.length, icon: '🚨', color: '#f59e0b' },
        { label: 'Hospitals Online', value: HYDERABAD_HOSPITALS.length, icon: '🏥', color: '#10b981' },
      ].map((s, i) => (
        <div key={i} className={`glass-card p-5 animate-fade-in-up delay-${(i + 1) * 100}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">{s.icon}</span>
            <span className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
          <p className="text-xs font-medium" style={{ color: 'rgba(96,165,250,0.78)' }}>{s.label}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1e40af 0%, #60a5fa 55%, #bae6fd 100%)' }}>

      {/* Top Nav */}
      <nav className="nav-page sticky top-0 z-50 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
              <span>🏛</span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>
                TCCC Control Center
              </p>
              <p className="text-xs" style={{ color: 'rgba(96,165,250,0.72)' }}>
                Hyderabad Traffic Command & Control Centre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isConnected ? '#6ee7b7' : '#fca5a5', border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isConnected ? '#10b981' : '#ef4444' }}></span>
              {isConnected ? 'Control Center Live' : 'Reconnecting...'}
            </div>
            <span className="text-sm hidden sm:inline" style={{ color: 'rgba(255,247,247,0.7)' }}>{user?.name}</span>
            <button onClick={handleLogout} className="btn-navy px-4 py-1.5 rounded-lg text-xs font-semibold">Exit</button>
          </div>
        </div>
      </nav>

      {/* Alert Banner */}
      {signalsUnderAlert.length > 0 && (
        <div className="text-center py-2 font-bold text-sm uppercase tracking-widest animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}>
          🚨 {signalsUnderAlert.length} Signal Junction{signalsUnderAlert.length > 1 ? 's' : ''} Require Immediate Clearance
        </div>
      )}

      <main className="flex-1 max-w-screen-xl mx-auto w-full p-6 space-y-5">

        <Analytics />

        {/* Tabs */}
        <div className="glass-card p-1.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="py-2.5 rounded-lg text-xs font-semibold transition-all duration-300"
              style={{
                background: tab === t.id ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'transparent',
                color: tab === t.id ? '#ffffff' : 'rgba(96,165,250,0.6)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {/* System Flow */}
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
                System Flow Status
              </h3>
              <div className="space-y-3">
                {[
                  { step: '1', label: 'Driver starts trip', status: units.length > 0 ? 'active' : 'idle', icon: '🚑' },
                  { step: '2', label: 'GPS sends location (3s interval)', status: units.length > 0 ? 'active' : 'idle', icon: '📡' },
                  { step: '3', label: 'System scans nearby signals (300m)', status: 'active', icon: '🔍' },
                  { step: '4', label: 'Police dashboard receives alert', status: signalsUnderAlert.length > 0 ? 'alert' : 'idle', icon: '👮' },
                  { step: '5', label: 'Signal extended for ambulance', status: Object.values(signalStatuses).some(s => s.extended) ? 'active' : 'idle', icon: '🚦' },
                  { step: '6', label: 'Ambulance passes junction', status: 'idle', icon: '✅' },
                ].map(f => (
                  <div key={f.step} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      background: f.status === 'active' ? 'rgba(16,185,129,0.1)' : f.status === 'alert' ? 'rgba(239,68,68,0.1)' : 'rgba(30,58,138,0.30)',
                      borderLeft: `3px solid ${f.status === 'active' ? '#10b981' : f.status === 'alert' ? '#ef4444' : 'rgba(96,165,250,0.35)'}`
                    }}>
                    <span className="text-gray-400 text-xs font-mono w-4">{f.step}</span>
                    <span className="text-base">{f.icon}</span>
                    <span className="text-sm text-white flex-1">{f.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold`}
                      style={{
                        background: f.status === 'active' ? 'rgba(16,185,129,0.2)' : f.status === 'alert' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                        color: f.status === 'active' ? '#6ee7b7' : f.status === 'alert' ? '#fca5a5' : 'rgba(255,255,255,0.3)'
                      }}>
                      {f.status === 'active' ? '● ACTIVE' : f.status === 'alert' ? '● ALERT' : '○ IDLE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alarms */}
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Recent Emergency Log
              </h3>
              {alarms.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <p className="text-4xl mb-2">🔕</p>
                  <p className="text-sm">No emergency alarms recorded.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {[...alarms].reverse().map((al, idx) => (
                    <div key={idx} className="p-3 rounded-lg border"
                      style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-white">{al.message}</p>
                        <span className="text-xs" style={{ color: 'rgba(96,165,250,0.72)' }}>ETA: {al.eta}m</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Junction: {al.junctionName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ambulances Tab */}
        {tab === 'ambulances' && (
          <div className="animate-fade-in">
            {units.length === 0 ? (
              <div className="glass-card p-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-6xl mb-4">🚑</p>
                <p className="text-lg font-semibold">No Active Ambulances</p>
                <p className="text-sm mt-2">Ambulances appear here when drivers log in and share GPS.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((amb, i) => {
                  const nearestHospital = HYDERABAD_HOSPITALS.reduce((nearest, h) => {
                    const d = getDistance(amb.location.lat, amb.location.lng, h.lat, h.lng);
                    return d < nearest.dist ? { hospital: h, dist: d } : nearest;
                  }, { hospital: null, dist: Infinity });

                  return (
                    <div key={amb.driverId} className={`glass-card p-5 animate-fade-in-up delay-${Math.min(i * 100, 400)}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-white">{amb.driverName}</p>
                          <p className="text-xs font-mono px-2 py-0.5 rounded mt-1 inline-block"
                            style={{ background: 'rgba(96,165,250,0.2)', color: '#bfdbfe' }}>{amb.vehicleNumber}</p>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="p-2 rounded" style={{ background: 'rgba(30,58,138,0.35)' }}>
                          <p style={{ color: 'rgba(96,165,250,0.6)' }}>Lat</p>
                          <p className="font-mono text-white">{amb.location.lat?.toFixed(5)}</p>
                        </div>
                        <div className="p-2 rounded" style={{ background: 'rgba(30,58,138,0.35)' }}>
                          <p style={{ color: 'rgba(96,165,250,0.6)' }}>Lng</p>
                          <p className="font-mono text-white">{amb.location.lng?.toFixed(5)}</p>
                        </div>
                      </div>
                      {nearestHospital.hospital && (
                        <div className="text-xs p-2 rounded border"
                          style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <p style={{ color: '#6ee7b7' }}>🏥 Nearest: {nearestHospital.hospital.name}</p>
                          <p style={{ color: 'rgba(255,255,255,0.4)' }}>{(nearestHospital.dist / 1000).toFixed(1)} km away</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Signals Tab */}
        {tab === 'signals' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HYDERABAD_SIGNALS.map((signal, i) => {
              const status = signalStatuses[signal.id];
              const isAlert = signalsUnderAlert.some(s => s.id === signal.id);
              return (
                <div key={signal.id} className={`glass-card p-5 border transition-all animate-fade-in-up delay-${Math.min(i * 100, 400)}`}
                  style={{ borderColor: isAlert ? 'rgba(239,68,68,0.6)' : status?.extended ? 'rgba(16,185,129,0.4)' : 'rgba(96,165,250,0.2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-white text-sm">{signal.junctionName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold`}
                      style={{
                        background: isAlert ? 'rgba(239,68,68,0.2)' : status?.extended ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                        color: isAlert ? '#fca5a5' : status?.extended ? '#6ee7b7' : '#93c5fd'
                      }}>
                      {isAlert ? '🚨 ALERT' : status?.extended ? '🟢 EXTENDED' : '● NORMAL'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-2 rounded text-center" style={{ background: 'rgba(30,58,138,0.35)' }}>
                      <p style={{ color: 'rgba(96,165,250,0.6)' }}>Green Time</p>
                      <p className="font-bold text-white">{status?.currentGreenTime}s</p>
                    </div>
                    <div className="p-2 rounded text-center" style={{ background: 'rgba(30,58,138,0.35)' }}>
                      <p style={{ color: 'rgba(96,165,250,0.6)' }}>Status</p>
                      <p className="font-bold text-white">{status?.extended ? '+30s' : 'Default'}</p>
                    </div>
                  </div>
                  {!status?.extended ? (
                    <button onClick={() => extendSignal(signal.id)}
                      className="btn-navy w-full py-1.5 rounded-lg text-xs font-semibold transition-all">
                      🟢 Extend Green (+30s)
                    </button>
                  ) : (
                    <div className="py-1.5 text-center text-xs font-semibold rounded-lg"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
                      ✓ Signal Extended
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hospitals Tab */}
        {tab === 'hospitals' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HYDERABAD_HOSPITALS.map((h, i) => (
              <div key={h.id} className={`glass-card p-4 border animate-fade-in-up delay-${Math.min(i * 100, 400)}`}
                style={{ borderColor: 'rgba(96,165,250,0.2)' }}>
                <div className="text-2xl mb-2">🏥</div>
                <p className="font-bold text-white text-sm">{h.name}</p>
                <p className="text-xs mb-3" style={{ color: 'rgba(96,165,250,0.72)' }}>{h.area}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Type</span>
                    <span className="text-white font-medium">{h.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Beds</span>
                    <span className="text-white font-medium">{h.beds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Rating</span>
                    <span style={{ color: '#bfdbfe' }} className="font-bold">{h.rating}/5</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'rgba(96,165,250,0.2)', color: 'rgba(96,165,250,0.6)' }}>
                  📞 {h.phone}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alarms Tab */}
        {tab === 'alarms' && (
          <div className="animate-fade-in space-y-3">
            {alarms.length === 0 ? (
              <div className="glass-card p-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-6xl mb-4">🔕</p>
                <p className="text-lg font-semibold">No Alarms Triggered</p>
              </div>
            ) : alarms.map((al, idx) => (
              <div key={idx} className="glass-card p-5 border flex items-center gap-4 animate-fade-in-up"
                style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)' }}>
                  <span className="text-xl">🚨</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{al.message}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Junction: {al.junctionName} · ETA: {al.eta} min
                  </p>
                </div>
                <button onClick={() => extendSignal(al.junctionId)} className="btn-gold px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Clear Path
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ControlCenter;






