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
import { Eye, Check, X, Edit, UserPlus, Users2 } from 'lucide-react';

export default function JointUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch only joint users from backend
        const result = await usersAPI.getUsers(1, 10, undefined, undefined, 'joint');
        setUsers(result.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
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
    { key: 'email', label: 'Primary Email' },
    { 
      key: 'firstName', 
      label: 'Primary Holder', 
      render: (value: string, row: User) => `${row.firstName} ${row.lastName}` 
    },
    { 
      key: 'jointAccountHolder', 
      label: 'Joint Holder', 
      render: (value: User['jointAccountHolder']) => 
        value ? `${value.firstName} ${value.lastName}` : 'N/A'
    },
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Joint Account Details</DialogTitle>
            <DialogDescription>
              Joint account information for {user.firstName} {user.lastName} and {user.jointAccountHolder?.firstName} {user.jointAccountHolder?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Type</p>
                  <p className="text-sm">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      <Users2 className="h-3 w-3 mr-1" />
                      Joint Account
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-sm">{getStatusBadge(user.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">KYC Status</p>
                  <p className="text-sm">{getKycStatusBadge(user.kycStatus)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Join Date</p>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-sm">{formatCurrency(user.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                  <p className="text-sm">{formatCurrency(user.portfolioValue)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3 text-blue-700">Primary Account Holder</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-sm">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-sm">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Login</p>
                    <p className="text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3 text-purple-700">Joint Account Holder</h4>
                {user.jointAccountHolder ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p className="text-sm">{user.jointAccountHolder.firstName} {user.jointAccountHolder.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-sm">{user.jointAccountHolder.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-sm">{user.jointAccountHolder.phone || 'Not provided'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No joint account holder information available</p>
                )}
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
      <Header title="Joint Accounts" subtitle="Manage joint user accounts" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Joint User Accounts</h2>
            <p className="text-sm text-gray-600">{users.length} joint accounts</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Joint Account
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