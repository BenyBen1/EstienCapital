// Wallet API Service for Estien Capital Mobile App
import { BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface DepositRequest {
  userId: string;
  amount: number;
  paymentMethod?: string;
  depositReference?: string;
}

export interface DepositResponse {
  transaction: any;
  message: string;
}

export class WalletAPI {
  // Get user's wallet balance
  static async getWallet(userId: string): Promise<Wallet> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/api/transactions/wallet/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to fetch wallet');
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    return response.json();
  }

  // Confirm deposit made by user
  static async confirmDeposit(depositData: DepositRequest): Promise<DepositResponse> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/api/transactions/wallet/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(depositData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to confirm deposit');
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    return response.json();
  }

  // Get transaction history with optional filters
  static async getTransactionHistory(userId: string, filters?: {
    type?: 'deposit' | 'withdrawal' | 'buy' | 'sell';
    status?: 'pending' | 'completed' | 'failed' | 'rejected';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const baseUrl = `${BASE_URL}/api/transactions/history/${userId}`;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to fetch transaction history');
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    return response.json();
  }

  // Request withdrawal
  static async requestWithdrawal(withdrawalData: {
    userId: string;
    amount: number;
    paymentMethod: string;
    accountDetails: any;
  }) {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/api/transactions/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(withdrawalData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to request withdrawal');
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    return response.json();
  }

  // Get available balance for transactions
  static async getAvailableBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance || 0;
  }
}
