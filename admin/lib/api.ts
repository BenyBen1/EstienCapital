// API service layer - backend
import { User, Product, Portfolio, Transaction, Memo, Admin, DashboardMetrics, AuditLog, KycSubmission } from '@/types';
import { mockUsers, mockProducts, mockPortfolios, mockDashboardMetrics, mockAdmins, mockAuditLogs, mockKycSubmissions } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : 'http://localhost:54321/functions/v1';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Secure admin authentication using Supabase Edge Functions
export const authAPI = {
  login: async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          totpCode: twoFactorCode,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  verifyToken: async (token: string) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Token verification failed' };
      }

      return data;
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  logout: async () => {
    try {
      // In a real implementation, you might want to invalidate the session on the server
      // For now, we'll just clear the local storage
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  },

  setup2FA: async (token: string, action: 'generate' | 'verify' | 'disable', totpCode?: string) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-setup-2fa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          totpCode,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || '2FA setup failed' };
      }

      return { success: true, ...data };
    } catch (error) {
      console.error('2FA setup error:', error);
      return { success: false, error: 'Network error' };
    }
  },
};

// Users API
export const usersAPI = {
  getUsers: async (page = 1, limit = 10, search?: string, status?: string, accountType?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (accountType) params.append('accountType', accountType);
      
      console.log('Making API call to:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params.toString()}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't fallback to mock data, throw the error
      throw error;
    }
  },
  
  getUserById: async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fallback to mock data
      return mockUsers.find(u => u.id === id);
    }
  },
  
  updateUser: async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: (error as Error).message };
    }
  },
  
  approveKyc: async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/kyc/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve KYC: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving KYC:', error);
      return { success: false, error: (error as Error).message };
    }
  },
  
  rejectKyc: async (userId: string, reason: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/kyc/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject KYC: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      return { success: false, error: (error as Error).message };
    }
  },
};

// Products API
export const productsAPI = {
  getProducts: async () => {
    // TODO: Replace with actual API call
    // return await fetch('/api/products');
    return Promise.resolve(mockProducts);
  },
  
  createProduct: async (product: Omit<Product, 'id' | 'createdAt'>) => {
    // TODO: Replace with actual API call
    // return await fetch('/api/products', { method: 'POST', body: JSON.stringify(product) });
    return Promise.resolve({ success: true, id: Date.now().toString() });
  },
  
  updateProduct: async (id: string, updates: Partial<Product>) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    return Promise.resolve({ success: true });
  },
  
  deleteProduct: async (id: string) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return Promise.resolve({ success: true });
  },
};

// Portfolios API
export const portfoliosAPI = {
  getPortfolios: async (page = 1, limit = 10) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/portfolios?page=${page}&limit=${limit}`);
    return Promise.resolve({ data: mockPortfolios, total: mockPortfolios.length });
  },
  
  getPortfolioById: async (id: string) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/portfolios/${id}`);
    return Promise.resolve(mockPortfolios.find(p => p.id === id));
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async (page = 1, limit = 10, filters?: any) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/admin?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to empty data
      return { data: [], total: 0 };
    }
  },
  
  approveTransaction: async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve transaction: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },
  
  rejectTransaction: async (id: string, reason: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reject transaction: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },
};

// Memos API
export const memosAPI = {
  getMemos: async (page = 1, limit = 10, status?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch memos: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching memos:', error);
      throw error; // Don't fallback to mock data, let the error propagate
    }
  },
  
  createMemo: async (memo: {
    title: string;
    summary?: string;
    content: string;
    category: string;
    author?: string;
    sendEmail?: boolean;
    sendAppNotification?: boolean;
    publishImmediately?: boolean;
    scheduledPublishAt?: string;
  }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(memo),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create memo: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating memo:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  updateMemo: async (id: string, updates: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update memo: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating memo:', error);
      return { success: false, error: (error as Error).message };
    }
  },
  
  publishMemo: async (id: string, options = { sendEmail: true, sendAppNotification: true }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(options),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to publish memo: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error publishing memo:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  getAnalytics: async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/${id}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  },
  
  archiveMemo: async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ status: 'archived' }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to archive memo: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error archiving memo:', error);
      return { success: false, error: (error as Error).message };
    }
  },
  
  deleteMemo: async (id: string) => {
    // Note: We might want to archive instead of delete for audit purposes
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memos/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete memo: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting memo:', error);
      return { success: false, error: (error as Error).message };
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getMetrics: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Fallback to mock data for now
      return mockDashboardMetrics;
    }
  },
};

// Transaction Requests API (for admin review of all transactions)
export const transactionRequestsAPI = {
  getTransactionRequests: async (page = 1, limit = 20, filters?: any) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/transaction-requests?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction requests: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction requests:', error);
      return { data: [], total: 0 };
    }
  },
};

// Admin API
export const adminAPI = {
  getAdmins: async () => {
    // TODO: Replace with actual API call
    // return await fetch('/api/admin/users');
    return Promise.resolve(mockAdmins);
  },
  
  getAuditLogs: async (page = 1, limit = 10) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/admin/audit-logs?page=${page}&limit=${limit}`);
    return Promise.resolve({ data: mockAuditLogs, total: mockAuditLogs.length });
  },
};

// KYC API
export const kycAPI = {
  getKycSubmissions: async (status?: string) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/kyc/submissions?status=${status}`);
    return Promise.resolve(mockKycSubmissions);
  },
  
  approveKycSubmission: async (id: string, notes?: string) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/kyc/submissions/${id}/approve`, { method: 'POST', body: JSON.stringify({ notes }) });
    return Promise.resolve({ success: true });
  },
  
  rejectKycSubmission: async (id: string, reason: string) => {
    // TODO: Replace with actual API call
    // return await fetch(`/api/kyc/submissions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
    return Promise.resolve({ success: true });
  },
};

// Notifications API
export const notificationsAPI = {
  sendNotification: async (userIds: string[], title: string, message: string) => {
    // TODO: Replace with actual API call
    // return await fetch('/api/notifications/send', { method: 'POST', body: JSON.stringify({ userIds, title, message }) });
    return Promise.resolve({ success: true });
  },
  
  sendEmail: async (userIds: string[], subject: string, body: string) => {
    // TODO: Replace with actual API call
    // return await fetch('/api/notifications/email', { method: 'POST', body: JSON.stringify({ userIds, subject, body }) });
    return Promise.resolve({ success: true });
  },
};

console.debug('API URL:', process.env.NEXT_PUBLIC_API_URL);