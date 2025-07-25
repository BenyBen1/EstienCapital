import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendEmail } from '../utils/email';

const router = Router();

// Get user wallet balance (doesn't require KYC)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure the authenticated user can only access their own wallet
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get or create wallet for user
    let { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', 'KES')
      .single();

    if (walletError && walletError.code === 'PGRST116') {
      // Wallet doesn't exist, create one
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from('wallets')
        .insert([{
          user_id: userId,
          balance: 0,
          currency: 'KES',
        }])
        .select()
        .single();

      if (createError) throw createError;
      wallet = newWallet;
    } else if (walletError) {
      throw walletError;
    }

    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Initiate deposit (doesn't require KYC)
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;

    // Ensure the authenticated user can only make deposits for themselves
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount or user ID' });
    }

    // Create deposit transaction using actual schema columns
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'pending',
          currency: 'KES',
          payment_method: paymentMethod || 'bank_transfer',
          reference_number: `DEP_${Date.now()}`,
          description: `Deposit of KES ${amount} via ${paymentMethod || 'bank transfer'}`,
        },
      ])
      .select('*')
      .single();

    if (transactionError) throw transactionError;

    // Get user profile separately
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    // Send notification email to firm
    const notificationEmail = process.env.ESTIEN_NOTIFICATION_EMAIL || 'admin@estiencapital.com';
    
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
          <li><strong>Reference:</strong> ${transaction.reference_number}</li>
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
            <li><strong>Reference:</strong> ${transaction.reference_number}</li>
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

export default router;
