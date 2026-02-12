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
      const teamName = localStorage.getItem('teamName');

      if (token && teamName) {
        // Verify token is still valid by making a test request
        try {
          const response = await fetch(`${API_BASE_URL}/hunt/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include'
          });

          if (response.ok) {
            setUser({ teamName, token });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('teamName');
          }
        } catch (error) {
          // Network error or invalid token, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('teamName');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (teamName, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teamName: teamName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      // Store token and team name
      localStorage.setItem('token', data.token);
      localStorage.setItem('teamName', teamName);

      setUser({ teamName, token: data.token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (teamName, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teamName: teamName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Signup failed');
      }

      // Store token and team name
      localStorage.setItem('token', data.token);
      localStorage.setItem('teamName', teamName);

      setUser({ teamName, token: data.token });
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
      localStorage.removeItem('teamName');
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
