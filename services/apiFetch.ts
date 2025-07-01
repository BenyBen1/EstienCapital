import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';
import { supabase } from '@/services/supabase';

export async function apiFetch(path: string, options: RequestInit = {}) {
  // Always get the latest token from Supabase
  const { data: sessionData } = await supabase.auth.getSession();
  const freshToken = sessionData?.session?.access_token;

  // Optional: update AsyncStorage for compatibility
  if (freshToken) {
    await AsyncStorage.setItem('auth_token', freshToken);
  }

  // Always try to get the latest token
  const token = freshToken || (await AsyncStorage.getItem('auth_token'));

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}
