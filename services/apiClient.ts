import { apiFetch } from './apiFetch';

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

export interface JointAccountHolder {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: 'individual' | 'joint';
  jointHolder?: JointAccountHolder;
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

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await apiFetch(endpoint, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      let errorData: any = {};
      if (contentType.includes('application/json')) {
        errorData = await res.json().catch(() => ({}));
      } else {
        errorData = { message: await res.text() };
      }
      throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
    }
    if (contentType.includes('application/json')) {
      return await res.json();
    } else {
      // Not JSON, return as text or throw
      const text = await res.text();
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }
  }

  // Auth
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

  // Profile
  async getProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Portfolio
  async getPortfolio(): Promise<Portfolio> {
    return this.request<Portfolio>('/portfolio');
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/transactions');
  }

  async createTransaction(
    transaction: Omit<Transaction, 'id' | 'userId' | 'date'>
  ): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // KYC
  async submitKYC(kycData: any): Promise<{ success: boolean; message: string }> {
    return this.request('/api/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(kycData),
    });
  }

  async getKYCStatus(): Promise<{ status: string; message?: string }> {
    return this.request('/kyc/status');
  }
}

// 👇 Singleton export
export const apiClient = new ApiClient();
