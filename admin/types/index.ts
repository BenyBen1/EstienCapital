// Core types for the admin portal
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  accountType: 'individual' | 'joint';
  status: 'active' | 'inactive' | 'suspended';
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  createdAt: string;
  lastLogin?: string;
  totalInvested: number;
  portfolioValue: number;
  // Joint account specific fields
  jointAccountHolder?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  minimumInvestment: number;
  currentValue: number;
  totalInvested: number;
  annualReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'closed';
  createdAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  userName: string;
  totalValue: number;
  totalInvested: number;
  returnAmount: number;
  returnPercentage: number;
  holdings: PortfolioHolding[];
  createdAt: string;
}

export interface PortfolioHolding {
  productId: string;
  productName: string;
  investedAmount: number;
  currentValue: number;
  returnPercentage: number;
  shares: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'dividend';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
  completedAt?: string;
  productId?: string;
  productName?: string;
}

export interface Memo {
  id: string;
  title: string;
  summary?: string;
  content: string;
  author: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  targetAudience: 'all' | 'individual' | 'joint';
  sendEmail: boolean;
  sendAppNotification: boolean;
  publishImmediately: boolean;
  scheduledPublishAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  adminName: string;
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  individualAccounts: number;
  jointAccounts: number;
  pendingKyc: number;
  totalAssets: number;
  monthlyTransactionVolume: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalProducts: number;
  activeProducts: number;
  publishedMemos: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}