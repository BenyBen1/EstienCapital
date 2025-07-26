'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { transactionsAPI, dashboardAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, Users, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TransactionRequest {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference_number?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'approved': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <XCircle className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

export default function TransactionRequestsPage() {
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [transactionType, setTransactionType] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const handleApprove = async (id: string) => {
    try {
      const result = await transactionsAPI.approveTransaction(id);
      if (result.success) {
        fetchRequests();
        fetchMetrics();
      } else {
        alert('Failed to approve transaction: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Error approving transaction');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const result = await transactionsAPI.rejectTransaction(id, reason);
      if (result.success) {
        fetchRequests();
        fetchMetrics();
      } else {
        alert('Failed to reject transaction: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction');
    }
  };

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await dashboardAPI.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching transaction requests...');
      const token = localStorage.getItem('adminToken');
      console.log('Admin token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.error('No admin token found');
        setRequests([]);
        return;
      }
      
      // Use the correct transaction-requests endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/transaction-requests?page=1&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Transaction data:', data);
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching transaction requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchMetrics();
  }, [fetchRequests, fetchMetrics]);

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status.toLowerCase() === activeTab;
  }).filter(request => {
    if (transactionType === 'all') return true;
    return request.type.toLowerCase() === transactionType;
  });

  const pendingCount = requests.filter(r => r.status.toLowerCase() === 'pending').length;
  const approvedCount = requests.filter(r => r.status.toLowerCase() === 'approved').length;
  const rejectedCount = requests.filter(r => r.status.toLowerCase() === 'rejected').length;
  const depositCount = requests.filter(r => r.type.toLowerCase() === 'deposit').length;
  const withdrawalCount = requests.filter(r => r.type.toLowerCase() === 'withdrawal').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaction Requests</h1>
          </div>
          <p className="text-muted-foreground text-gray-600 mb-4">
            Review and manage all transaction requests from users
          </p>
          <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-muted-foreground">
                All transaction requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Declined requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Requests</CardTitle>
            <CardDescription>
              Review and approve/reject transaction requests from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Transaction Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg shadow-sm p-1 bg-gray-100" role="group">
                <Button
                  type="button"
                  variant={transactionType === 'all' ? 'default' : 'outline'}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${transactionType === 'all' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setTransactionType('all')}
                >
                  All Transactions ({requests.length})
                </Button>
                <Button
                  type="button"
                  variant={transactionType === 'deposit' ? 'default' : 'outline'}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ml-1 ${transactionType === 'deposit' ? 'bg-white text-green-700 shadow-sm border border-green-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setTransactionType('deposit')}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Deposits ({depositCount})
                </Button>
                <Button
                  type="button"
                  variant={transactionType === 'withdrawal' ? 'default' : 'outline'}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ml-1 ${transactionType === 'withdrawal' ? 'bg-white text-red-700 shadow-sm border border-red-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setTransactionType('withdrawal')}
                >
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Withdrawals ({withdrawalCount})
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 sticky top-0 z-10 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">All ({filteredRequests.length})</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700">Pending ({filteredRequests.filter(r => r.status.toLowerCase() === 'pending').length})</TabsTrigger>
                <TabsTrigger value="approved" className="rounded-md data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Approved ({filteredRequests.filter(r => r.status.toLowerCase() === 'approved').length})</TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-md data-[state=active]:bg-red-100 data-[state=active]:text-red-700">Rejected ({filteredRequests.filter(r => r.status.toLowerCase() === 'rejected').length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading transaction requests...</span>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                      {activeTab === 'all' 
                        ? `No ${transactionType === 'all' ? '' : transactionType} transaction requests available at the moment.` 
                        : `No ${activeTab} ${transactionType === 'all' ? '' : transactionType} transaction requests found.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Request Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-md font-medium">
                                #{request.id.slice(-8)}
                              </span>
                              <Badge variant="outline" className={`capitalize font-medium ${request.type.toLowerCase() === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {request.type}
                              </Badge>
                              <Badge className={`${getStatusColor(request.status)} font-medium flex items-center gap-1`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                            </div>
                            
                            {/* Request Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Customer</p>
                                <div className="font-medium">{request.profiles?.full_name || 'Unknown User'}</div>
                                <div className="text-gray-600">{request.profiles?.email}</div>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Amount</p>
                                <div className="font-bold text-lg">{formatCurrency(request.amount)}</div>
                                <div className="text-gray-600">
                                  Ref: {request.reference_number || 'N/A'}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Date</p>
                                <div className="font-medium">
                                  {new Date(request.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-gray-600">
                                  {new Date(request.created_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 ml-6">
                            {request.status.toLowerCase() === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(request.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
