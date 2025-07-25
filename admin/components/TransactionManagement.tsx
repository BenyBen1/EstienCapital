'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, DollarSign, User, Calendar, CreditCard, FileText, Shield } from 'lucide-react';
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

  // Confirmation dialog state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [selectedTab]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = selectedTab === 'all' ? {} : { status: selectedTab };
      
      console.log('Fetching transactions with filters:', filters);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transactions/admin?${new URLSearchParams({
        page: '1',
        limit: '50',
        ...(filters.status && { status: filters.status }),
      })}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched transactions data:', data);
      
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.data || []);
      
      // Calculate stats from all transactions
      const allTransactions = data.data || [];
      const pending = allTransactions.filter((t: Transaction) => t.status === 'pending');
      const completed = allTransactions.filter((t: Transaction) => t.status === 'completed');
      const deposits = allTransactions.filter((t: Transaction) => t.type === 'deposit');
      const withdrawals = allTransactions.filter((t: Transaction) => t.type === 'withdrawal');
      
      setStats({
        totalPending: pending.length,
        totalCompleted: completed.length,
        totalAmount: completed.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        pendingAmount: pending.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      });
      
      console.log('Transaction stats:', {
        total: allTransactions.length,
        pending: pending.length,
        completed: completed.length,
        deposits: deposits.length,
        withdrawals: withdrawals.length
      });
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // New handlers for the confirmation dialog
  const openConfirmationDialog = (transaction: Transaction, action: 'approve' | 'reject') => {
    setSelectedTransaction(transaction);
    setConfirmAction(action);
    setShowConfirmDialog(true);
    setRejectionReason('');
    setAdminNotes('');
  };

  const closeConfirmationDialog = () => {
    setShowConfirmDialog(false);
    setSelectedTransaction(null);
    setConfirmAction(null);
    setRejectionReason('');
    setAdminNotes('');
  };

  const handleConfirmAction = async () => {
    if (!selectedTransaction || !confirmAction) return;
    
    // Validation for rejection
    if (confirmAction === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setConfirming(true);
    try {
      const endpoint = confirmAction === 'approve' ? 'approve' : 'reject';
      const body = confirmAction === 'reject' ? 
        { reason: rejectionReason, adminNotes } : 
        { adminNotes };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transactions/${selectedTransaction.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${confirmAction} transaction`);
      }

      console.log(`Transaction ${confirmAction}d successfully:`, result);
      
      // Refresh the transactions list
      await fetchTransactions();
      closeConfirmationDialog();
      
      // Show success message
      alert(`Transaction ${confirmAction}d successfully!`);
      
    } catch (err) {
      console.error(`Error ${confirmAction}ing transaction:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${confirmAction} transaction`);
    } finally {
      setConfirming(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                        onClick={() => openConfirmationDialog(row, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => openConfirmationDialog(row, 'reject')}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={closeConfirmationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {confirmAction === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
            <DialogDescription>
              Please review the transaction details carefully before proceeding.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Reference</Label>
                      <p className="font-mono text-lg">{selectedTransaction.reference}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Amount</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Submitted</Label>
                        <p className="text-sm">{formatDate(selectedTransaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Payment Method</Label>
                        <p className="text-sm">{selectedTransaction.payment_method || 'Bank Transfer'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold">Client Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Full Name</Label>
                      <p className="font-medium">{selectedTransaction.user?.full_name || 'Unknown User'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email</Label>
                      <p className="text-sm">{selectedTransaction.user?.email}</p>
                    </div>
                    {selectedTransaction.user?.phone && (
                      <div>
                        <Label className="text-sm text-gray-600">Phone</Label>
                        <p className="text-sm">{selectedTransaction.user.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Details */}
              {selectedTransaction.description && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold">Transaction Description</h3>
                    </div>
                    <p className="text-sm text-gray-700">{selectedTransaction.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any internal notes about this transaction..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Rejection Reason */}
              {confirmAction === 'reject' && (
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Rejection Details</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason" className="text-red-700">
                      Reason for Rejection *
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Please provide a clear reason for rejecting this deposit..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="border-red-300 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Approval Confirmation */}
              {confirmAction === 'approve' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Approval Confirmation</h3>
                  </div>
                  
                  <p className="text-green-700">
                    You are about to approve this deposit of {formatCurrency(selectedTransaction.amount)} 
                    for {selectedTransaction.user?.full_name}. This action cannot be undone.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={closeConfirmationDialog}
                  disabled={confirming}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={confirming || (confirmAction === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 ${
                    confirmAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {confirming ? 'Processing...' : confirmAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
