'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { notificationsAPI } from '@/lib/api';
import { mockUsers } from '@/lib/mock-data';
import { Send, Mail, Bell, Users, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(mockUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      setError('Please fill in all notification fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const userIds = targetAudience === 'all' ? mockUsers.map(u => u.id) : selectedUsers;
      await notificationsAPI.sendNotification(userIds, notificationTitle, notificationMessage);
      setSuccess(`Notification sent to ${userIds.length} users`);
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error) {
      setError('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      setError('Please fill in all email fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const userIds = targetAudience === 'all' ? mockUsers.map(u => u.id) : selectedUsers;
      await notificationsAPI.sendEmail(userIds, emailSubject, emailBody);
      setSuccess(`Email sent to ${userIds.length} users`);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      setError('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const getTargetedUsers = () => {
    switch (targetAudience) {
      case 'all':
        return mockUsers;
      case 'active':
        return mockUsers.filter(u => u.status === 'active');
      case 'kyc_pending':
        return mockUsers.filter(u => u.kycStatus === 'pending');
      case 'selected':
        return mockUsers.filter(u => selectedUsers.includes(u.id));
      default:
        return mockUsers;
    }
  };

  return (
    <AdminLayout>
      <Header title="Notifications" subtitle="Send notifications and emails to users" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Push Notifications</span>
              </CardTitle>
              <CardDescription>
                Send in-app notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notificationTitle">Title</Label>
                <Input
                  id="notificationTitle"
                  placeholder="Enter notification title"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="notificationMessage">Message</Label>
                <Textarea
                  id="notificationMessage"
                  placeholder="Enter notification message"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSendNotification}
                disabled={isLoading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </CardTitle>
              <CardDescription>
                Send email messages to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  placeholder="Enter email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="emailBody">Message</Label>
                <Textarea
                  id="emailBody"
                  placeholder="Enter email body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSendEmail}
                disabled={isLoading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Email'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Target Audience */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Target Audience</span>
            </CardTitle>
            <CardDescription>
              Select who should receive your notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetAudience">Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users Only</SelectItem>
                  <SelectItem value="kyc_pending">KYC Pending Users</SelectItem>
                  <SelectItem value="selected">Selected Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {getTargetedUsers().length} users will receive this message
              </p>
              <Badge variant="outline">
                {getTargetedUsers().length} recipients
              </Badge>
            </div>

            {targetAudience === 'selected' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedUsers.length === mockUsers.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="selectAll" className="font-medium">
                    Select All Users
                  </Label>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                      />
                      <Label htmlFor={user.id} className="text-sm">
                        {user.firstName} {user.lastName} ({user.email})
                      </Label>
                      <Badge variant="outline" className="ml-auto">
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </AdminLayout>
  );
}