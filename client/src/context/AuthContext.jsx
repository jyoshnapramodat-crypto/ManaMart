import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('manamart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('manamart_token') || '');
  const [loading, setLoading] = useState(false);

  // Initialize with default demo customer on first load if not set
  useEffect(() => {
    if (!user || !token) {
      quickSwitchRole('customer');
    }
  }, []);

  const quickSwitchRole = async (role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/quick-login', { role });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('manamart_user', JSON.stringify(res.data.user));
        localStorage.setItem('manamart_token', res.data.token);
      }
    } catch (err) {
      console.error('Error switching role:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (identifier, otp, name, role = 'customer') => {
    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const body = {
        otp,
        name,
        role,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
      };
      const res = await api.post('/auth/verify-otp', body);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('manamart_user', JSON.stringify(res.data.user));
        localStorage.setItem('manamart_token', res.data.token);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('manamart_user');
    localStorage.removeItem('manamart_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'customer',
        loading,
        quickSwitchRole,
        loginWithOtp,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
