import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DataTable } from '../DataTable';

interface GroupSummaryStats {
  total_groups: number;
  active_groups: number;
  pending_approval: number;
  total_members: number;
  total_balance: number;
}

interface GroupTypeStats {
  group_type: string;
  group_count: number;
  member_count: number;
  total_balance: number;
}

interface GroupData {
  id: string;
  name: string;
  type: string;
  status: string;
  member_count: number;
  group_balance: number;
  created_at: string;
  last_activity: string;
  contribution_frequency: string;
  minimum_contribution: number;
}

const GroupOverviewDashboard: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<GroupSummaryStats | null>(null);
  const [typeStats, setTypeStats] = useState<GroupTypeStats[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Simulated data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setSummaryStats({
        total_groups: 45,
        active_groups: 38,
        pending_approval: 7,
        total_members: 348,
        total_balance: 8570000
      });

      setTypeStats([
        { group_type: 'sacco', group_count: 15, member_count: 145, total_balance: 2500000 },
        { group_type: 'investment_club', group_count: 12, member_count: 89, total_balance: 1800000 },
        { group_type: 'family_account', group_count: 8, member_count: 24, total_balance: 650000 },
        { group_type: 'joint_account', group_count: 6, member_count: 18, total_balance: 420000 },
        { group_type: 'corporate', group_count: 4, member_count: 72, total_balance: 3200000 }
      ]);

      setGroups([
        {
          id: '1',
          name: 'Kifaru Investment Club',
          type: 'investment_club',
          status: 'active',
          member_count: 12,
          group_balance: 450000,
          created_at: '2024-01-15',
          last_activity: '2024-01-20',
          contribution_frequency: 'monthly',
          minimum_contribution: 10000
        },
        {
          id: '2',
          name: 'Uzima SACCO',
          type: 'sacco',
          status: 'active',
          member_count: 25,
          group_balance: 780000,
          created_at: '2023-11-20',
          last_activity: '2024-01-19',
          contribution_frequency: 'monthly',
          minimum_contribution: 5000
        },
        {
          id: '3',
          name: 'Mwangi Family Account',
          type: 'family_account',
          status: 'active',
          member_count: 4,
          group_balance: 125000,
          created_at: '2024-01-10',
          last_activity: '2024-01-18',
          contribution_frequency: 'weekly',
          minimum_contribution: 2000
        }
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sacco': return '🏦';
      case 'investment_club': return '💰';
      case 'family_account': return '👨‍👩‍👧‍👦';
      case 'joint_account': return '🤝';
      case 'corporate': return '🏢';
      case 'chama': return '🔄';
      case 'cooperative': return '🤲';
      default: return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || group.type === filterType;
    const matchesStatus = filterStatus === 'all' || group.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const groupColumns = [
    {
      accessorKey: 'name',
      header: 'Group Name',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(row.original.type)}</span>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.type.replace('_', ' ').toUpperCase()}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'member_count',
      header: 'Members',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <Users size={16} />
          <span>{row.original.member_count}</span>
        </div>
      ),
    },
    {
      accessorKey: 'group_balance',
      header: 'Balance',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <DollarSign size={16} />
          <span className="font-medium">{formatCurrency(row.original.group_balance)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'contribution_frequency',
      header: 'Frequency',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <Calendar size={16} />
          <span>{row.original.contribution_frequency}</span>
        </div>
      ),
    },
    {
      accessorKey: 'last_activity',
      header: 'Last Activity',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.last_activity).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups Overview</h1>
          <p className="text-gray-600">Manage and monitor all group accounts</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Create Group
        </Button>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total_groups}</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.active_groups} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.active_groups}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((summaryStats.active_groups / summaryStats.total_groups) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total_members}</div>
              <p className="text-xs text-muted-foreground">
                Across all groups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.total_balance)}</div>
              <p className="text-xs text-muted-foreground">
                Combined group funds
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Group Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Groups by Type</CardTitle>
          <CardDescription>Distribution of groups across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typeStats.map((stat) => (
              <div key={stat.group_type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(stat.group_type)}</span>
                  <div>
                    <div className="font-medium">
                      {stat.group_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stat.member_count} members
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stat.group_count} groups</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(stat.total_balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Recent Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>3 groups have overdue contributions</span>
              <Button variant="link" className="text-yellow-800 p-0 h-auto">
                View Details
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>2 groups require approval for new investments</span>
              <Button variant="link" className="text-yellow-800 p-0 h-auto">
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>1 group has pending member applications</span>
              <Button variant="link" className="text-yellow-800 p-0 h-auto">
                Process
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
          <CardDescription>Comprehensive list of all group accounts</CardDescription>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                icon={<Search size={16} />}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sacco">SACCO</SelectItem>
                <SelectItem value="investment_club">Investment Club</SelectItem>
                <SelectItem value="family_account">Family Account</SelectItem>
                <SelectItem value="joint_account">Joint Account</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={groupColumns}
            data={filteredGroups}
            searchKey="name"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupOverviewDashboard;
