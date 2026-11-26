import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getUser());
  const [token, setToken] = useState(() => api.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            api.setUser(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout(false);
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const demoLogin = async (role = 'RIDER') => {
    try {
      const res = await api.demoLogin(role);
      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Logged in as ${res.user.role}!`);
        return { success: true, user: res.user };
      }
    } catch (err) {
      toast.error(err.message || 'Demo login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);
        setToken(res.token);
        setUser(res.user);
        toast.success('Account created successfully! Welcome to ChargeNear.');
        return { success: true, user: res.user };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = (showToast = true) => {
    api.clearAuth();
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success('Signed out successfully.');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    api.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isRider: user?.role === 'RIDER',
        isHost: user?.role === 'HOST',
        isAdmin: user?.role === 'ADMIN',
        login,
        demoLogin,
        register,
        logout,
        updateUser
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

