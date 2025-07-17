'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { usersAPI } from '@/lib/api';
import { Users, UserCheck, Users2, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function UsersOverviewPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await usersAPI.getUsers();
        setUsers(result.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const individualUsers = users.filter(user => user.accountType === 'individual');
  const jointUsers = users.filter(user => user.accountType === 'joint');
  const activeUsers = users.filter(user => user.status === 'active');
  const pendingKyc = users.filter(user => user.kycStatus === 'pending');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalInvested = users.reduce((sum, user) => sum + user.totalInvested, 0);
  const totalPortfolioValue = users.reduce((sum, user) => sum + user.portfolioValue, 0);

  return (
    <AdminLayout>
      <Header title="Users" subtitle="Manage user accounts and KYC status" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeUsers.length} active users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Individual Accounts</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{individualUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {((individualUsers.length / users.length) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Joint Accounts</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jointUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {((jointUsers.length / users.length) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingKyc.length}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Account Type Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span>Individual Accounts</span>
                </CardTitle>
                <CardDescription>
                  Manage individual user accounts and their investments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{individualUsers.length}</p>
                    <p className="text-sm text-gray-600">Total individual accounts</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Individual
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Invested:</span>
                    <span className="font-medium">
                      {formatCurrency(individualUsers.reduce((sum, user) => sum + user.totalInvested, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Portfolio Value:</span>
                    <span className="font-medium">
                      {formatCurrency(individualUsers.reduce((sum, user) => sum + user.portfolioValue, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Users:</span>
                    <span className="font-medium">
                      {individualUsers.filter(u => u.status === 'active').length}
                    </span>
                  </div>
                </div>
                
                <Link href="/admin/users/individual">
                  <Button className="w-full">
                    Manage Individual Accounts
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users2 className="h-5 w-5 text-purple-600" />
                  <span>Joint Accounts</span>
                </CardTitle>
                <CardDescription>
                  Manage joint accounts for couples and partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{jointUsers.length}</p>
                    <p className="text-sm text-gray-600">Total joint accounts</p>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Joint
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Invested:</span>
                    <span className="font-medium">
                      {formatCurrency(jointUsers.reduce((sum, user) => sum + user.totalInvested, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Portfolio Value:</span>
                    <span className="font-medium">
                      {formatCurrency(jointUsers.reduce((sum, user) => sum + user.portfolioValue, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Accounts:</span>
                    <span className="font-medium">
                      {jointUsers.filter(u => u.status === 'active').length}
                    </span>
                  </div>
                </div>
                
                <Link href="/admin/users/joint">
                  <Button className="w-full">
                    Manage Joint Accounts
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance Overview</CardTitle>
              <CardDescription>
                Combined performance across all account types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvested)}</p>
                  <p className="text-sm text-gray-600">Total Invested</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPortfolioValue)}</p>
                  <p className="text-sm text-gray-600">Current Portfolio Value</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {((totalPortfolioValue - totalInvested) / totalInvested * 100).toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">Overall Return</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}