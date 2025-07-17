'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User } from '@/types';
import { usersAPI } from '@/lib/api';
import { Eye, Check, X, Edit, UserPlus, UserCheck } from 'lucide-react';

export default function IndividualUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching individual users...');
        // Fetch only individual users from backend
        const result = await usersAPI.getUsers(1, 10, undefined, undefined, 'individual');
        console.log('Individual users result:', result);
        setUsers(result.data);
      } catch (error) {
        console.error('Failed to fetch individual users:', error);
        // Show empty state or error message instead of falling back to mock data
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApproveKyc = async (userId: string) => {
    try {
      await usersAPI.approveKyc(userId);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, kycStatus: 'approved' } : user
      ));
    } catch (error) {
      console.error('Failed to approve KYC:', error);
    }
  };

  const handleRejectKyc = async (userId: string) => {
    try {
      await usersAPI.rejectKyc(userId, 'Documents incomplete');
      setUsers(users.map(user => 
        user.id === userId ? { ...user, kycStatus: 'rejected' } : user
      ));
    } catch (error) {
      console.error('Failed to reject KYC:', error);
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getKycStatusBadge = (status: User['kycStatus']) => {
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      not_submitted: 'outline',
    } as const;
    
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'firstName', label: 'Name', render: (value: string, row: User) => `${row.firstName} ${row.lastName}` },
    { key: 'status', label: 'Status', render: (value: User['status']) => getStatusBadge(value) },
    { key: 'kycStatus', label: 'KYC Status', render: (value: User['kycStatus']) => getKycStatusBadge(value) },
    { key: 'totalInvested', label: 'Total Invested', render: (value: number) => formatCurrency(value) },
    { key: 'portfolioValue', label: 'Portfolio Value', render: (value: number) => formatCurrency(value) },
    { key: 'createdAt', label: 'Join Date', render: (value: string) => new Date(value).toLocaleDateString() },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
    {
      key: 'kycStatus',
      label: 'KYC Status',
      options: [
        { value: 'approved', label: 'Approved' },
        { value: 'pending', label: 'Pending' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'not_submitted', label: 'Not Submitted' },
      ],
    },
  ];

  const renderActions = (user: User) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Individual Account Details</DialogTitle>
            <DialogDescription>
              Account information for {user.firstName} {user.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Email</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Phone</span>
                <span className="text-sm">{user.phone ?? 'Not provided'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Account Type</span>
                <span className="text-sm">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Individual Account
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status</span>
                <span className="text-sm">{getStatusBadge(user.status)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">KYC Status</span>
                <span className="text-sm">{getKycStatusBadge(user.kycStatus)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Total Invested</span>
                <span className="text-sm">{formatCurrency(user.totalInvested)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Portfolio Value</span>
                <span className="text-sm">{formatCurrency(user.portfolioValue)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Join Date</span>
                <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Last Login</span>
                <span className="text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {user.kycStatus === 'pending' && (
        <>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleApproveKyc(user.id)}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleRejectKyc(user.id)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      
      <Button variant="ghost" size="sm">
        <Edit className="h-4 w-4" />
      </Button>
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
      <Header title="Individual Accounts" subtitle="Manage individual user accounts" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-lg font-semibold text-gray-900">Individual User Accounts</span>
            <span className="text-sm text-gray-600">{users.length} individual accounts</span>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Individual User
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          data={users}
          filterable
          filterOptions={filterOptions}
          actions={renderActions}
        />
      </div>
    </AdminLayout>
  );
}