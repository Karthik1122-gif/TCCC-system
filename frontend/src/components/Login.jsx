import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link, useParams } from 'react-router-dom';

const Login = () => {
  const { accountType } = useParams();
  const [role, setRole] = useState(accountType || 'driver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      // Validate that user is logging into correct account type
      if (currentUser.role !== role) {
        useAuthStore.getState().logout();
        useAuthStore.setState({ error: `This is a ${currentUser.role} account. Please use the ${currentUser.role} login page.` });
        return;
      }
      if (currentUser.role === 'police') navigate('/police');
      else navigate('/driver');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #60a5fa 52%, #bae6fd 100%)' }}>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-5 border-2 border-yellow-400"></div>
        <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full opacity-5 border border-yellow-400"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-5 border border-yellow-400"></div>

        {/* Logo Area */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3m12 0h3M6 11V7m12 4V7m-6-4v4m0 10v4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>AmbulanceSync</span>
          </div>
          <div className="w-12 h-0.5" style={{ background: 'linear-gradient(90deg, #60a5fa, transparent)' }}></div>
        </div>

        {/* Center Content */}
        <div className="animate-fade-in-up delay-200">
          <h1 className="text-5xl font-bold leading-tight mb-6" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>
            Hyderabad<br />
            <span className="text-gold-gradient">Traffic Command</span><br />
            & Control Centre
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,247,247,0.72)' }}>
            Real-time ambulance coordination platform for traffic police and emergency dispatch. AI-powered, live-tracked, and mission-critical.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { label: 'Ambulances Live', value: '24/7' },
              { label: 'Avg Response', value: '4.2m' },
              { label: 'Hyderabad Coverage', value: '100%' },
            ].map((s, i) => (
              <div key={i} className={`animate-fade-in-up delay-${(i + 3) * 100}`}>
                <p className="text-2xl font-bold text-gold-gradient">{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,247,247,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="animate-fade-in delay-500">
          <p className="text-xs italic" style={{ color: 'rgba(255,247,247,0.35)' }}>
            "Every second matters. Every route matters."
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3m12 0h3M6 11V7m12 4V7m-6-4v4m0 10v4" />
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>AmbulanceSync</span>
          </div>

          <div className="glass-card p-10 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Welcome Back
              </h2>
              <p className="text-sm" style={{ color: 'rgba(96,165,250,0.78)' }}>
                Sign in to your {role === 'driver' ? 'Ambulance Driver' : 'Traffic Police'} account
              </p>
            </div>

            {/* Role Selector */}
            <div className="glass-card p-1.5 mb-6 grid grid-cols-2 gap-1">
              {['driver', 'police'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    navigate(r === 'driver' ? '/login/driver' : '/login/police', { replace: true });
                  }}
                  className="py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: role === r ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'transparent',
                    color: role === r ? '#ffffff' : 'rgba(96,165,250,0.6)',
                    boxShadow: role === r ? '0 4px 12px rgba(96,165,250,0.4)' : 'none'
                  }}
                >
                  {r === 'driver' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                      </svg>
                      Driver
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Police
                    </>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg text-sm border animate-fade-in"
                style={{ background: 'rgba(96,165,250,0.14)', borderColor: 'rgba(96,165,250,0.35)', color: '#fca5a5' }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="animate-fade-in-up delay-100">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    className="input-classic pl-12"
                    placeholder={role === 'driver' ? 'driver@ambulance.com' : 'officer@police.gov.in'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="animate-fade-in-up delay-200">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    className="input-classic pl-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="animate-fade-in-up delay-300 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3 px-6 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-navy/50 border-t-navy animate-spin"></span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In to Dashboard
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              New {role === 'driver' ? 'driver' : 'officer'} account?{' '}
              <Link to={`/register/${role}`} className="font-semibold hover:underline transition" style={{ color: '#60a5fa' }}>
                Register Here
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Hyderabad TCCC · Secure Government System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;




