import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Hunt from './pages/Hunt';
import Leaderboard from './pages/Leaderboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CountdownPage from './components/CountdownPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  // Check for dev mode override
  const urlParams = new URLSearchParams(window.location.search);
  const isDevMode = urlParams.get('dev') === 'true';
  
  // Set your hunt start time here (same as in CountdownPage.jsx)
  const huntStartTime = new Date('2025-09-30T19:00:00'); // Change this to your actual start time
  const now = new Date();
  const isHuntStarted = now >= huntStartTime;
  
  // Show countdown if hunt hasn't started and not in dev mode
  if (!isHuntStarted && !isDevMode) {
    return <CountdownPage />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/hunt" element={<ProtectedRoute><Hunt /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
