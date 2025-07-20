import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/services/config';
import { apiFetch } from '@/services/apiFetch';
import { supabase } from '@/services/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  createdAt: string;
  updatedAt: string;
  accountType?: 'individual' | 'group';
  groupId?: string;
  // Add more fields as needed
}

interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  role: 'admin' | 'member';
  isAccountManager: boolean;
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
  accountType: 'individual' | 'group';
  groupName?: string;
  groupType?: 'joint' | 'sacco' | 'chama' | 'investment_club';
  groupMembers?: GroupMember[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<any>; // Return registration data
  completeRegistration: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  reloadUserFromStorage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Helper: refresh Supabase session if expired
async function ensureSupabaseSession() {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    // Try to restore from storage
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (token && refreshToken) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
      });
    }
  }
}

// In fetchUserProfile, ensure session is valid before API call
async function fetchUserProfile(userId: string): Promise<User> {
  await ensureSupabaseSession();
  const response = await apiFetch(`/api/profile/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  const profileData = await response.json();
  
  // Map backend profile format to User interface
  return {
    id: profileData.id,
    email: profileData.email,
    firstName: profileData.first_name || '',
    lastName: profileData.last_name || '',
    phoneNumber: profileData.phone_number || '',
    kycStatus: profileData.kyc_status || 'not_started',
    createdAt: profileData.created_at || new Date().toISOString(),
    updatedAt: profileData.updated_at || new Date().toISOString(),
    accountType: profileData.account_type || 'individual',
    groupId: profileData.group_id || undefined,
  };
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Restore session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Starting initialization...');
        // Add a small delay for iOS to ensure proper initialization
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const [token, refreshToken, userData] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(REFRESH_TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        
        console.log('AuthContext: Retrieved from storage - token:', !!token, 'refreshToken:', !!refreshToken, 'userData:', userData);
        
        // Restore Supabase session if tokens exist
        if (token && refreshToken) {
          console.log('AuthContext: Restoring Supabase session...');
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken,
          });
        }
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log('AuthContext: Restoring user from storage:', parsedUser);
          setUser(parsedUser);
        } else if (userData) {
          // Even without token, if we have user data, restore it
          const parsedUser = JSON.parse(userData);
          console.log('AuthContext: Restoring user from storage without token:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('AuthContext: No stored user data found - hasToken:', token ? 'yes' : 'no', 'hasUserData:', userData ? 'yes' : 'no');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        await clearAuthData();
      } finally {
        // Ensure loading state is set to false after a minimum time
        setTimeout(() => setIsLoading(false), 100);
      }
    };
    initializeAuth();
  }, []);

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
      // Set Supabase session so supabase.auth.getSession() works
      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      await AsyncStorage.removeItem('cached_name');
      // Save token and user
      await AsyncStorage.setItem(TOKEN_KEY, data.session?.access_token || '');
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.session?.refresh_token || '');
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

  // Real register: call backend for ALL account types
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
      
      console.log('✅ Registration successful:', data);
      
      // Return the registration data for UI handling (keep email confirmation)
      return data;
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
      await AsyncStorage.removeItem('cached_name');
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

  // Add a method to manually reload user from storage
  const reloadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('AuthContext: Manually reloading user from storage:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('AuthContext: No user data found during manual reload');
      }
    } catch (error) {
      console.error('Failed to reload user from storage:', error);
    }
  };

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    completeRegistration,
    logout,
    refreshAuth,
    refreshProfile,
    reloadUserFromStorage,
  }), [user, isLoading, isAuthenticated, login, register, completeRegistration, logout, refreshAuth, refreshProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
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
