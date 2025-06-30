import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  completeRegistration: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';


const BASE_URL = 'http://192.168.0.175:5000';

async function fetchUserProfile(userId: string) {
  const response = await fetch(`${BASE_URL}/api/profile/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return await response.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        // Fetch latest profile info
        try {
          const profile = await fetchUserProfile(String(parsedUser.id));
          setUser({ ...parsedUser, ...profile });
        } catch {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (user: User) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, 'mock_token'),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    setUser(user);
  };

  const clearAuthData = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setUser(null);
  };

  // Real login: call backend
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      console.log('LOGIN: POST', `${BASE_URL}/api/auth/login`, credentials);
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      // Save token and user
      await AsyncStorage.setItem(TOKEN_KEY, data.session?.access_token || '');
      // Fetch latest profile info
      let profile = data.user;
      try {
        profile = await fetchUserProfile(String(data.user.id));
      } catch {}
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Real register: call backend
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      console.log('REGISTER: POST', `${BASE_URL}/api/auth/register`, userData);
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      // Registration step 1 done, show message to user
      // (You may want to show a toast/alert in the UI)
      // Optionally fetch profile after registration if needed
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete registration after email confirmation and login
  const completeRegistration = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('COMPLETE REGISTRATION: POST', `${BASE_URL}/api/auth/complete-registration`);
      const response = await fetch(`${BASE_URL}/api/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Profile setup failed');
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Complete registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Optionally call backend logout endpoint if you have one
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        }
      } catch (err) {
        // Ignore backend logout errors
        console.warn('Backend logout failed:', err);
      }
      await clearAuthData();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock refreshAuth: just clears auth
  const refreshAuth = async () => {
    await clearAuthData();
    throw new Error('No refresh token available');
  };

  // Add a method to refresh the profile manually
  const refreshProfile = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const profile = await fetchUserProfile(String(user.id));
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
        setUser(profile);
      } catch (error) {
        console.error('Failed to refresh profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        completeRegistration,
        logout,
        refreshAuth,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
