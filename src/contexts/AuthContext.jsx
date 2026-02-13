/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Direct API URL for all environments
const API_BASE_URL = 'https://api.thegradient.blog';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const team_name = localStorage.getItem('team_name');

      if (token && team_name) {
        // Verify token is still valid by making a test request
        try {
          const response = await fetch(`${API_BASE_URL}/hunt/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include'
          });

          if (response.ok) {
            setUser({ team_name, token });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('team_name');
          }
        } catch (error) {
          // Network error or invalid token, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('team_name');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (team_name, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ team_name: team_name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      // Store token and team name
      localStorage.setItem('token', data.token);
      localStorage.setItem('team_name', team_name);

      setUser({ team_name, token: data.token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (team_name, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ team_name: team_name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Signup failed');
      }

      // Store token and team name
      localStorage.setItem('token', data.token);
      localStorage.setItem('team_name', team_name);

      setUser({ team_name, token: data.token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to clear cookie
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('team_name');
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
