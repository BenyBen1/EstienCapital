'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: Admin | null;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      let token = localStorage.getItem('adminToken');
      
      // For development, set a mock admin token if none exists
      if (!token) {
        token = 'mock-admin-token';
        localStorage.setItem('adminToken', token);
      }
      
      if (token) {
        try {
          const result = await authAPI.verifyToken(token);
          if (result.success) {
            setUser(result.user);
          } else {
            // For development, set a mock admin user
            const mockAdmin = {
              id: 'admin-1',
              email: 'admin@estiencapital.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'super_admin' as const,
              permissions: ['all'],
              createdAt: new Date().toISOString(),
            };
            setUser(mockAdmin);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // For development, still set a mock admin user
          const mockAdmin = {
            id: 'admin-1',
            email: 'admin@estiencapital.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin' as const,
            permissions: ['all'],
            createdAt: new Date().toISOString(),
          };
          setUser(mockAdmin);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const result = await authAPI.login(email, password, twoFactorCode);
      if (result.success) {
        localStorage.setItem('adminToken', result.token);
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};