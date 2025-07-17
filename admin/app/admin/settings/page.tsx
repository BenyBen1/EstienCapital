'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Admin, AuditLog } from '@/types';
import { adminAPI } from '@/lib/api';
import { UserPlus, Shield, Eye, Edit, Trash2, Activity } from 'lucide-react';

export default function SettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'admin' as const,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsData, auditData] = await Promise.all([
          adminAPI.getAdmins(),
          adminAPI.getAuditLogs(),
        ]);
        setAdmins(adminsData);
        setAuditLogs(auditData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAdmin = async () => {
    try {
      // TODO: Implement create admin API call
      setShowCreateDialog(false);
      setNewAdmin({
        email: '',
        firstName: '',
        lastName: '',
        role: 'admin',
      });
    } catch (error) {
      console.error('Failed to create admin:', error);
    }
  };

  const getRoleBadge = (role: Admin['role']) => {
    const variants = {
      super_admin: 'default',
      admin: 'secondary',
      moderator: 'outline',
    } as const;
    
    return <Badge variant={variants[role]}>{role.replace('_', ' ')}</Badge>;
  };

  const adminColumns = [
    { key: 'email', label: 'Email' },
    { key: 'firstName', label: 'Name', render: (value: string, row: Admin) => `${row.firstName} ${row.lastName}` },
    { key: 'role', label: 'Role', render: (value: Admin['role']) => getRoleBadge(value) },
    { key: 'createdAt', label: 'Created', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'lastLogin', label: 'Last Login', render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Never' },
  ];

  const auditColumns = [
    { key: 'adminName', label: 'Admin' },
    { key: 'action', label: 'Action' },
    { key: 'entityType', label: 'Entity Type' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'createdAt', label: 'Date', render: (value: string) => new Date(value).toLocaleString() },
  ];

  const renderAdminActions = (admin: Admin) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
            <DialogDescription>
              Details for {admin.firstName} {admin.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm">{admin.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-sm">{getRoleBadge(admin.role)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm">{new Date(admin.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-sm">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Permissions</p>
              <div className="mt-2 space-y-1">
                {admin.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {permission}
                  </Badge>
                ))}
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
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderAuditActions = (log: AuditLog) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Action performed by {log.adminName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-sm">{log.adminName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Action</p>
                <p className="text-sm">{log.action}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Entity Type</p>
                <p className="text-sm">{log.entityType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Entity ID</p>
                <p className="text-sm">{log.entityId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-sm">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Changes</p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
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
      <Header title="Settings" subtitle="Manage admin users and system settings" />
      
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="admins" className="space-y-6">
          <TabsList>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admins" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Admin Users</span>
                    </CardTitle>
                    <CardDescription>
                      Manage admin users and their permissions
                    </CardDescription>
                  </div>
                  
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                          Create a new admin user account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={newAdmin.firstName}
                              onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={newAdmin.lastName}
                              onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={newAdmin.role} onValueChange={(value: any) => setNewAdmin({ ...newAdmin, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateAdmin}>
                            Create Admin
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={adminColumns}
                  data={admins}
                  actions={renderAdminActions}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Audit Logs</span>
                </CardTitle>
                <CardDescription>
                  Track all admin actions and system changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={auditColumns}
                  data={auditLogs}
                  actions={renderAuditActions}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}