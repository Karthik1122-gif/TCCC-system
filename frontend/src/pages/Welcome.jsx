import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #60a5fa 52%, #bae6fd 100%)' }}>
      <div className="max-w-4xl w-full px-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3m12 0h3M6 11V7m12 4V7m-6-4v4m0 10v4" />
              </svg>
            </div>
            <span className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>AmbulanceSync</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Welcome to TCCC
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,247,247,0.72)' }}>
            Traffic Command & Control Centre - Hyderabad
          </p>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Ambulance Driver Card */}
          <div 
            onClick={() => navigate('/login/driver')}
            className="glass-card p-8 cursor-pointer transition-all duration-300 hover:scale-105 group"
            style={{ borderColor: 'rgba(96,165,250,0.3)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" 
                style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3m12 0h3M6 11V7m12 4V7m-6-4v4m0 10v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Ambulance Driver
                </h3>
                <p className="text-sm" style={{ color: 'rgba(96,165,250,0.7)' }}>Emergency Response Team</p>
              </div>
            </div>
            
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,247,247,0.65)' }}>
              Access real-time navigation, hospital recommendations, and live traffic signal coordination for emergency response.
            </p>

            <div className="space-y-2 mb-6">
              {[
                'Live GPS Tracking',
                'AI Hospital Rankings',
                'Signal Override Alerts',
                'Route Optimization'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(147,197,253,0.9)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all group-hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)', color: '#ffffff' }}>
              Driver Sign In →
            </button>
          </div>

          {/* Traffic Police Card */}
          <div 
            onClick={() => navigate('/login/police')}
            className="glass-card p-8 cursor-pointer transition-all duration-300 hover:scale-105 group"
            style={{ borderColor: 'rgba(245,158,11,0.3)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" 
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Traffic Police
                </h3>
                <p className="text-sm" style={{ color: 'rgba(245,158,11,0.7)' }}>Control Centre Officer</p>
              </div>
            </div>
            
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,247,247,0.65)' }}>
              Monitor live ambulance movements, receive proximity alerts, and coordinate traffic signal clearance in your zone.
            </p>

            <div className="space-y-2 mb-6">
              {[
                'Live Ambulance Monitor',
                'Audio Proximity Alerts',
                'Junction Control Panel',
                'Real-time Coordination'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(252,211,77,0.9)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all group-hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' }}>
              Police Sign In →
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Hyderabad Traffic Command & Control Centre · Secure Government System
        </p>
      </div>
    </div>
  );
};

export default Welcome;
