import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';
import { useNavigate } from 'react-router-dom';
import PoliceMap from '../components/PoliceMap';
import { playEmergencyAlarm } from '../utils/audioAlarm';

const PoliceDashboard = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const { connectSocket, disconnectSocket, activeAmbulances, isConnected, alarms, officerSignalRequests } = useSocketStore();
  const [handledSignalRequests, setHandledSignalRequests] = useState({});
  const [view, setView] = useState('map'); // 'map' | 'units' | 'alarms'
  const hasActiveAlerts = alarms.length > 0 || officerSignalRequests.length > 0;

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    if (hasActiveAlerts) {
      playEmergencyAlarm();
    }
  }, [hasActiveAlerts]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleExtendSignal = (junctionId) => {
    console.log(`Extending green time for junction ${junctionId}`);
    alert('✅ Signal green time extended by 30s!');
  };

  const handleOfficerRequestResolved = (requestId) => {
    setHandledSignalRequests((prev) => ({ ...prev, [requestId]: true }));
  };

  const units = Object.values(activeAmbulances);
  const recentAmbulanceSignalAlerts = officerSignalRequests.slice(0, 6);
  const tabs = [
    { id: 'map', label: '🗺 Live Grid' },
    { id: 'units', label: `🚑 Units (${units.length})` },
    { id: 'alarms', label: `🚨 Alerts (${alarms.length + officerSignalRequests.length})` },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1e40af 0%, #60a5fa 55%, #bae6fd 100%)' }}>

      {/* Top Nav */}
      <nav className="nav-page sticky top-0 z-50 px-6 py-4" style={{ borderBottomColor: hasActiveAlerts ? 'rgba(239,68,68,0.8)' : undefined }}>
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: hasActiveAlerts ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #f59e0b, #92400e)', animation: hasActiveAlerts ? 'pulsate 0.4s infinite' : 'none' }}>
              <span className="text-base">👮</span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: hasActiveAlerts ? '#fca5a5' : '#ffffff' }}>TCCC Police Dashboard</p>
              <p className="text-xs" style={{ color: 'rgba(96,165,250,0.72)' }}>Hyderabad Traffic Command & Control</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(alarms.length > 0 || officerSignalRequests.length > 0) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold animate-pulsate"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.5)' }}>
                🚨 {alarms.length + officerSignalRequests.length} Active Alert{alarms.length + officerSignalRequests.length > 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isConnected ? '#6ee7b7' : '#fca5a5', border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: isConnected ? '#10b981' : '#ef4444' }}></span>
              {isConnected ? 'Live TCCC Feed' : 'Reconnecting'}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: 'rgba(255,247,247,0.7)' }}>
              <span>{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-navy px-4 py-1.5 rounded-lg text-xs font-semibold">Logout</button>
          </div>
        </div>
      </nav>

      {/* Alarm Flash Banner */}
      {hasActiveAlerts && (
        <div className="w-full py-3 text-center font-bold uppercase tracking-widest text-sm animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}>
          🚨 EMERGENCY ALERT — AMBULANCE APPROACHING JUNCTION 🚨
        </div>
      )}

      <main className="flex-1 max-w-screen-xl mx-auto w-full p-6 space-y-5">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in-up">
          {[
            { label: 'Active Units', value: units.length, icon: '🚑' },
            { label: 'Active Alarms', value: alarms.length, icon: '🚨' },
            { label: 'Officer Requests', value: officerSignalRequests.length, icon: '📡' },
            { label: 'Server Status', value: isConnected ? 'Online' : 'Offline', icon: '📡' },
            { label: 'Officer', value: user?.name || 'Unknown', icon: '👮' },
          ].map((s, i) => (
            <div key={i} className={`glass-card p-4 animate-fade-in-up delay-${(i + 1) * 100}`}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-xs mb-1" style={{ color: 'rgba(96,165,250,0.72)' }}>{s.label}</p>
              <p className="text-lg font-bold text-white truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Driver-Police Coordination Box */}
        <div className="glass-card p-4 animate-fade-in-up">
          <p className="text-sm font-bold mb-3" style={{ color: '#fcd34d' }}>
            🤝 Police-Driver Coordination Box
          </p>
          {recentAmbulanceSignalAlerts.length === 0 ? (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              No ambulance signal alert received yet. Ambulance numbers will be saved here after driver sends officer alert at encountered signal.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentAmbulanceSignalAlerts.map((req) => (
                <div key={`coord-${req.requestId}`} className="rounded-lg p-3"
                  style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <p className="text-sm font-semibold text-white">{req.junctionName}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Driver: {req.driverName}
                  </p>
                  <p className="text-xs font-bold" style={{ color: '#fde68a' }}>
                    Ambulance No: {req.vehicleNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="glass-card p-1.5 grid grid-cols-3 gap-1 animate-fade-in-up delay-200">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className="py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                background: view === t.id ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'transparent',
                color: view === t.id ? '#ffffff' : 'rgba(96,165,250,0.6)',
                boxShadow: view === t.id ? '0 4px 12px rgba(96,165,250,0.35)' : 'none'
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Live Map Tab */}
        {view === 'map' && (
          <div className="glass-card p-3 animate-fade-in" style={{ minHeight: '500px' }}>
            <h3 className="text-sm font-bold mb-3 px-2" style={{ color: '#60a5fa' }}>🗺 Live Ambulance Tracking — Hyderabad TCCC Grid</h3>
            <div style={{ height: '500px' }}>
              <PoliceMap activeAmbulances={activeAmbulances} />
            </div>
          </div>
        )}

        {/* Units Tab */}
        {view === 'units' && (
          <div className="animate-fade-in space-y-3">
            {units.length === 0 ? (
              <div className="glass-card p-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-5xl mb-4">🚑</p>
                <p className="font-semibold">No Active Ambulances</p>
                <p className="text-sm mt-1">Ambulance drivers will appear here when they log in.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {units.map((amb, i) => (
                  <div key={amb.driverId} className={`glass-card p-5 border hover:border-yellow-500/50 transition-all duration-300 animate-fade-in-up delay-${Math.min(i * 100, 400)}`}
                    style={{ borderColor: 'rgba(96,165,250,0.24)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-white text-lg">{amb.driverName}</p>
                        <p className="text-xs font-mono px-2 py-0.5 rounded mt-1 inline-block"
                          style={{ background: 'rgba(96,165,250,0.2)', color: '#bfdbfe' }}>{amb.vehicleNumber}</p>
                      </div>
                      <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      {[
                        { label: 'LAT', value: amb.location.lat?.toFixed(4) },
                        { label: 'LNG', value: amb.location.lng?.toFixed(4) },
                        { label: 'SPEED', value: amb.location.speed ? (amb.location.speed * 3.6).toFixed(1) + ' km/h' : '0' },
                      ].map(d => (
                        <div key={d.label} className="rounded-lg p-2" style={{ background: 'rgba(30,58,138,0.35)' }}>
                          <p className="text-xs" style={{ color: 'rgba(37,99,235,0.55)' }}>{d.label}</p>
                          <p className="text-sm font-mono font-bold text-white">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleExtendSignal(amb.driverId)}
                      className="btn-gold w-full py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all">
                      🟢 Extend Signal Green
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alarms Tab */}
        {view === 'alarms' && (
          <div className="animate-fade-in space-y-3">
            {alarms.length === 0 && officerSignalRequests.length === 0 ? (
              <div className="glass-card p-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-5xl mb-4">🔕</p>
                <p className="font-semibold">No Alerts Triggered</p>
                <p className="text-sm mt-1">All clear at your junction.</p>
              </div>
            ) : (
              <>
                {officerSignalRequests.map((req) => {
                  const isHandled = handledSignalRequests[req.requestId];
                  return (
                    <div key={req.requestId} className="glass-card p-4 flex items-center gap-4 border animate-fade-in-up"
                      style={{ borderColor: 'rgba(59,130,246,0.45)' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.5)' }}>
                        <span className="text-xl">📡</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Officer Manual Request: {req.junctionName}</p>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          Ambulance {req.vehicleNumber} ({req.driverName}) requested manual green signal
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(191,219,254,0.8)' }}>
                          {req.eta ? `ETA ${req.eta} min` : 'ETA unavailable'}
                        </p>
                      </div>
                      {isHandled ? (
                        <div className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                          style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
                          Turned Green
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOfficerRequestResolved(req.requestId)}
                          className="btn-gold px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Mark As Green
                        </button>
                      )}
                    </div>
                  );
                })}

                {alarms.map((al, idx) => (
                  <div key={`${al.junctionId || idx}-${idx}`} className="glass-card p-4 flex items-center gap-4 border animate-fade-in-up"
                    style={{ borderColor: 'rgba(239,68,68,0.35)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
                      <span className="text-xl">🚨</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{al.message || 'Emergency Alert'}</p>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Junction: {al.junctionName} · ETA: {al.eta} min</p>
                    </div>
                    <button onClick={() => handleExtendSignal(al.junctionId)} className="btn-gold px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                      Clear Path
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PoliceDashboard;






