import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit,
  UserPlus,
  FileText,
  Settings
} from 'lucide-react';
import DataTable from '../components/DataTable';

interface GroupDetails {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  created_at: string;
  member_count: number;
  max_members: number;
  group_balance: number;
  contribution_frequency: string;
  minimum_contribution: number;
  investment_strategy: string;
  total_contributions: number;
  total_investments: number;
  returns_ytd: number;
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  account_number: string;
  total_contributed: number;
  equity_percentage: number;
  contribution_status: string;
  last_contribution_date: string;
  joined_date: string;
}

interface GroupInvestment {
  id: string;
  investment_name: string;
  amount: number;
  allocation_percentage: number;
  status: string;
  expected_return: number;
  actual_return: number;
  decision_date: string;
  maturity_date: string;
}

interface GroupContribution {
  id: string;
  member_name: string;
  amount: number;
  contribution_type: string;
  due_date: string;
  paid_date: string;
  status: string;
  payment_method: string;
}

const GroupManagementDetail: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [investments, setInvestments] = useState<GroupInvestment[]>([]);
  const [contributions, setContributions] = useState<GroupContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock group details
      setGroupDetails({
        id: groupId,
        name: 'Kifaru Investment Club',
        type: 'investment_club',
        status: 'active',
        description: 'Monthly investment club focused on long-term wealth building through diversified portfolios',
        created_at: '2024-01-15',
        member_count: 12,
        max_members: 15,
        group_balance: 450000,
        contribution_frequency: 'monthly',
        minimum_contribution: 10000,
        investment_strategy: 'moderate',
        total_contributions: 600000,
        total_investments: 520000,
        returns_ytd: 12.5
      });

      // Mock members data
      setMembers([
        {
          id: '1',
          name: 'John Kamau',
          email: 'john.kamau@email.com',
          phone: '+254700123456',
          role: 'chairman',
          account_number: 'ACC001',
          total_contributed: 45000,
          equity_percentage: 15.2,
          contribution_status: 'up_to_date',
          last_contribution_date: '2024-01-15',
          joined_date: '2024-01-15'
        },
        {
          id: '2',
          name: 'Mary Wanjiku',
          email: 'mary.wanjiku@email.com',
          phone: '+254700123457',
          role: 'treasurer',
          account_number: 'ACC002',
          total_contributed: 42000,
          equity_percentage: 14.8,
          contribution_status: 'up_to_date',
          last_contribution_date: '2024-01-15',
          joined_date: '2024-01-15'
        },
        {
          id: '3',
          name: 'Peter Otieno',
          email: 'peter.otieno@email.com',
          phone: '+254700123458',
          role: 'member',
          account_number: 'ACC003',
          total_contributed: 38000,
          equity_percentage: 13.1,
          contribution_status: 'overdue',
          last_contribution_date: '2023-12-15',
          joined_date: '2024-01-15'
        }
      ]);

      // Mock investments data
      setInvestments([
        {
          id: '1',
          investment_name: 'Government Bond 2025',
          amount: 200000,
          allocation_percentage: 44.4,
          status: 'active',
          expected_return: 8.5,
          actual_return: 8.7,
          decision_date: '2024-01-20',
          maturity_date: '2025-01-20'
        },
        {
          id: '2',
          investment_name: 'Equity Fund A',
          amount: 150000,
          allocation_percentage: 33.3,
          status: 'active',
          expected_return: 15.0,
          actual_return: 18.2,
          decision_date: '2024-01-25',
          maturity_date: '2025-01-25'
        },
        {
          id: '3',
          investment_name: 'Money Market Fund',
          amount: 100000,
          allocation_percentage: 22.2,
          status: 'active',
          expected_return: 6.5,
          actual_return: 7.1,
          decision_date: '2024-02-01',
          maturity_date: '2024-08-01'
        }
      ]);

      // Mock contributions data
      setContributions([
        {
          id: '1',
          member_name: 'John Kamau',
          amount: 10000,
          contribution_type: 'regular',
          due_date: '2024-01-31',
          paid_date: '2024-01-30',
          status: 'paid',
          payment_method: 'mpesa'
        },
        {
          id: '2',
          member_name: 'Mary Wanjiku',
          amount: 10000,
          contribution_type: 'regular',
          due_date: '2024-01-31',
          paid_date: '2024-01-29',
          status: 'paid',
          payment_method: 'bank_transfer'
        },
        {
          id: '3',
          member_name: 'Peter Otieno',
          amount: 10000,
          contribution_type: 'regular',
          due_date: '2024-01-31',
          paid_date: '',
          status: 'overdue',
          payment_method: ''
        }
      ]);

      setLoading(false);
    };

    fetchGroupData();
  }, [groupId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'up_to_date': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chairman': return 'bg-purple-100 text-purple-800';
      case 'treasurer': return 'bg-blue-100 text-blue-800';
      case 'secretary': return 'bg-indigo-100 text-indigo-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const memberColumns = [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => (
        <Badge className={getRoleColor(row.original.role)}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'total_contributed',
      header: 'Contributed',
      cell: ({ row }: any) => formatCurrency(row.original.total_contributed),
    },
    {
      accessorKey: 'equity_percentage',
      header: 'Equity %',
      cell: ({ row }: any) => `${row.original.equity_percentage}%`,
    },
    {
      accessorKey: 'contribution_status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.contribution_status)}>
          {row.original.contribution_status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  const investmentColumns = [
    {
      accessorKey: 'investment_name',
      header: 'Investment',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.investment_name}</div>
          <div className="text-sm text-gray-500">
            {row.original.allocation_percentage}% of portfolio
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'expected_return',
      header: 'Expected Return',
      cell: ({ row }: any) => `${row.original.expected_return}%`,
    },
    {
      accessorKey: 'actual_return',
      header: 'Actual Return',
      cell: ({ row }: any) => (
        <div className={`flex items-center ${
          row.original.actual_return >= row.original.expected_return 
            ? 'text-green-600' 
            : 'text-red-600'
        }`}>
          {row.original.actual_return >= row.original.expected_return ? (
            <ArrowUpRight size={16} className="mr-1" />
          ) : (
            <ArrowDownRight size={16} className="mr-1" />
          )}
          {row.original.actual_return}%
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
  ];

  const contributionColumns = [
    {
      accessorKey: 'member_name',
      header: 'Member',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'contribution_type',
      header: 'Type',
      cell: ({ row }: any) => row.original.contribution_type.replace('_', ' '),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }: any) => new Date(row.original.due_date).toLocaleDateString(),
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
  ];

  if (loading || !groupDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{groupDetails.name}</h1>
          <p className="text-gray-600 mt-1">{groupDetails.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge className={getStatusColor(groupDetails.status)}>
              {groupDetails.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Created: {new Date(groupDetails.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
          <Button>
            <UserPlus size={16} className="mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupDetails.member_count}/{groupDetails.max_members}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((groupDetails.member_count / groupDetails.max_members) * 100)}% capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(groupDetails.group_balance)}</div>
            <p className="text-xs text-muted-foreground">
              Available funds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{groupDetails.returns_ytd}%</div>
            <p className="text-xs text-muted-foreground">
              Year to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(groupDetails.total_investments)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((groupDetails.total_investments / groupDetails.total_contributions) * 100)}% of contributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({groupDetails.member_count})</TabsTrigger>
          <TabsTrigger value="investments">Investments ({investments.length})</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{groupDetails.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contribution Frequency:</span>
                  <span className="font-medium">{groupDetails.contribution_frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Contribution:</span>
                  <span className="font-medium">{formatCurrency(groupDetails.minimum_contribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Strategy:</span>
                  <span className="font-medium">{groupDetails.investment_strategy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Contributions:</span>
                  <span className="font-medium">{formatCurrency(groupDetails.total_contributions)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">New investment approved: Equity Fund A</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Monthly contributions collected</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Member added: Sarah Njeri</p>
                      <p className="text-xs text-gray-500">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Group Members</h3>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Member
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={memberColumns}
                data={members}
                searchKey="name"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Group Investments</h3>
            <Button>
              <Plus size={16} className="mr-2" />
              Propose Investment
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={investmentColumns}
                data={investments}
                searchKey="investment_name"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Contributions</h3>
            <Button>
              <Plus size={16} className="mr-2" />
              Record Contribution
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={contributionColumns}
                data={contributions}
                searchKey="member_name"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupManagementDetail;
