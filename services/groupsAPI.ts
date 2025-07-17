import { supabase } from './supabase';

// Types for group system
export interface GroupSummaryStats {
  total_groups: number;
  active_groups: number;
  pending_approval: number;
  total_members: number;
  total_balance: number;
}

export interface GroupTypeStats {
  group_type: string;
  group_count: number;
  member_count: number;
  total_balance: number;
}

export interface GroupDetails {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  minimum_members: number;
  maximum_members: number;
  requires_approval: boolean;
  contribution_frequency: string;
  minimum_contribution: number;
  group_balance: number;
  investment_strategy?: string;
  maturity_date?: string;
  auto_invest: boolean;
  withdrawal_notice_period: number;
  fees_structure?: any;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  account_number: string;
  phone_number: string;
  role: string;
  member_role: string;
  is_account_manager: boolean;
  status: string;
  contribution_amount: number;
  total_contributed: number;
  equity_percentage: number;
  last_contribution_date?: string;
  contribution_status: string;
  exit_date?: string;
  exit_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined user profile data
  user?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface GroupContribution {
  id: string;
  group_id: string;
  member_id: string;
  amount: number;
  contribution_type: string;
  due_date?: string;
  paid_date?: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined member data
  member?: {
    user?: {
      full_name: string;
    };
  };
}

export interface GroupInvestment {
  id: string;
  group_id: string;
  investment_id: string;
  allocated_amount: number;
  allocation_percentage?: number;
  decision_date: string;
  approved_by?: string;
  votes_for: number;
  votes_against: number;
  status: string;
  expected_return?: number;
  actual_return?: number;
  maturity_date?: string;
  created_at: string;
  updated_at: string;
  // Joined investment data
  investment?: {
    name: string;
    type: string;
    current_value: number;
  };
}

export interface GroupMeeting {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  meeting_date: string;
  meeting_type: string;
  agenda?: any;
  attendees?: string[];
  decisions?: any;
  minutes?: string;
  next_meeting_date?: string;
  created_by?: string;
  created_at: string;
}

// Group API functions
export class GroupsAPI {
  
  // Get summary statistics for all groups
  static async getSummaryStats(): Promise<GroupSummaryStats> {
    const { data, error } = await supabase
      .rpc('get_group_summary_stats');
    
    if (error) throw error;
    return data[0];
  }

  // Get group statistics by type
  static async getGroupStatsByType(): Promise<GroupTypeStats[]> {
    const { data, error } = await supabase
      .rpc('get_group_stats_by_type');
    
    if (error) throw error;
    return data;
  }

  // Get all groups with filters
  static async getGroups(filters?: {
    type?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<GroupDetails[]> {
    let query = supabase
      .from('account_groups')
      .select('*');

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  // Get group details by ID
  static async getGroupById(id: string): Promise<GroupDetails | null> {
    const { data, error } = await supabase
      .from('account_groups')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get group members
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        user:profiles!group_members_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Get group contributions
  static async getGroupContributions(groupId: string, limit?: number): Promise<GroupContribution[]> {
    let query = supabase
      .from('group_contributions')
      .select(`
        *,
        member:group_members!group_contributions_member_id_fkey (
          user:profiles!group_members_user_id_fkey (
            full_name
          )
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  // Get group investments
  static async getGroupInvestments(groupId: string): Promise<GroupInvestment[]> {
    const { data, error } = await supabase
      .from('group_investments')
      .select(`
        *,
        investment:investments!group_investments_investment_id_fkey (
          name,
          type,
          current_value
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Get group meetings
  static async getGroupMeetings(groupId: string, limit?: number): Promise<GroupMeeting[]> {
    let query = supabase
      .from('group_meetings')
      .select('*')
      .eq('group_id', groupId)
      .order('meeting_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  // Create new group
  static async createGroup(groupData: Partial<GroupDetails>): Promise<GroupDetails> {
    const { data, error } = await supabase
      .from('account_groups')
      .insert([groupData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update group
  static async updateGroup(id: string, updates: Partial<GroupDetails>): Promise<GroupDetails> {
    const { data, error } = await supabase
      .from('account_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Delete group
  static async deleteGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('account_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Add member to group
  static async addMember(memberData: Partial<GroupMember>): Promise<GroupMember> {
    const { data, error } = await supabase
      .from('group_members')
      .insert([memberData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update member
  static async updateMember(id: string, updates: Partial<GroupMember>): Promise<GroupMember> {
    const { data, error } = await supabase
      .from('group_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Remove member from group
  static async removeMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Record contribution
  static async recordContribution(contributionData: Partial<GroupContribution>): Promise<GroupContribution> {
    const { data, error } = await supabase
      .from('group_contributions')
      .insert([contributionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update contribution
  static async updateContribution(id: string, updates: Partial<GroupContribution>): Promise<GroupContribution> {
    const { data, error } = await supabase
      .from('group_contributions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Create investment proposal
  static async createInvestmentProposal(investmentData: Partial<GroupInvestment>): Promise<GroupInvestment> {
    const { data, error } = await supabase
      .from('group_investments')
      .insert([investmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update investment
  static async updateInvestment(id: string, updates: Partial<GroupInvestment>): Promise<GroupInvestment> {
    const { data, error } = await supabase
      .from('group_investments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Schedule meeting
  static async scheduleMeeting(meetingData: Partial<GroupMeeting>): Promise<GroupMeeting> {
    const { data, error } = await supabase
      .from('group_meetings')
      .insert([meetingData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update member equity percentages
  static async updateMemberEquity(groupId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('safe_update_member_equity', { group_uuid: groupId });
    
    if (error) throw error;
    return data;
  }

  // Calculate group total contributions
  static async calculateGroupTotalContributions(groupId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_group_total_contributions', { group_uuid: groupId });
    
    if (error) throw error;
    return data;
  }

  // Calculate member total contributions
  static async calculateMemberTotalContributions(memberId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_member_total_contributions', { member_uuid: memberId });
    
    if (error) throw error;
    return data;
  }

  // Get group activity summary (admin only)
  static async getGroupActivitySummary(daysBack: number = 30): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('get_group_activity_summary', { days_back: daysBack });
    
    if (error) throw error;
    return data;
  }

  // Get groups by status with member counts
  static async getGroupsWithMemberCounts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('account_groups')
      .select(`
        *,
        member_count:group_members(count)
      `);
    
    if (error) throw error;
    return data;
  }

  // Get overdue contributions
  static async getOverdueContributions(groupId?: string): Promise<GroupContribution[]> {
    let query = supabase
      .from('group_contributions')
      .select(`
        *,
        member:group_members!group_contributions_member_id_fkey (
          user:profiles!group_members_user_id_fkey (
            full_name
          )
        ),
        group:account_groups!group_contributions_group_id_fkey (
          name
        )
      `)
      .eq('status', 'overdue');

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  // Get pending investment approvals
  static async getPendingInvestmentApprovals(groupId?: string): Promise<GroupInvestment[]> {
    let query = supabase
      .from('group_investments')
      .select(`
        *,
        investment:investments!group_investments_investment_id_fkey (
          name,
          type
        ),
        group:account_groups!group_investments_group_id_fkey (
          name
        )
      `)
      .eq('status', 'pending');

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }
}

// Utility functions for group management
export const GroupUtils = {
  // Format currency for display
  formatCurrency: (amount: number, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Get group type icon
  getGroupTypeIcon: (type: string) => {
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
  },

  // Get status color classes
  getStatusColor: (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'up_to_date': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Get role color classes
  getRoleColor: (role: string) => {
    switch (role) {
      case 'chairman': return 'bg-purple-100 text-purple-800';
      case 'treasurer': return 'bg-blue-100 text-blue-800';
      case 'secretary': return 'bg-indigo-100 text-indigo-800';
      case 'investment_manager': return 'bg-emerald-100 text-emerald-800';
      case 'account_manager': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Calculate days until due
  getDaysUntilDue: (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Validate contribution amount
  validateContributionAmount: (amount: number, groupMinimum: number) => {
    if (amount <= 0) return 'Amount must be greater than zero';
    if (amount < groupMinimum) return `Amount must be at least ${GroupUtils.formatCurrency(groupMinimum)}`;
    return null;
  },

  // Generate account number for new member
  generateAccountNumber: (groupType: string, memberCount: number) => {
    const prefix = {
      'sacco': 'SAC',
      'investment_club': 'INV',
      'family_account': 'FAM',
      'joint_account': 'JNT',
      'corporate': 'CRP',
      'chama': 'CHM',
      'cooperative': 'COP'
    }[groupType] || 'GRP';
    
    return `${prefix}${String(memberCount + 1).padStart(4, '0')}`;
  }
};
