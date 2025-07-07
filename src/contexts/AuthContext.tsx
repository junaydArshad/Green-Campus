import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI, userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; full_name: string; location?: string }) => Promise<void>;
  logout: () => void;
  resetPasswordRequest: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate it with backend
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Validate token by fetching user profile
          const userData = await userAPI.getProfile();
          setUser(userData);
        } catch (error) {
          // Token is invalid, remove it
          console.log('Invalid token, removing from localStorage');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; full_name: string; location?: string }) => {
    try {
      await authAPI.register(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const resetPasswordRequest = async (email: string) => {
    try {
      await authAPI.resetPasswordRequest(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
      await authAPI.resetPassword({ email, token, new_password: newPassword });
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPasswordRequest,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 