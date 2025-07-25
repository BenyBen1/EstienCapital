import { Router } from 'express';
import { supabase } from '../index';
import { sendEmail } from '../utils/email';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Get transaction history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const { data, error, count } = await query
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    res.json({
      transactions: data,
      total: count,
      page: Number(page),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Initiate deposit
router.post('/deposit', async (req, res) => {

  try {
    // Use authenticated user from requireAuth middleware
    const userId = req.user?.id;
    const { amount, paymentMethod, depositReference } = req.body;

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount or user ID' });
    }

    // Create deposit transaction with correct user_id
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId, // Ensure user_id is set from auth
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'pending',
          payment_method: paymentMethod || 'bank_transfer',
          reference: depositReference || `DEP_${Date.now()}`,
          description: `Deposit of KES ${amount} via ${paymentMethod || 'bank transfer'}`,
          currency: 'KES',
        },
      ])
      .select('*, profiles(full_name, email, phone)')
      .single();

    if (transactionError) throw transactionError;

    // Send notification email to firm
    const notificationEmail = process.env.ESTIEN_NOTIFICATION_EMAIL || 'admin@estiencapital.com';
    const userProfile = transaction.profiles;
    
    // Email to firm
    await sendEmail({
      to: notificationEmail,
      subject: `New Deposit Confirmation - ${userProfile?.full_name || 'Client'}`,
      text: `Client ${userProfile?.full_name || 'Unknown'} (${userProfile?.email}) has confirmed a deposit of KES ${amount}. Transaction ID: ${transaction.id}. Please verify and process.`,
      html: `
        <h2>Client Deposit Confirmation</h2>
        <p>A client has confirmed they have made a deposit. Please verify and process:</p>
        
        <h3>Client Details:</h3>
        <ul>
          <li><strong>Client ID:</strong> ${userId}</li>
          <li><strong>Full Name:</strong> ${userProfile?.full_name || 'Not provided'}</li>
          <li><strong>Email:</strong> ${userProfile?.email || 'Not provided'}</li>
          <li><strong>Phone:</strong> ${userProfile?.phone || 'Not provided'}</li>
        </ul>
        
        <h3>Deposit Details:</h3>
        <ul>
          <li><strong>Amount:</strong> KES ${amount.toLocaleString()}</li>
          <li><strong>Currency:</strong> KES</li>
          <li><strong>Payment Method:</strong> ${paymentMethod || 'Bank Transfer'}</li>
          <li><strong>Reference:</strong> ${transaction.reference}</li>
          <li><strong>Date/Time:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>Transaction ID:</strong> ${transaction.id}</li>
        </ul>
        
        <p><strong>Next Steps:</strong> Please verify the deposit in your bank account and update the transaction status in the admin panel.</p>
      `,
    });

    // Send confirmation email to client
    if (userProfile?.email) {
      await sendEmail({
        to: userProfile.email,
        subject: 'Deposit Confirmation Received - Estien Capital',
        text: `Your deposit confirmation of KES ${amount} has been received and is being processed. You will be notified once verified and credited.`,
        html: `
          <h2>Deposit Confirmation Received</h2>
          <p>Dear ${userProfile?.full_name || 'Valued Client'},</p>
          
          <p>We have received your confirmation that you have made a deposit of <strong>KES ${amount.toLocaleString()}</strong>.</p>
          
          <h3>Deposit Details:</h3>
          <ul>
            <li><strong>Amount:</strong> KES ${amount.toLocaleString()}</li>
            <li><strong>Reference:</strong> ${transaction.reference}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <p>Your deposit is currently being processed and will be credited to your account within 24 hours after verification.</p>
          
          <p>You can track the status of your deposit in the Transactions section of your mobile app.</p>
          
          <p>Thank you for choosing Estien Capital.</p>
          
          <p>Best regards,<br>The Estien Capital Team</p>
        `,
      });
    }

    res.status(201).json({
      transaction,
      message: 'Deposit confirmation received successfully. You will be notified once the funds are verified and credited to your account.'
    });
  } catch (error: any) {
    console.error('Deposit error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Initiate withdrawal
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, paymentMethod, accountDetails } = req.body;

    // Check available balance
    const { data: balance } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (!balance || balance.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'withdrawal',
          amount,
          status: 'pending',
          payment_method: paymentMethod,
          account_details: accountDetails,
        },
      ])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Get user's email
    const { data: user } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (user) {
      // Send withdrawal confirmation
      await sendEmail({
        to: user.email,
        subject: 'Withdrawal Request Received',
        text: `Your withdrawal request of ${amount} has been received and is being processed.`,
      });
    }

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update transaction status (admin only)
router.put('/update-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, rejectionReason } = req.body;

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .update({
        status,
        rejection_reason: rejectionReason,
        processed_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select('user_id, type, amount')
      .single();

    if (transactionError) throw transactionError;

    // Update wallet balance for successful transactions
    if (status === 'completed') {
      // Calculate the amount to add/subtract based on transaction type
      const balanceChange = transaction.type === 'deposit' ? transaction.amount : -transaction.amount;
      
      const { error: walletError } = await supabase.rpc('update_wallet_balance', {
        p_user_id: transaction.user_id,
        p_amount: balanceChange,
        p_currency: 'KES'
      });

      if (walletError) {
        console.error('Wallet update error:', walletError);
        throw walletError;
      }
    }

    // Notify user
    const { data: user } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', transaction.user_id)
      .single();

    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Transaction Status Update',
        text: `Your ${transaction.type} of ${transaction.amount} has been ${status}. ${
          status === 'rejected' ? `Reason: ${rejectionReason}` : ''
        }`,
      });
    }

    res.json({ message: 'Transaction status updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Get all deposit and withdrawal requests
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*, profiles(full_name, email, phone)', { count: 'exact' })
      .in('type', ['deposit', 'withdrawal'])
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const { data, error, count } = await query
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    res.json({
      data,
      total: count,
      page: pageNum,
      totalPages: Math.ceil((count ?? 0) / limitNum),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Approve transaction
router.post('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, email)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // If it's a deposit, update wallet balance
    if (transaction.type === 'deposit') {
      // Get current balance first
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', transaction.user_id)
        .single();

      if (walletFetchError) throw walletFetchError;

      const newBalance = (wallet?.balance || 0) + transaction.amount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', transaction.user_id);

      if (walletError) throw walletError;
    }

    // Send confirmation email to client
    if (transaction.profiles?.email) {
      await sendEmail({
        to: transaction.profiles.email,
        subject: `${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Approved - Estien Capital`,
        text: `Your ${transaction.type} of KES ${transaction.amount} has been approved and processed.`,
        html: `
          <h2>${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Approved</h2>
          <p>Dear ${transaction.profiles?.full_name || 'Valued Client'},</p>
          
          <p>Your ${transaction.type} request has been approved and processed.</p>
          
          <h3>Transaction Details:</h3>
          <ul>
            <li><strong>Amount:</strong> KES ${transaction.amount.toLocaleString()}</li>
            <li><strong>Reference:</strong> ${transaction.reference}</li>
            <li><strong>Status:</strong> Completed</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          ${transaction.type === 'deposit' ? 
            '<p>The funds have been credited to your account and are now available for investment.</p>' :
            '<p>The withdrawal has been processed and funds will be transferred to your specified account within 24 hours.</p>'
          }
          
          <p>Thank you for choosing Estien Capital.</p>
          
          <p>Best regards,<br>The Estien Capital Team</p>
        `,
      });
    }

    res.json({ 
      success: true, 
      message: `${transaction.type} approved successfully`,
      transaction: { ...transaction, status: 'completed' }
    });
  } catch (error: any) {
    console.error('Approve transaction error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Admin: Reject transaction
router.post('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Get transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, email)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'rejected',
        notes: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Send rejection email to client
    if (transaction.profiles?.email) {
      await sendEmail({
        to: transaction.profiles.email,
        subject: `${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Update - Estien Capital`,
        text: `Your ${transaction.type} of KES ${transaction.amount} could not be processed. Reason: ${reason}`,
        html: `
          <h2>${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Update</h2>
          <p>Dear ${transaction.profiles?.full_name || 'Valued Client'},</p>
          
          <p>We regret to inform you that your ${transaction.type} request could not be processed at this time.</p>
          
          <h3>Transaction Details:</h3>
          <ul>
            <li><strong>Amount:</strong> KES ${transaction.amount.toLocaleString()}</li>
            <li><strong>Reference:</strong> ${transaction.reference}</li>
            <li><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString()}</li>
          </ul>
          
          <h3>Reason:</h3>
          <p>${reason}</p>
          
          <p>Please contact our support team if you have any questions or would like to resubmit your request.</p>
          
          <p>Best regards,<br>The Estien Capital Team</p>
        `,
      });
    }

    res.json({ 
      success: true, 
      message: `${transaction.type} rejected successfully`,
      transaction: { ...transaction, status: 'rejected', notes: reason }
    });
  } catch (error: any) {
    console.error('Reject transaction error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;