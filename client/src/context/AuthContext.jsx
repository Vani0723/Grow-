import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api';
import Toast from '../components/Toast';

export const AuthContext = createContext({
  user: null,
  accessToken: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loading: true,
  toastMessage: null,
  clearToast: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Try to refresh on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await api.refresh();
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          localStorage.setItem('accessToken', data.accessToken);
          const me = await api.me(data.accessToken);
          setUser(me);
        }
      } catch (e) {
        // ignore, not logged in
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { accessToken, lastVisitedAt } = await api.login(email, password);
    setAccessToken(accessToken);
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    const me = await api.me(accessToken);
    setUser(me);
    // Store last visited timestamp in localStorage
    if (lastVisitedAt) {
      localStorage.setItem('lastVisitedAt', new Date(lastVisitedAt).toISOString());
      setToastMessage(`Welcome back! Your last login was ${new Date(lastVisitedAt).toLocaleString()}`);
    }
  };

  const register = async (name, email, password) => {
    await api.register(name, email, password);
    // Auto login after registration
    await login(email, password);
  };

  const logout = async () => {
    await api.logout();
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('lastVisitedAt');
  };

  const clearToast = () => setToastMessage(null);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    register,
    toastMessage,
    clearToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toastMessage && <Toast message={toastMessage} onClose={clearToast} />}
    </AuthContext.Provider>
  );
};
