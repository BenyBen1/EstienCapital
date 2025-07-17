'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transaction } from '@/types';
import { transactionsAPI } from '@/lib/api';
import { Eye, Check, X, AlertCircle } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const result = await transactionsAPI.getTransactions();
        setTransactions(result.data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await transactionsAPI.approveTransaction(transactionId);
      setTransactions(transactions.map(tx => 
        tx.id === transactionId ? { ...tx, status: 'completed' } : tx
      ));
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    try {
      await transactionsAPI.rejectTransaction(transactionId, 'Compliance review failed');
      setTransactions(transactions.map(tx => 
        tx.id === transactionId ? { ...tx, status: 'failed' } : tx
      ));
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: Transaction['type']) => {
    const colors = {
      deposit: 'bg-green-100 text-green-800',
      withdrawal: 'bg-red-100 text-red-800',
      investment: 'bg-blue-100 text-blue-800',
      dividend: 'bg-purple-100 text-purple-800',
    };
    
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    { key: 'userName', label: 'User' },
    { key: 'type', label: 'Type', render: (value: Transaction['type']) => getTypeBadge(value) },
    { key: 'amount', label: 'Amount', render: (value: number) => formatCurrency(value) },
    { key: 'status', label: 'Status', render: (value: Transaction['status']) => getStatusBadge(value) },
    { key: 'productName', label: 'Product', render: (value: string) => value || 'N/A' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Date', render: (value: string) => new Date(value).toLocaleDateString() },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'deposit', label: 'Deposit' },
        { value: 'withdrawal', label: 'Withdrawal' },
        { value: 'investment', label: 'Investment' },
        { value: 'dividend', label: 'Dividend' },
      ],
    },
  ];

  const renderActions = (transaction: Transaction) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Transaction #{transaction.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">User</p>
                <p className="text-sm">{transaction.userName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-sm">{getTypeBadge(transaction.type)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-sm">{getStatusBadge(transaction.status)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Product</p>
                <p className="text-sm">{transaction.productName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-sm mt-1">{transaction.description}</p>
            </div>
            {transaction.completedAt && (
              <div>
                <p className="text-sm font-medium text-gray-600">Completed At</p>
                <p className="text-sm">{new Date(transaction.completedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {transaction.status === 'pending' && (
        <>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleApproveTransaction(transaction.id)}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleRejectTransaction(transaction.id)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Header title="Transactions" subtitle="Monitor and manage all transactions" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
            <p className="text-sm text-gray-600">{transactions.length} total transactions</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>{transactions.filter(t => t.status === 'pending').length} pending approval</span>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={transactions}
          filterable
          filterOptions={filterOptions}
          actions={renderActions}
        />
      </div>
    </AdminLayout>
  );
}