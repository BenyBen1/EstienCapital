import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Get dashboard metrics for admin
router.get('/dashboard/metrics', async (req, res) => {
  try {
    console.log('Fetching dashboard metrics for admin...');
    
    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (those who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

    // Get account type breakdown
    const { count: individualAccounts } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', 'individual');

    const { count: jointAccounts } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', 'joint');

    // Get KYC status
    const { count: pendingKyc } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('kyc_status', 'pending');

    // Get transaction metrics
    const { count: totalTransactions } = await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    const { count: pendingTransactions } = await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total assets (sum of all portfolio values)
    const { data: portfolioData } = await supabaseAdmin
      .from('portfolios')
      .select('total_value');

    const totalAssets = portfolioData?.reduce((sum: number, portfolio: any) => sum + (portfolio.total_value || 0), 0) || 0;

    // Get monthly transaction volume
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const { data: monthlyTransactions } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .gte('created_at', thisMonth.toISOString());

    const monthlyTransactionVolume = monthlyTransactions?.reduce((sum: number, transaction: any) => sum + (transaction.amount || 0), 0) || 0;

    // Get product metrics
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: activeProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get memos metrics
    const { count: publishedMemos } = await supabaseAdmin
      .from('memos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const metrics = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      individualAccounts: individualAccounts || 0,
      jointAccounts: jointAccounts || 0,
      pendingKyc: pendingKyc || 0,
      totalAssets: totalAssets,
      monthlyTransactionVolume: monthlyTransactionVolume,
      totalTransactions: totalTransactions || 0,
      pendingTransactions: pendingTransactions || 0,
      totalProducts: totalProducts || 0,
      activeProducts: activeProducts || 0,
      publishedMemos: publishedMemos || 0,
    };

    console.log('Dashboard metrics:', metrics);
    res.json(metrics);
  } catch (error: any) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users for admin (with pagination and filters)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, accountType } = req.query;
    
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('kyc_status', status);
    }
    if (accountType && accountType !== 'all') {
      query = query.eq('account_type', accountType);
    }
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Apply pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Transform data to match admin interface expectations
    const transformedUsers = users?.map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone_number,
      accountType: user.account_type,
      status: user.kyc_status === 'approved' ? 'active' : 'inactive',
      kycStatus: user.kyc_status,
      createdAt: user.created_at,
      lastLogin: user.last_sign_in_at,
      totalInvested: 0, // TODO: Calculate from transactions/portfolio
      portfolioValue: 0, // TODO: Calculate from portfolio
    })) || [];

    res.json({
      data: transformedUsers,
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific user details
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform to match admin interface
    const transformedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone_number,
      accountType: user.account_type,
      status: user.kyc_status === 'approved' ? 'active' : 'inactive',
      kycStatus: user.kyc_status,
      createdAt: user.created_at,
      lastLogin: user.last_sign_in_at,
      totalInvested: 0, // TODO: Calculate from transactions/portfolio
      portfolioValue: 0, // TODO: Calculate from portfolio
    };

    res.json(transformedUser);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user status
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Map admin interface fields to database fields
    const dbUpdates: any = {};
    if (updates.firstName) dbUpdates.first_name = updates.firstName;
    if (updates.lastName) dbUpdates.last_name = updates.lastName;
    if (updates.phone) dbUpdates.phone_number = updates.phone;
    if (updates.accountType) dbUpdates.account_type = updates.accountType;
    if (updates.kycStatus) dbUpdates.kyc_status = updates.kycStatus;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve KYC
router.post('/users/:userId/kyc/approve', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ kyc_status: 'approved' })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'KYC approved successfully' });
  } catch (error: any) {
    console.error('Error approving KYC:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject KYC
router.post('/users/:userId/kyc/reject', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        kyc_status: 'rejected',
        kyc_rejection_reason: reason 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'KYC rejected successfully' });
  } catch (error: any) {
    console.error('Error rejecting KYC:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
