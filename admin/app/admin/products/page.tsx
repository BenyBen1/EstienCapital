'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types';
import { productsAPI } from '@/lib/api';
import { Eye, Edit, Trash2, Plus, TrendingUp } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    minimumInvestment: 0,
    riskLevel: 'medium' as const,
    status: 'active' as const,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsAPI.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    try {
      await productsAPI.createProduct(newProduct);
      // Refresh products list
      const data = await productsAPI.getProducts();
      setProducts(data);
      setShowCreateDialog(false);
      setNewProduct({
        name: '',
        description: '',
        category: '',
        minimumInvestment: 0,
        riskLevel: 'medium',
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsAPI.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const getStatusBadge = (status: Product['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      closed: 'destructive',
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getRiskLevelBadge = (riskLevel: Product['riskLevel']) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
    } as const;
    
    return <Badge variant={variants[riskLevel]}>{riskLevel} risk</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'riskLevel', label: 'Risk Level', render: (value: Product['riskLevel']) => getRiskLevelBadge(value) },
    { key: 'minimumInvestment', label: 'Min Investment', render: (value: number) => formatCurrency(value) },
    { key: 'currentValue', label: 'Current Value', render: (value: number) => formatCurrency(value) },
    { key: 'annualReturn', label: 'Annual Return', render: (value: number) => `${value}%` },
    { key: 'status', label: 'Status', render: (value: Product['status']) => getStatusBadge(value) },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      options: [
        { value: 'low', label: 'Low Risk' },
        { value: 'medium', label: 'Medium Risk' },
        { value: 'high', label: 'High Risk' },
      ],
    },
  ];

  const renderActions = (product: Product) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed information for {product.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-sm mt-1">{product.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="text-sm">{product.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Level</p>
                <p className="text-sm">{getRiskLevelBadge(product.riskLevel)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Minimum Investment</p>
                <p className="text-sm">{formatCurrency(product.minimumInvestment)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-sm">{formatCurrency(product.currentValue)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-sm">{formatCurrency(product.totalInvested)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Annual Return</p>
                <p className="text-sm">{product.annualReturn}%</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="ghost" size="sm">
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleDeleteProduct(product.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
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
      <Header title="Products" subtitle="Manage investment products" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Investment Products</h2>
            <p className="text-sm text-gray-600">{products.length} total products</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new investment product to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumInvestment">Minimum Investment</Label>
                    <Input
                      id="minimumInvestment"
                      type="number"
                      value={newProduct.minimumInvestment}
                      onChange={(e) => setNewProduct({ ...newProduct, minimumInvestment: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={newProduct.riskLevel} onValueChange={(value: any) => setNewProduct({ ...newProduct, riskLevel: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newProduct.status} onValueChange={(value: any) => setNewProduct({ ...newProduct, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProduct}>
                    Create Product
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <DataTable
          columns={columns}
          data={products}
          filterable
          filterOptions={filterOptions}
          actions={renderActions}
        />
      </div>
    </AdminLayout>
  );
}