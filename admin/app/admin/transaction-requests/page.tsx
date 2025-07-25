'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { transactionsAPI, dashboardAPI } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import DepositModal from '../transaction-requests/DepositModal';
import WithdrawModal from '../transaction-requests/WithdrawModal';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp 
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('deposits');
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const openModal = (request: TransactionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setModalAction(action);
    if (request.type.toLowerCase() === 'deposit') {
      setShowDepositModal(true);
    } else {
      setShowWithdrawModal(true);
    }
  };

  const closeModals = () => {
    setShowDepositModal(false);
    setShowWithdrawModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = async (id: string) => {
    try {
      const result = await transactionsAPI.approveTransaction(id);
      if (result.success) {
        await fetchRequests();
        closeModals();
      } else {
        alert('Failed to approve transaction: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Error approving transaction');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const result = await transactionsAPI.rejectTransaction(id, 'Rejected by admin');
      if (result.success) {
        await fetchRequests();
        closeModals();
      } else {
        alert('Failed to reject transaction: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction');
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        setRequests([]);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/transaction-requests?page=1&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
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
  }, [fetchRequests]);

  const deposits = requests.filter(r => r.type.toLowerCase() === 'deposit');
  const withdrawals = requests.filter(r => r.type.toLowerCase() === 'withdrawal');

  const getTabData = (type: string) => {
    const data = type === 'deposits' ? deposits : withdrawals;
    return {
      all: data,
      pending: data.filter(r => r.status.toLowerCase() === 'pending'),
      approved: data.filter(r => r.status.toLowerCase() === 'approved'),
      rejected: data.filter(r => r.status.toLowerCase() === 'rejected'),
    };
  };

  const renderRequestCard = (request: TransactionRequest) => (
    <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded font-medium">
              #{request.id.slice(-8)}
            </span>
            <Badge className={`${getStatusColor(request.status)} font-medium flex items-center gap-1`}>
              {getStatusIcon(request.status)}
              {request.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Customer</p>
              <div className="font-medium">{request.profiles?.full_name || 'Unknown User'}</div>
              <div className="text-gray-600 text-xs">{request.profiles?.email}</div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Amount & Reference</p>
              <div className="font-bold text-lg">{formatCurrency(request.amount)}</div>
              <div className="text-gray-600 text-xs font-mono">
                {request.reference_number || 'No reference'}
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            {new Date(request.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          {request.status.toLowerCase() === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => openModal(request, 'approve')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openModal(request, 'reject')}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = (type: 'deposits' | 'withdrawals') => {
    const tabData = getTabData(type);
    const [subTab, setSubTab] = useState('all');
    const currentData = tabData[subTab as keyof typeof tabData];

    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b">
          {Object.entries(tabData).map(([key, data]) => (
            <Button
              key={key}
              variant={subTab === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSubTab(key)}
              className="capitalize"
            >
              {key} ({data.length})
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[600px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm">Loading...</span>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No requests found</h3>
              <p className="text-xs text-gray-500">
                No {subTab} {type} requests at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentData.map(renderRequestCard)}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transaction Requests</h1>
            <p className="text-sm text-muted-foreground">
              Review and manage deposit and withdrawal requests
            </p>
          </div>
          <Button onClick={fetchRequests} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deposits</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{deposits.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{withdrawals.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status.toLowerCase() === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-green-600" />
                Deposit Requests
              </CardTitle>
              <CardDescription>
                Review and approve deposit requests from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabContent('deposits')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-blue-600" />
                Withdrawal Requests
              </CardTitle>
              <CardDescription>
                Review and approve withdrawal requests from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabContent('withdrawals')}
            </CardContent>
          </Card>
        </div>
      </div>

      <DepositModal
        open={showDepositModal}
        request={selectedRequest}
        action={modalAction}
        onClose={closeModals}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <WithdrawModal
        open={showWithdrawModal}
        request={selectedRequest}
        action={modalAction}
        onClose={closeModals}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminLayout>
  );
}