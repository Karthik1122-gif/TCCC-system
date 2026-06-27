import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Welcome from './pages/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import DriverDashboard from './pages/DriverDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import ControlCenter from './pages/ControlCenter';

function App() {
  const user = useAuthStore((state) => state.user);

  const getDefaultRoute = () => {
    if (!user) return '/';
    if (user.role === 'police') return '/police';
    if (user.role === 'admin' || user.role === 'control') return '/control';
    return '/driver';
  };

  return (
    <Router>
      <div className="min-h-screen" style={{ color: 'white' }}>
        <Routes>
          <Route path="/" element={!user ? <Welcome /> : <Navigate to={getDefaultRoute()} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:accountType" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:accountType" element={<Register />} />
          <Route
            path="/driver"
            element={user && user.role === 'driver' ? <DriverDashboard /> : <Navigate to="/login/driver" />}
          />
          <Route
            path="/police"
            element={user && user.role === 'police' ? <PoliceDashboard /> : <Navigate to="/login/police" />}
          />
          <Route
            path="/control"
            element={user && (user.role === 'admin' || user.role === 'control') ? <ControlCenter /> : <Navigate to="/login" />}
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


