'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Portfolio } from '@/types';
import { portfoliosAPI } from '@/lib/api';
import { Eye, TrendingUp, TrendingDown } from 'lucide-react';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const result = await portfoliosAPI.getPortfolios();
        setPortfolios(result.data);
      } catch (error) {
        console.error('Failed to fetch portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        {value.toFixed(2)}%
      </span>
    );
  };

  const columns = [
    { key: 'userName', label: 'User Name' },
    { key: 'totalInvested', label: 'Total Invested', render: (value: number) => formatCurrency(value) },
    { key: 'totalValue', label: 'Current Value', render: (value: number) => formatCurrency(value) },
    { key: 'returnAmount', label: 'Return Amount', render: (value: number) => formatCurrency(value) },
    { key: 'returnPercentage', label: 'Return %', render: (value: number) => formatPercentage(value) },
    { key: 'holdings', label: 'Holdings', render: (value: any[]) => `${value.length} products` },
    { key: 'createdAt', label: 'Created', render: (value: string) => new Date(value).toLocaleDateString() },
  ];

  const renderActions = (portfolio: Portfolio) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPortfolio(portfolio)}>
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Portfolio Details</DialogTitle>
            <DialogDescription>
              Portfolio information for {portfolio.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Total Invested</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(portfolio.totalInvested)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800">Current Value</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(portfolio.totalValue)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Return Amount</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(portfolio.returnAmount)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-orange-800">Return %</p>
                <p className="text-2xl font-bold text-orange-900">{portfolio.returnPercentage.toFixed(2)}%</p>
              </div>
            </div>

            {/* Holdings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Holdings</h3>
              <div className="bg-white rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shares</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invested</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {portfolio.holdings.map((holding, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium">{holding.productName}</td>
                        <td className="px-4 py-3">{holding.shares}</td>
                        <td className="px-4 py-3">{formatCurrency(holding.investedAmount)}</td>
                        <td className="px-4 py-3">{formatCurrency(holding.currentValue)}</td>
                        <td className="px-4 py-3">{formatPercentage(holding.returnPercentage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
      <Header title="Portfolios" subtitle="Monitor user portfolios and performance" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Portfolios</h2>
            <p className="text-sm text-gray-600">{portfolios.length} active portfolios</p>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={portfolios}
          actions={renderActions}
        />
      </div>
    </AdminLayout>
  );
}