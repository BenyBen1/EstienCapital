import { Router } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { generateOTP } from '../utils/otp';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  console.log('POST /register - body:', req.body);
  try {
    const { email, password, firstName, lastName, accountType } = req.body;

    // Add registration_time to user_metadata
    const registrationTime = new Date().toISOString();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          accountType,
          registration_time: registrationTime
        }
      }
    });
    console.log('Supabase Auth signUp:', { authData, authError });

    if (authError) {
      return res.status(400).json({ error: authError.message, details: authError });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'User creation failed' });
    }

    // Create profile in profiles table immediately after registration
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        kyc_status: 'pending',
      });
    if (profileError) {
      console.error('Profile creation failed:', profileError);
      // Optionally: delete the auth user if profile creation fails
      return res.status(500).json({ error: 'Profile creation failed', details: profileError });
    }

    // Create wallet for user
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: authData.user.id,
        balance: 0,
        currency: 'KES',
      });
    if (walletError) {
      console.error('Wallet creation failed:', walletError);
    }

    // Create default notification preferences
    const { error: notificationError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: authData.user.id,
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
      });
    if (notificationError) {
      console.error('Notification preferences creation failed:', notificationError);
    }

    // Create default security settings
    const { error: securityError } = await supabase
      .from('security_settings')
      .insert({
        user_id: authData.user.id,
        two_factor_enabled: false,
        last_password_change: new Date().toISOString(),
      });
    if (securityError) {
      console.error('Security settings creation failed:', securityError);
    }

    // Always return success with email confirmation message
    console.log('POST /register - success:', authData);
    return res.status(200).json({
      message: 'Registration initiated. Please check your email to confirm your account.',
      requiresEmailConfirmation: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    });

  } catch (error) {
    console.error('POST /register - error:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// Complete registration after email confirmation
router.post('/complete-registration', async (req, res) => {
  console.log('POST /complete-registration - headers:', req.headers);
  try {
    // Get the current user from their session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('COMPLETE-REGISTRATION: user:', user, 'authError:', authError);
    
    if (authError || !user) {
      console.error('COMPLETE-REGISTRATION: Not authenticated', { authError, user });
      return res.status(401).json({ error: 'Authentication required', details: authError });
    }

    // Check registration_time in user_metadata
    const registrationTime = user.user_metadata?.registration_time;
    console.log('COMPLETE-REGISTRATION: registrationTime:', registrationTime);
    if (!registrationTime) {
      console.error('COMPLETE-REGISTRATION: Registration time not found');
      return res.status(400).json({ error: 'Registration time not found.' });
    }
    const now = new Date();
    const regTime = new Date(registrationTime);
    const diffMs = now.getTime() - regTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    console.log('COMPLETE-REGISTRATION: diffMinutes:', diffMinutes);
    if (diffMinutes > 3) {
      console.error('COMPLETE-REGISTRATION: Registration window expired');
      return res.status(400).json({ error: 'Registration window expired. Please register again.' });
    }

    // Check if profile already exists
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    console.log('COMPLETE-REGISTRATION: existingProfile:', existingProfile, 'existingProfileError:', existingProfileError);

    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    // Get user metadata
    const metadata = user.user_metadata || {};
    const { firstName, lastName, accountType } = metadata;
    console.log('COMPLETE-REGISTRATION: metadata:', metadata);

    // Create profile in profiles table
    const { error: profileError, data: profileData } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        kyc_status: 'pending',
      });
    console.log('COMPLETE-REGISTRATION: profileData:', profileData, 'profileError:', profileError);

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      return res.status(400).json({ error: 'Profile creation failed', details: profileError });
    }

    // Create wallet for user
    const { error: walletError, data: walletData } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        balance: 0,
        currency: 'KES',
      });
    console.log('COMPLETE-REGISTRATION: walletData:', walletData, 'walletError:', walletError);

    if (walletError) {
      console.error('Wallet creation failed:', walletError);
    }

    // Create default notification preferences
    const { error: notificationError, data: notificationData } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: user.id,
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
      });
    console.log('COMPLETE-REGISTRATION: notificationData:', notificationData, 'notificationError:', notificationError);

    if (notificationError) {
      console.error('Notification preferences creation failed:', notificationError);
    }

    // Create default security settings
    const { error: securityError, data: securityData } = await supabase
      .from('security_settings')
      .insert({
        user_id: user.id,
        two_factor_enabled: false,
        last_password_change: new Date().toISOString(),
      });
    console.log('COMPLETE-REGISTRATION: securityData:', securityData, 'securityError:', securityError);

    if (securityError) {
      console.error('Security settings creation failed:', securityError);
    }

    console.log('POST /complete-registration - success');
    res.status(201).json({
      message: 'Registration completed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error('POST /complete-registration - error:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// Login user
router.post('/login', async (req, res) => {
  console.log('POST /login - body:', req.body);
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(401).json({ error: 'Login failed' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Error fetching user profile' });
    }

    console.log('POST /login - success');
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        kycStatus: profile.kyc_status,
      },
      session: data.session,
    });
  } catch (error) {
    console.error('POST /login - error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  console.log('POST /request-password-reset - body:', req.body);
  try {
    const { email } = req.body;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP valid for 15 minutes

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('password_resets')
      .insert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
      });

    if (otpError) {
      return res.status(500).json({ error: 'Error storing OTP' });
    }

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset OTP is: ${otp}. This OTP will expire in 15 minutes.`,
    });

    console.log('POST /request-password-reset - success');
    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('POST /request-password-reset - error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  console.log('POST /reset-password - body:', req.body);
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (resetError || !resetData) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return res.status(400).json({ error: 'Error updating password' });
    }

    // Delete used OTP
    await supabase
      .from('password_resets')
      .delete()
      .eq('email', email)
      .eq('otp', otp);

    console.log('POST /reset-password - success');
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('POST /reset-password - error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup 2FA
router.post('/setup-2fa', requireAuth, async (req, res) => {
  console.log('POST /setup-2fa - headers:', req.headers);
  try {
    const { data: settings, error: settingsError } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (settingsError) {
      return res.status(500).json({ error: 'Error fetching security settings' });
    }

    if (settings.two_factor_enabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    // Update security settings
    const { error: updateError } = await supabase
      .from('security_settings')
      .update({
        two_factor_enabled: true,
      })
      .eq('user_id', req.user!.id);

    if (updateError) {
      return res.status(500).json({ error: 'Error updating security settings' });
    }

    //res.json({
    //  secret: secretData.secret,
    //  uri: secretData.uri,
    //});
    console.log('POST /setup-2fa - success');
  } catch (error) {
    console.error('POST /setup-2fa - error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', requireAuth, async (req, res) => {
  console.log('POST /verify-2fa - headers:', req.headers);
  try {
    const { code } = req.body;

    // Get security settings
    const { data: settings, error: settingsError } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (settingsError || !settings.two_factor_secret) {
      return res.status(500).json({ error: 'Error fetching security settings' });
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('security_settings')
      .update({
        two_factor_enabled: true,
      })
      .eq('user_id', req.user!.id);

    if (updateError) {
      return res.status(500).json({ error: 'Error enabling 2FA' });
    }

    console.log('POST /verify-2fa - success');
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('POST /verify-2fa - error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 