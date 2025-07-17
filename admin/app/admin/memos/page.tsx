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
import { Memo } from '@/types';
import { memosAPI } from '@/lib/api';
import { Eye, Edit, Trash2, Plus, MessageSquare, Send, Archive, Users, UserCheck, Users2 } from 'lucide-react';

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMemo, setNewMemo] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const result = await memosAPI.getMemos();
        // Map API response (snake_case) to frontend format (camelCase)
        const mappedMemos = (result.memos || []).map((memo: any) => ({
          ...memo,
          targetAudience: memo.target_audience,
          sendEmail: memo.send_email,
          sendAppNotification: memo.send_app_notification,
          publishImmediately: memo.publish_immediately,
          scheduledPublishAt: memo.scheduled_publish_at,
          publishedAt: memo.published_at,
          createdAt: memo.created_at,
          updatedAt: memo.updated_at,
          createdBy: memo.created_by,
          adminName: memo.admin_name,
        }));
        setMemos(mappedMemos);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch memos:', error);
        setMemos([]); // Start with empty array when API fails
        if (error.message?.includes('relation "public.memos" does not exist')) {
          setError('Database tables not created yet. Please create the memo tables in Supabase first.');
        } else {
          setError(`Failed to load memos: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMemos();
  }, []);

  const handleCreateMemo = async () => {
    try {
      await memosAPI.createMemo(newMemo);
      // Refresh memos list
      const result = await memosAPI.getMemos();
      // Map API response (snake_case) to frontend format (camelCase)
      const mappedMemos = (result.memos || []).map((memo: any) => ({
        ...memo,
        targetAudience: memo.target_audience,
        sendEmail: memo.send_email,
        sendAppNotification: memo.send_app_notification,
        publishImmediately: memo.publish_immediately,
        scheduledPublishAt: memo.scheduled_publish_at,
        publishedAt: memo.published_at,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
        createdBy: memo.created_by,
        adminName: memo.admin_name,
      }));
      setMemos(mappedMemos);
      setShowCreateDialog(false);
      setNewMemo({
        title: '',
        content: '',
        category: 'general',
      });
    } catch (error) {
      console.error('Failed to create memo:', error);
    }
  };

  const handlePublishMemo = async (memoId: string) => {
    try {
      await memosAPI.publishMemo(memoId);
      setMemos(memos.map(memo => 
        memo.id === memoId ? { ...memo, status: 'published', publishedAt: new Date().toISOString() } : memo
      ));
    } catch (error) {
      console.error('Failed to publish memo:', error);
    }
  };

  const handleArchiveMemo = async (memoId: string) => {
    try {
      await memosAPI.archiveMemo(memoId);
      setMemos(memos.map(memo => 
        memo.id === memoId ? { ...memo, status: 'archived' } : memo
      ));
    } catch (error) {
      console.error('Failed to archive memo:', error);
    }
  };

  const getStatusBadge = (status: Memo['status']) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'outline',
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getAudienceBadge = (audience: Memo['targetAudience']) => {
    const config = {
      all: { icon: Users, label: 'All Users', className: 'bg-gray-100 text-gray-800' },
      individual: { icon: UserCheck, label: 'Individual', className: 'bg-blue-100 text-blue-800' },
      joint: { icon: Users2, label: 'Joint', className: 'bg-purple-100 text-purple-800' },
    };
    
    // Default to 'all' if audience is undefined or not in config
    const audienceConfig = config[audience] || config['all'];
    const { icon: Icon, label, className } = audienceConfig;
    
    return (
      <Badge variant="outline" className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'adminName', label: 'Author' },
    { key: 'targetAudience', label: 'Target Audience', render: (value: Memo['targetAudience']) => getAudienceBadge(value) },
    { key: 'status', label: 'Status', render: (value: Memo['status']) => getStatusBadge(value) },
    { key: 'createdAt', label: 'Created', render: (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { key: 'publishedAt', label: 'Published', render: (value: string) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not published' },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      key: 'targetAudience',
      label: 'Target Audience',
      options: [
        { value: 'all', label: 'All Users' },
        { value: 'individual', label: 'Individual Accounts' },
        { value: 'joint', label: 'Joint Accounts' },
      ],
    },
  ];

  const renderActions = (memo: Memo) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setSelectedMemo(memo)}>
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Memo Details</DialogTitle>
            <DialogDescription>
              Memo by {memo.adminName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Title</p>
              <p className="text-lg font-semibold mt-1">{memo.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Content</p>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{memo.content}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Author</p>
                <p className="text-sm">{memo.adminName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Target Audience</p>
                <p className="text-sm">{getAudienceBadge(memo.targetAudience)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-sm">{getStatusBadge(memo.status)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm">{new Date(memo.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {memo.publishedAt && (
              <div>
                <p className="text-sm font-medium text-gray-600">Published At</p>
                <p className="text-sm">{new Date(memo.publishedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="ghost" size="sm">
        <Edit className="h-4 w-4" />
      </Button>
      
      {memo.status === 'draft' && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handlePublishMemo(memo.id)}
          className="text-green-600 hover:text-green-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
      
      {memo.status === 'published' && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleArchiveMemo(memo.id)}
          className="text-orange-600 hover:text-orange-700"
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm"
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

  if (error) {
    return (
      <AdminLayout>
        <Header title="Memos" subtitle="Create and manage educational memos for users" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Memos</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Header title="Memos" subtitle="Create and manage educational memos for users" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Educational Memos</h2>
            <p className="text-sm text-gray-600">{memos.length} total memos</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>{memos.filter(m => m.status === 'published').length} published</span>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Memo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Memo</DialogTitle>
                  <DialogDescription>
                    Create an educational memo to inform and teach users
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter memo title"
                      value={newMemo.title}
                      onChange={(e) => setNewMemo({ ...newMemo, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newMemo.category} onValueChange={(value: any) => setNewMemo({ ...newMemo, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="market-analysis">Market Analysis</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter memo content..."
                      value={newMemo.content}
                      onChange={(e) => setNewMemo({ ...newMemo, content: e.target.value })}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMemo}>
                      Create Memo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={memos}
          filterable
          filterOptions={filterOptions}
          actions={renderActions}
        />
      </div>
    </AdminLayout>
  );
}