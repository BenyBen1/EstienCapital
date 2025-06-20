import { Router } from 'express';
import { supabase } from '../index';
import { sendEmail } from '../utils/email';
import { checkAuth } from '../middleware/supabaseJwt';

const router = Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  console.log('GET /profile/:userId - params:', req.params);
  try {
    const { userId } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    console.log('GET /profile/:userId - success');
    res.json(profile);
  } catch (error: any) {
    console.error('GET /profile/:userId - error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  console.log('PUT /profile/:userId - params:', req.params, 'body:', req.body);
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      city,
      country,
      postalCode,
      profilePicture,
    } = req.body;

    // Upload profile picture if provided
    let profilePicturePath;
    if (profilePicture) {
      profilePicturePath = `profiles/${userId}/profile_picture.${profilePicture.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(profilePicturePath, profilePicture);

      if (uploadError) throw uploadError;
    }

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        gender,
        address,
        city,
        country,
        postal_code: postalCode,
        profile_picture: profilePicturePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('PUT /profile/:userId - success');
    res.json(profile);
  } catch (error: any) {
    console.error('PUT /profile/:userId - error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update notification preferences
router.put('/:userId/notifications', async (req, res) => {
  console.log('PUT /profile/:userId/notifications - params:', req.params, 'body:', req.body);
  try {
    const { userId } = req.params;
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      transactionAlerts,
      securityAlerts,
      marketingEmails,
    } = req.body;

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .update({
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        push_notifications: pushNotifications,
        transaction_alerts: transactionAlerts,
        security_alerts: securityAlerts,
        marketing_emails: marketingEmails,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('PUT /profile/:userId/notifications - success');
    res.json(preferences);
  } catch (error: any) {
    console.error('PUT /profile/:userId/notifications - error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update security settings
router.put('/:userId/security', async (req, res) => {
  console.log('PUT /profile/:userId/security - params:', req.params, 'body:', req.body);
  try {
    const { userId } = req.params;
    const {
      twoFactorEnabled,
      loginNotifications,
      withdrawalConfirmation,
      sessionTimeout,
    } = req.body;

    const { data: security, error } = await supabase
      .from('security_settings')
      .update({
        two_factor_enabled: twoFactorEnabled,
        login_notifications: loginNotifications,
        withdrawal_confirmation: withdrawalConfirmation,
        session_timeout: sessionTimeout,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('PUT /profile/:userId/security - success');
    res.json(security);
  } catch (error: any) {
    console.error('PUT /profile/:userId/security - error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.post('/:userId/change-password', async (req, res) => {
  console.log('POST /profile/:userId/change-password - params:', req.params, 'body:', req.body);
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const { data: user, error: authError } = await supabase.auth.signInWithPassword({
      email: req.body.email,
      password: currentPassword,
    });

    if (authError) throw new Error('Current password is incorrect');

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    // Send confirmation email
    await sendEmail({
      to: user.user.email || '',
      subject: 'Password Changed',
      text: 'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
    });

    console.log('POST /profile/:userId/change-password - success');
    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('POST /profile/:userId/change-password - error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get activity log
router.get('/:userId/activity', async (req, res) => {
  console.log('GET /profile/:userId/activity - params:', req.params, 'query:', req.query);
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const { data, error, count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    console.log('GET /profile/:userId/activity - success');
    res.json({
      activities: data,
      total: count,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error: any) {
    console.error('GET /profile/:userId/activity - error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Example protected profile route
router.get('/', checkAuth, async (req, res) => {
  console.log('GET /profile/ (protected) - user:', req.user);
  try {
    // req.user is available here
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const userId = req.user.id;
    // Fetch user profile logic here...
    console.log('GET /profile/ (protected) - success');
    res.json({ message: `Profile for user ${userId}` });
  } catch (error) {
    console.error('GET /profile/ (protected) - error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router; 