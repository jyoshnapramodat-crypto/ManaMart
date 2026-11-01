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

  // Do NOT auto-login as customer on first visit.
  // Allow visitors to see the Splash Screen & Landing Page naturally.
  // Persisted user in localStorage is retained across refreshes.

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

  // Send OTP with purpose ('login' | 'register')
  const sendOtp = async (identifier, purpose = 'login') => {
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        purpose,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
      };
      const res = await api.post('/auth/send-otp', payload);
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send OTP.',
        isRegistered: err.response?.data?.isRegistered,
        notRegistered: err.response?.data?.notRegistered,
      };
    }
  };

  // Login existing user via Password OR OTP
  const login = async (identifier, credentials = {}) => {
    setLoading(true);
    try {
      let payload = { identifier };
      if (typeof credentials === 'string') {
        payload.otp = credentials;
      } else {
        if (credentials.password) payload.password = credentials.password;
        if (credentials.otp) payload.otp = credentials.otp;
      }
      const res = await api.post('/auth/login', payload);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('manamart_user', JSON.stringify(res.data.user));
        localStorage.setItem('manamart_token', res.data.token);
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
        notRegistered: err.response?.data?.notRegistered,
      };
    } finally {
      setLoading(false);
    }
  };

  // Register brand new user with uniqueness validation
  const register = async ({ name, phone, email, password, role = 'customer', otp, businessName, vehicleType }) => {
    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        email,
        password,
        role,
        otp,
        businessName,
        vehicleType,
      };
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('manamart_user', JSON.stringify(res.data.user));
        localStorage.setItem('manamart_token', res.data.token);
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password using OTP
  const resetPassword = async ({ identifier, otp, newPassword }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { identifier, otp, newPassword });
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Password reset failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Real-time uniqueness check for phone / email
  const checkAvailability = async (phone, email) => {
    try {
      const res = await api.get('/auth/check-availability', {
        params: { phone, email },
      });
      return res.data;
    } catch (err) {
      return { success: false, available: true };
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
        isLoggedIn: Boolean(user && token),
        sendOtp,
        login,
        register,
        resetPassword,
        checkAvailability,
        quickSwitchRole,
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
