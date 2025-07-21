'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import DataTable from './DataTable';
import { transactionsAPI } from '@/lib/api';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  reference: string;
  description: string;
  payment_method: string;
  account_details?: any;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface TransactionStats {
  totalPending: number;
  totalCompleted: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [stats, setStats] = useState<TransactionStats>({
    totalPending: 0,
    totalCompleted: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [selectedTab]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filters = selectedTab === 'all' ? {} : { status: selectedTab };
      const data = await transactionsAPI.getTransactions(1, 50, filters);
      setTransactions(data.data || []);
      
      // Calculate stats
      const allTransactions = data.data || [];
      const pending = allTransactions.filter((t: Transaction) => t.status === 'pending');
      const completed = allTransactions.filter((t: Transaction) => t.status === 'completed');
      
      setStats({
        totalPending: pending.length,
        totalCompleted: completed.length,
        totalAmount: completed.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        pendingAmount: pending.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await transactionsAPI.approveTransaction(transactionId);
      await fetchTransactions(); // Refresh the data
      // Show success message (you can implement a toast notification here)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (transactionId: string, reason: string) => {
    try {
      await transactionsAPI.rejectTransaction(transactionId, reason);
      await fetchTransactions(); // Refresh the data
      // Show success message (you can implement a toast notification here)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject transaction');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'deposit' 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Deposit</Badge>
      : <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Withdrawal</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const columns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      ),
    },
    {
      key: 'user',
      label: 'Client',
      render: (value: any, row: Transaction) => (
        <div>
          <div className="font-medium">{row.user?.full_name || 'Unknown User'}</div>
          <div className="text-sm text-gray-500">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => getTypeBadge(value),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => (
        <div className="font-medium">{formatCurrency(value)}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (value: string) => (
        <div className="text-sm">{value || 'Bank Transfer'}</div>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingAmount)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Transactions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalAmount)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount + stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending > 0 ? 'Active' : 'Clear'}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPending} items pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>
            Manage client deposits and withdrawals. Review and approve pending transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending ({stats.totalPending})</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <DataTable
                columns={columns}
                data={transactions}
                actions={(row: Transaction) => {
                  if (row.status !== 'pending') return null;
                  
                  return (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleApproveTransaction(row.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) handleRejectTransaction(row.id, reason);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  );
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
