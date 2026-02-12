import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Hunt from './pages/Hunt';
import Leaderboard from './pages/Leaderboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BonusRound1 from './pages/BonusRound1';
import BonusRound2 from './pages/BonusRound2';
import CountdownPage from './components/CountdownPage';
import api from './services/api';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const [isHuntStarted, setIsHuntStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for dev mode override
  const urlParams = new URLSearchParams(window.location.search);
  const isDevMode = urlParams.get('dev') === 'true';

  useEffect(() => {
    const fetchHuntStatus = async () => {
      try {
        const response = await api.getMainHuntStatus();
        setIsHuntStarted(response.isStarted);
      } catch (error) {
        console.error('Error fetching hunt status:', error);
        // Fallback to false if API fails
        setIsHuntStarted(false);
      } finally {
        setLoading(false);
      }
    };

    fetchHuntStatus();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/hunt" element={
        !isHuntStarted && !isDevMode ? <CountdownPage isLoggedIn={true} /> : <ProtectedRoute><Hunt /></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        !isHuntStarted && !isDevMode ? <CountdownPage isLoggedIn={true} /> : <ProtectedRoute><Leaderboard /></ProtectedRoute>
      } />
      <Route path="/bonus1" element={<BonusRound1 />} />
      <Route path="/bonus2" element={<BonusRound2 />} />
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
