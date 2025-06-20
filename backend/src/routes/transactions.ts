import { Router } from 'express';
import { supabase } from '../index';
import { sendEmail } from '../utils/email';

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
    const { userId, amount, paymentMethod } = req.body;

    // Create deposit transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'deposit',
          amount,
          status: 'pending',
          payment_method: paymentMethod,
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
      // Send deposit instructions
      await sendEmail({
        to: user.email,
        subject: 'Deposit Instructions',
        text: `Your deposit of ${amount} has been initiated. Please follow the instructions to complete your deposit.`,
      });
    }

    res.status(201).json(transaction);
  } catch (error: any) {
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
      const { error: walletError } = await supabase.rpc('update_wallet_balance', {
        p_user_id: transaction.user_id,
        p_amount: transaction.type === 'deposit' ? transaction.amount : -transaction.amount,
      });

      if (walletError) throw walletError;
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

export default router; 