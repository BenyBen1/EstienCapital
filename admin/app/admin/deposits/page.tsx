'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { transactionsAPI } from '@/lib/api';
import { CheckCircle, XCircle, Search, Filter, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface DepositTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected';
  payment_method: string;
  reference_number: string;
  description: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const filters = {
        type: 'deposit',
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      
      const result = await transactionsAPI.getTransactions(currentPage, 20, filters);
      
      if (result.data) {
        setDeposits(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / 20));
      } else {
        toast.error('Failed to fetch deposits');
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Error loading deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [currentPage, statusFilter]);

  const handleApprove = async (transactionId: string) => {
    try {
      setActionLoading(true);
      const result = await transactionsAPI.approveTransaction(transactionId);
      
      if (result.success) {
        toast.success('Deposit approved successfully');
        fetchDeposits();
      } else {
        toast.error(result.error || 'Failed to approve deposit');
      }
    } catch (error) {
      toast.error('Error approving deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      setActionLoading(true);
      const result = await transactionsAPI.rejectTransaction(transactionId, 'Deposit verification failed');
      
      if (result.success) {
        toast.success('Deposit rejected successfully');
        fetchDeposits();
      } else {
        toast.error(result.error || 'Failed to reject deposit');
      }
    } catch (error) {
      toast.error('Error rejecting deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = searchTerm === '' || 
      deposit.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalAmount = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const pendingAmount = deposits.filter(d => d.status === 'pending').reduce((sum, deposit) => sum + deposit.amount, 0);
  const completedAmount = deposits.filter(d => d.status === 'completed').reduce((sum, deposit) => sum + deposit.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deposit Requests</h1>
          <p className="text-muted-foreground">
            Review and approve customer deposit confirmations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {deposits.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              KES {pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {deposits.filter(d => d.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {completedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {deposits.filter(d => d.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deposits.length > 0 ? Math.round((deposits.filter(d => d.status === 'completed').length / deposits.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Requests</CardTitle>
          <CardDescription>
            Review customer deposit confirmations and approve or reject them
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {deposit.profiles?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {deposit.profiles?.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {deposit.profiles?.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {deposit.currency} {deposit.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {deposit.payment_method || 'Bank Transfer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {deposit.reference_number}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(deposit.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {deposit.status === 'pending' && (
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={actionLoading}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Deposit</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve this deposit of {deposit.currency} {deposit.amount.toLocaleString()}? 
                                    The funds will be credited to the customer's account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApprove(deposit.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve Deposit
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={actionLoading}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Deposit</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject this deposit? The customer will be notified.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(deposit.id)}
                                    variant="destructive"
                                  >
                                    Reject Deposit
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {deposit.status !== 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            {deposit.status === 'completed' ? 'Processed' : 'Rejected'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDeposits.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No deposits found</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}