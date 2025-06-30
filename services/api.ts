import { Platform } from 'react-native';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'web' 
    ? 'http://localhost:3000/api'
    : 'http://192.168.0.175:5000/api' // Fixed port and added /api path
  : 'https://your-production-api.com/api';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);
console.log('__DEV__:', __DEV__);

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: 'individual' | 'joint';
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  gainPercentage: number;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  allocation: number;
  value: number;
  change: number;
  isPositive: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
  reference?: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🌐 API Request Debug:');
    console.log('  Base URL:', this.baseURL);
    console.log('  Endpoint:', endpoint);
    console.log('  Full URL:', url);
    console.log('  Method:', options.method || 'GET');
    console.log('  Headers:', options.headers);
    console.log('  Body size:', options.body ? JSON.stringify(options.body).length : 0, 'characters');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log('📡 Making request to:', url);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📥 Response received:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('💥 API Request failed:', error);
      console.error('  URL:', url);
      console.error('  Error details:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Portfolio endpoints
  async getPortfolio(): Promise<Portfolio> {
    return this.request<Portfolio>('/portfolio');
  }

  // Transaction endpoints
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/transactions');
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'userId' | 'date'>): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // KYC endpoints
  async submitKYC(kycData: any): Promise<{ success: boolean; message: string }> {
    console.log('📋 KYC Submission Debug:');
    console.log('  User ID:', kycData.userId);
    console.log('  ID Document size:', kycData.idDocument?.base64?.length || 0, 'characters');
    console.log('  Passport Photo size:', kycData.passportPhoto?.base64?.length || 0, 'characters');
    console.log('  Total payload size:', JSON.stringify(kycData).length, 'characters');
    
    return this.request('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(kycData),
    });
  }

  async getKYCStatus(): Promise<{ status: string; message?: string }> {
    return this.request('/kyc/status');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions
export const setAuthToken = (token: string) => {
  apiClient.setToken(token);
};

export const clearAuthToken = () => {
  apiClient.clearToken();
};