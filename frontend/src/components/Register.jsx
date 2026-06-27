import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link, useParams } from 'react-router-dom';

const Register = () => {
  const { accountType } = useParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: accountType || 'driver', vehicleNumber: '', junctionLocation: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'police' && !/^\d{10}$/.test(formData.phoneNumber.trim())) {
      alert('Enter a valid 10-digit phone number for police officer account.');
      return;
    }
    setLoading(true);
    await register(formData);
    setLoading(false);
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      if (currentUser.role === 'police') navigate('/police');
      else navigate('/driver');
    }
  };

  const roleColor = formData.role === 'police' ? '#f59e0b' : '#60a5fa';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #60a5fa 52%, #bae6fd 100%)' }}>
      <div className="w-full max-w-lg animate-fade-in-up">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3m12 0h3M6 11V7m12 4V7m-6-4v4m0 10v4" />
              </svg>
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>AmbulanceSync</span>
          </div>
          <h2 className="text-3xl font-bold text-gold-gradient" style={{ fontFamily: 'Oswald, sans-serif' }}>Create Account</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(37,99,235,0.55)' }}>Register as a Driver or Traffic Police Officer</p>
        </div>

        {/* Role Picker */}
        <div className="glass-card p-1.5 mb-6 grid grid-cols-2 gap-1">
          {['driver', 'police'].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setFormData({ ...formData, role: r });
                navigate(r === 'driver' ? '/register/driver' : '/register/police', { replace: true });
              }}
              className="py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: formData.role === r ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'transparent',
                color: formData.role === r ? '#ffffff' : 'rgba(96,165,250,0.6)',
                boxShadow: formData.role === r ? '0 4px 12px rgba(96,165,250,0.4)' : 'none'
              }}
            >
              {r === 'driver' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" />
                  </svg>
                  Ambulance Driver
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Traffic Police
                </>
              )}
            </button>
          ))}
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm border animate-fade-in"
              style={{ background: 'rgba(96,165,250,0.14)', borderColor: 'rgba(96,165,250,0.35)', color: '#fca5a5' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-100">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <input type="text" name="name" onChange={handleChange} className="input-classic" placeholder="Your name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </label>
                <input type="email" name="email" onChange={handleChange} className="input-classic" placeholder="email@tccc.gov.in" required />
              </div>
            </div>

            <div className="animate-fade-in-up delay-200">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <input type="password" name="password" onChange={handleChange} className="input-classic" placeholder="Min. 8 characters" required />
            </div>

            {formData.role === 'driver' && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-5 4h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Ambulance Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="input-classic"
                  placeholder="e.g. TS09EM1234"
                  required
                />
              </div>
            )}

            {formData.role === 'police' && (
              <>
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.895 1.368l1.076 3.229a2 2 0 01-.45 2.11l-1.548 1.547a16 16 0 006.586 6.586l1.547-1.547a2 2 0 012.11-.45l3.23 1.076A2 2 0 0121 18.72V22a2 2 0 01-2 2h-1C9.716 24 0 14.284 0 2V1a2 2 0 012-2h1z" />
                    </svg>
                    Officer Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="input-classic"
                    placeholder="e.g. 9876543210"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="animate-fade-in-up">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(96,165,250,0.8)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Assigned Junction / Zone
                  </label>
                  <input
                    type="text"
                    name="junctionLocation"
                    value={formData.junctionLocation}
                    onChange={handleChange}
                    className="input-classic"
                    placeholder="e.g. Banjara Hills Intersection"
                    required
                  />
                </div>
              </>
            )}

            {/* Info Box */}
            <div className="rounded-lg p-3 text-xs flex gap-2" style={{ background: 'rgba(37,99,235,0.08)', borderLeft: `3px solid ${roleColor}`, color: 'rgba(255,247,247,0.6)' }}>
              {formData.role === 'driver' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>As a driver, you will share your live GPS location and receive AI-ranked hospital recommendations.</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>As a traffic officer, you will monitor active ambulances and receive real-time audio alerts at your junction.</span>
                </>
              )}
            </div>

            <div className="pt-3 animate-fade-in-up delay-300">
              <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-lg text-sm uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-navy/50 border-t-navy animate-spin"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register as {formData.role === 'driver' ? 'Ambulance Driver' : 'Police Officer'}
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link to={`/login/${formData.role}`} className="font-semibold hover:underline" style={{ color: '#60a5fa' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;






