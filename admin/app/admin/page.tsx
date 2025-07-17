'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/types';
import { dashboardAPI } from '@/lib/api';
import { Users, DollarSign, TrendingUp, CreditCard, Package, UserCheck, AlertTriangle, Activity, Users2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await dashboardAPI.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <AdminLayout>
      <Header title="Dashboard" subtitle="Welcome to Estien Capital Admin Portal" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={formatNumber(metrics?.totalUsers || 0)}
              change="+12% from last month"
              changeType="positive"
              icon={<Users className="h-6 w-6" />}
            />
            <MetricCard
              title="Active Users"
              value={formatNumber(metrics?.activeUsers || 0)}
              change="+8% from last month"
              changeType="positive"
              icon={<Activity className="h-6 w-6" />}
            />
            <MetricCard
              title="Total Assets"
              value={formatCurrency(metrics?.totalAssets || 0)}
              change="+15% from last month"
              changeType="positive"
              icon={<DollarSign className="h-6 w-6" />}
            />
            <MetricCard
              title="Monthly Volume"
              value={formatCurrency(metrics?.monthlyTransactionVolume || 0)}
              change="+22% from last month"
              changeType="positive"
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>

          {/* Account Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Individual Accounts"
              value={formatNumber(metrics?.individualAccounts || 0)}
              change={`${((metrics?.individualAccounts || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}% of total`}
              changeType="neutral"
              icon={<UserCheck className="h-6 w-6" />}
            />
            <MetricCard
              title="Joint Accounts"
              value={formatNumber(metrics?.jointAccounts || 0)}
              change={`${((metrics?.jointAccounts || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}% of total`}
              changeType="neutral"
              icon={<Users2 className="h-6 w-6" />}
            />
            <MetricCard
              title="Published Memos"
              value={formatNumber(metrics?.publishedMemos || 0)}
              change="Educational content"
              changeType="positive"
              icon={<MessageSquare className="h-6 w-6" />}
            />
            <MetricCard
              title="Pending KYC"
              value={formatNumber(metrics?.pendingKyc || 0)}
              change="Requires attention"
              changeType="negative"
              icon={<AlertTriangle className="h-6 w-6" />}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Pending Transactions"
              value={formatNumber(metrics?.pendingTransactions || 0)}
              change="Awaiting approval"
              changeType="neutral"
              icon={<CreditCard className="h-6 w-6" />}
            />
            <MetricCard
              title="Active Products"
              value={`${metrics?.activeProducts || 0}/${metrics?.totalProducts || 0}`}
              change="Investment products"
              changeType="positive"
              icon={<Package className="h-6 w-6" />}
            />
            <MetricCard
              title="Total Transactions"
              value={formatNumber(metrics?.totalTransactions || 0)}
              change="All-time total"
              changeType="neutral"
              icon={<Activity className="h-6 w-6" />}
            />
            <MetricCard
              title="System Health"
              value="Operational"
              change="All systems running"
              changeType="positive"
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Pending Actions</span>
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800">KYC Approvals</p>
                      <p className="text-sm text-orange-600">{metrics?.pendingKyc || 0} pending reviews</p>
                    </div>
                    <div className="text-orange-600 font-bold">{metrics?.pendingKyc || 0}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Transaction Approvals</p>
                      <p className="text-sm text-blue-600">{metrics?.pendingTransactions || 0} pending transactions</p>
                    </div>
                    <div className="text-blue-600 font-bold">{metrics?.pendingTransactions || 0}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Active Products</p>
                      <p className="text-sm text-green-600">{metrics?.activeProducts || 0} products available</p>
                    </div>
                    <div className="text-green-600 font-bold">{metrics?.activeProducts || 0}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      href="/admin/users" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <span>View All Users</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Distribution</CardTitle>
                <CardDescription>Breakdown of account types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Individual Accounts</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{metrics?.individualAccounts || 0}</p>
                      <p className="text-xs text-gray-500">
                        {((metrics?.individualAccounts || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Joint Accounts</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{metrics?.jointAccounts || 0}</p>
                      <p className="text-xs text-gray-500">
                        {((metrics?.jointAccounts || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Users</span>
                      <span className="text-sm font-bold">{metrics?.totalUsers || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}