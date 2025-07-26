'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { kycAPI } from '@/lib/api';
import { Eye, CheckCircle, XCircle, Search, Filter, Download } from 'lucide-react';

interface KycSubmission {
  id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  id_type: string;
  id_number: string;
  kra_pin: string;
  occupation: string;
  source_of_wealth: string;
  physical_address: string;
  city: string;
  country: string;
  postal_address: string;
  postal_code: string;
  next_of_kin_first_name: string;
  next_of_kin_last_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone: string;
  next_of_kin_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  notes?: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    account_type: string;
  };
}

export default function KycSubmissionsPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const result = await kycAPI.getKycSubmissions(currentPage, 20, statusFilter);
      
      if (result.success) {
        setSubmissions(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } else {
        toast.error('Failed to fetch KYC submissions');
      }
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Error loading KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, statusFilter]);

  const handleApprove = async (submissionId: string) => {
    try {
      setActionLoading(true);
      const result = await kycAPI.approveKycSubmission(submissionId, approvalNotes);
      
      if (result.success) {
        toast.success('KYC submission approved successfully');
        setApprovalNotes('');
        fetchSubmissions();
      } else {
        toast.error(result.error || 'Failed to approve KYC submission');
      }
    } catch (error) {
      toast.error('Error approving KYC submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      const result = await kycAPI.rejectKycSubmission(submissionId, rejectionReason);
      
      if (result.success) {
        toast.success('KYC submission rejected successfully');
        setRejectionReason('');
        fetchSubmissions();
      } else {
        toast.error(result.error || 'Failed to reject KYC submission');
      }
    } catch (error) {
      toast.error('Error rejecting KYC submission');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.id_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KYC Submissions</h1>
            <p className="text-muted-foreground">
              Review and manage customer verification submissions
            </p>
          </div>
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
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or ID number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {submissions.filter(s => s.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions</CardTitle>
          <CardDescription>
            Review customer verification documents and approve or reject submissions
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
                    <TableHead>Account Type</TableHead>
                    <TableHead>ID Type</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {submission.profiles?.first_name} {submission.profiles?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {submission.profiles?.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {submission.profiles?.phone_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.profiles?.account_type || 'individual'}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.id_type}</TableCell>
                      <TableCell>{submission.id_number}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>KYC Submission Details</DialogTitle>
                                <DialogDescription>
                                  Review customer verification information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Full Name</Label>
                                      <p className="text-sm">{selectedSubmission.first_name} {selectedSubmission.middle_name} {selectedSubmission.last_name}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm">{selectedSubmission.profiles?.email}</p>
                                    </div>
                                    <div>
                                      <Label>Phone</Label>
                                      <p className="text-sm">{selectedSubmission.phone_number}</p>
                                    </div>
                                    <div>
                                      <Label>Date of Birth</Label>
                                      <p className="text-sm">{selectedSubmission.date_of_birth}</p>
                                    </div>
                                    <div>
                                      <Label>Gender</Label>
                                      <p className="text-sm">{selectedSubmission.gender}</p>
                                    </div>
                                    <div>
                                      <Label>ID Type</Label>
                                      <p className="text-sm">{selectedSubmission.id_type}</p>
                                    </div>
                                    <div>
                                      <Label>ID Number</Label>
                                      <p className="text-sm">{selectedSubmission.id_number}</p>
                                    </div>
                                    <div>
                                      <Label>KRA PIN</Label>
                                      <p className="text-sm">{selectedSubmission.kra_pin}</p>
                                    </div>
                                    <div>
                                      <Label>Occupation</Label>
                                      <p className="text-sm">{selectedSubmission.occupation}</p>
                                    </div>
                                    <div>
                                      <Label>Source of Wealth</Label>
                                      <p className="text-sm">{selectedSubmission.source_of_wealth}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Address</Label>
                                    <p className="text-sm">
                                      {selectedSubmission.physical_address}<br/>
                                      {selectedSubmission.city}, {selectedSubmission.country}<br/>
                                      Postal: {selectedSubmission.postal_address}, {selectedSubmission.postal_code}
                                    </p>
                                  </div>

                                  <div>
                                    <Label>Next of Kin</Label>
                                    <p className="text-sm">
                                      {selectedSubmission.next_of_kin_first_name} {selectedSubmission.next_of_kin_last_name}<br/>
                                      Relationship: {selectedSubmission.next_of_kin_relationship}<br/>
                                      Phone: {selectedSubmission.next_of_kin_phone}<br/>
                                      Email: {selectedSubmission.next_of_kin_email}
                                    </p>
                                  </div>

                                  {selectedSubmission.status === 'pending' && (
                                    <div className="flex gap-4 pt-4 border-t">
                                      <div className="flex-1">
                                        <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                                        <Textarea
                                          id="approval-notes"
                                          placeholder="Add any notes for the approval..."
                                          value={approvalNotes}
                                          onChange={(e) => setApprovalNotes(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button className="bg-green-600 hover:bg-green-700">
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Approve
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Approve KYC Submission</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to approve this KYC submission? The user will gain full access to all platform features.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleApprove(selectedSubmission.id)}
                                                disabled={actionLoading}
                                                className="bg-green-600 hover:bg-green-700"
                                              >
                                                {actionLoading ? 'Approving...' : 'Approve'}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>

                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="destructive">
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Reject KYC Submission</DialogTitle>
                                              <DialogDescription>
                                                Please provide a reason for rejecting this submission
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                                                <Textarea
                                                  id="rejection-reason"
                                                  placeholder="Please specify why this submission is being rejected..."
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  required
                                                />
                                              </div>
                                              <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setRejectionReason('')}>
                                                  Cancel
                                                </Button>
                                                <Button
                                                  variant="destructive"
                                                  onClick={() => handleReject(selectedSubmission.id)}
                                                  disabled={actionLoading || !rejectionReason.trim()}
                                                >
                                                  {actionLoading ? 'Rejecting...' : 'Reject Submission'}
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  )}

                                  {selectedSubmission.status !== 'pending' && (
                                    <div className="pt-4 border-t">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Reviewed At</Label>
                                          <p className="text-sm">{selectedSubmission.reviewed_at ? new Date(selectedSubmission.reviewed_at).toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label>Reviewed By</Label>
                                          <p className="text-sm">{selectedSubmission.reviewed_by || 'N/A'}</p>
                                        </div>
                                        {selectedSubmission.rejection_reason && (
                                          <div className="col-span-2">
                                            <Label>Rejection Reason</Label>
                                            <p className="text-sm">{selectedSubmission.rejection_reason}</p>
                                          </div>
                                        )}
                                        {selectedSubmission.notes && (
                                          <div className="col-span-2">
                                            <Label>Notes</Label>
                                            <p className="text-sm">{selectedSubmission.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSubmissions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No KYC submissions found</p>
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
  </AdminLayout>
);
}