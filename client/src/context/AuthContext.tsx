import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('token', userData.token);
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('token', userData.token);
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (name: string, email: string, password?: string) => {
    try {
      const res = await api.put('/auth/profile', { name, email, password });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
      } else {
        throw new Error(res.data.message || 'Profile update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
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
