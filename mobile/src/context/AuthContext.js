import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthToken, setOnUnauthorizedCallback } from '../services/api';
import { pingServer } from '../config/apiConfig';

const AuthContext = createContext();

export const DEMO_USERS = [
  { label: '👑 Super Admin', email: 'superadmin@tms.com', role: 'Superadmin', color: '#6366F1' },
  { label: '👤 User', email: 'user@tms.com', role: 'User', color: '#38BDF8' },
  { label: '👨‍🏫 Faculty Member', email: 'faculty@tms.com', role: 'Faculty', color: '#10B981' },
  { label: '🌐 Network Staff', email: 'network@tms.com', role: 'Networking Staff', color: '#F59E0B' },
  { label: '⚡ Electrician', email: 'electrician@tms.com', role: 'Electrician', color: '#EAB308' },
  { label: '🔧 Plumber', email: 'plumber@tms.com', role: 'Plumber', color: '#06B6D4' },
  { label: '💻 Software Dev', email: 'dev@tms.com', role: 'Software Developer', color: '#EC4899' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(false);

  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      console.log('401 Unauthorized received - resetting auth state to Login');
      setUser(null);
      setToken(null);
      setAuthToken(null);
    });
    checkHealth();
    loadStoredAuth();
  }, []);

  const checkHealth = async () => {
    const res = await pingServer();
    setIsServerOnline(res.success);
    return res.success;
  };

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@tms_auth_token');
      const storedUser = await AsyncStorage.getItem('@tms_auth_user');
      if (storedToken && storedUser) {
        if (storedToken.startsWith('mock_token_')) {
          const isOnline = await pingServer();
          if (isOnline.success) {
            console.log('Clearing old offline mock token since backend is now online');
            await logout();
            setLoading(false);
            return;
          }
        }

        setAuthToken(storedToken);

        // Verify with backend if online to prevent stale "User not found" errors
        try {
          const currentUser = await authAPI.getMe();
          if (currentUser) {
            setUser(currentUser);
            setToken(storedToken);
            await AsyncStorage.setItem('@tms_auth_user', JSON.stringify(currentUser));
            setLoading(false);
            return;
          } else {
            console.log('Stored user session not found in backend, clearing stale token');
            await logout();
            setLoading(false);
            return;
          }
        } catch (e) {
          if (e.status === 401 || e.message?.includes('User not found') || e.message?.includes('Token is not valid')) {
            console.log('Stored token is invalid or user was removed; logging out to Login screen');
            await logout();
            setLoading(false);
            return;
          }
          // If server is offline, fallback to parsed user from storage
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        }
      }
    } catch (e) {
      console.warn('Failed to restore auth from storage:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const loggedUser = res.user;
      const userToken = res.token;

      setUser(loggedUser);
      setToken(userToken);
      setAuthToken(userToken);

      await AsyncStorage.setItem('@tms_auth_token', userToken);
      await AsyncStorage.setItem('@tms_auth_user', JSON.stringify(loggedUser));

      checkHealth();
      return { success: true, user: loggedUser };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email) => {
    // Determine password based on seed defaults
    let password = 'user123';
    if (email === 'superadmin@tms.com') password = 'superadmin123';
    else if (email === 'faculty@tms.com') password = 'faculty123';
    else if (['network@tms.com', 'electrician@tms.com', 'plumber@tms.com', 'dev@tms.com'].includes(email)) {
      password = 'staff123';
    }
    return login(email, password);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      await AsyncStorage.removeItem('@tms_auth_token');
      await AsyncStorage.removeItem('@tms_auth_user');
    } catch (e) {
      console.error('Logout storage clear error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isServerOnline,
        checkHealth,
        login,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
