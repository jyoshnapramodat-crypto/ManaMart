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

  // Login existing user
  const login = async (identifier, otp) => {
    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        otp,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
      };
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
  const register = async ({ name, phone, email, role, otp, businessName, vehicleType }) => {
    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        email,
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
