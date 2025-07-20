import { supabase } from './supabase';

// SIMPLIFIED GROUP API - 3 DAY IMPLEMENTATION
// Focus on core functionality only

export interface SimpleAccount {
  account_id: string;
  account_number: string;
  account_name: string;
  account_type: 'individual' | 'sacco' | 'investment_club' | 'family_account' | 'joint_account' | 'corporate';
  user_id: string;
  group_id?: string;
  role?: string;
  balance: number;
  status: string;
}

export interface SimpleGroup {
  id: string;
  name: string;
  type: string;
  status: string;
  member_count: number;
  simple_balance: number;
  created_at: string;
  created_by: string;
}

export interface SimpleGroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  status: string;
  account_number: string;
  phone_number: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

// API CLASS - SIMPLE IMPLEMENTATION
export class SimpleGroupsAPI {

  // Get all accounts accessible to current user (individual + groups)
  static async getUserAccounts(): Promise<SimpleAccount[]> {
    const { data, error } = await supabase
      .from('user_accessible_accounts')
      .select('*')
      .order('account_type', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Get all groups (admin only)
  static async getAllGroups(): Promise<SimpleGroup[]> {
    const { data, error } = await supabase
      .from('account_groups')
      .select('id, name, type, status, member_count, simple_balance, created_at, created_by')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Get group by ID
  static async getGroupById(groupId: string): Promise<SimpleGroup | null> {
    const { data, error } = await supabase
      .from('account_groups')
      .select('id, name, type, status, member_count, simple_balance, created_at, created_by')
      .eq('id', groupId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get group members
  static async getGroupMembers(groupId: string): Promise<SimpleGroupMember[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        group_id,
        role,
        status,
        account_number,
        phone_number,
        created_at,
        profiles!group_members_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Flatten the profile data
    return (data || []).map(member => ({
      ...member,
      user_name: (member.profiles as any)?.full_name || 'Unknown',
      user_email: (member.profiles as any)?.email || '',
      profiles: undefined // Remove the nested object
    }));
  }

  // Create new group (simplified)
  static async createGroup(groupData: {
    name: string;
    type: string;
    description?: string;
  }): Promise<SimpleGroup> {
    const { data, error } = await supabase
      .from('account_groups')
      .insert([{
        name: groupData.name,
        type: groupData.type,
        status: 'active',
        member_count: 0,
        simple_balance: 0
      }])
      .select('id, name, type, status, member_count, simple_balance, created_at, created_by')
      .single();
    
    if (error) throw error;
    return data;
  }

  // Add member to group
  static async addMember(groupId: string, memberData: {
    user_id: string;
    role?: string;
    account_number?: string;
    phone_number?: string;
  }): Promise<SimpleGroupMember> {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: memberData.user_id,
        role: memberData.role || 'member',
        status: 'active',
        account_number: memberData.account_number || '',
        phone_number: memberData.phone_number || ''
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }

  // Remove member from group
  static async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId);
    
    if (error) throw error;
  }

  // Update group
  static async updateGroup(groupId: string, updates: Partial<SimpleGroup>): Promise<SimpleGroup> {
    const { data, error } = await supabase
      .from('account_groups')
      .update(updates)
      .eq('id', groupId)
      .select('id, name, type, status, member_count, simple_balance, created_at, created_by')
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get user's groups only
  static async getUserGroups(): Promise<SimpleAccount[]> {
    const accounts = await this.getUserAccounts();
    return accounts.filter(account => account.account_type !== 'individual');
  }

  // Get summary stats for admin dashboard
  static async getGroupSummaryStats(): Promise<{
    total_groups: number;
    active_groups: number;
    total_members: number;
    total_balance: number;
  }> {
    const { data, error } = await supabase
      .from('account_groups')
      .select('status, member_count, simple_balance');
    
    if (error) throw error;
    
    const stats = {
      total_groups: data.length,
      active_groups: data.filter(g => g.status === 'active').length,
      total_members: data.reduce((sum, g) => sum + (g.member_count || 0), 0),
      total_balance: data.reduce((sum, g) => sum + (g.simple_balance || 0), 0)
    };
    
    return stats;
  }

  // Record a group transaction (simplified)
  static async recordGroupTransaction(groupId: string, transactionData: {
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    user_id: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: transactionData.user_id,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        group_context_id: groupId,
        transaction_context: 'group',
        status: 'completed'
      }])
      .select('*')
      .single();
    
    if (error) throw error;

    // Update group balance
    await this.updateGroupBalance(groupId);
    
    return data;
  }

  // Update group balance from transactions
  static async updateGroupBalance(groupId: string): Promise<void> {
    const { error } = await supabase
      .rpc('update_group_simple_balance', { group_uuid: groupId });
    
    if (error) throw error;
  }

  // Search users for adding to groups
  static async searchUsers(query: string): Promise<Array<{
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  }>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    
    if (error) throw error;
    return data || [];
  }
}

// Utility functions for formatting
export const SimpleGroupUtils = {
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  getGroupTypeIcon: (type: string) => {
    switch (type) {
      case 'sacco': return '🏦';
      case 'investment_club': return '💰';
      case 'family_account': return '👨‍👩‍👧‍👦';
      case 'joint_account': return '🤝';
      case 'corporate': return '🏢';
      default: return '📊';
    }
  },

  getStatusColor: (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  getRoleColor: (role: string) => {
    switch (role) {
      case 'chairman': return 'text-purple-600 bg-purple-100';
      case 'treasurer': return 'text-blue-600 bg-blue-100';
      case 'admin': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
};
