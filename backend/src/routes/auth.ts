import { Router } from 'express';
import { supabase} from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { generateOTP } from '../utils/otp';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  console.log('POST /register - body:', req.body);
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      accountType, 
      groupName,
      groupType,
      groupMembers
    } = req.body;

    // Helper to register a single user
    async function registerUser({ email, password, firstName, lastName, accountType, groupId = null }: any) {
      const registrationTime = new Date().toISOString();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            accountType,
            groupId,
            registration_time: registrationTime
          }
        }
      });
      if (authError) return { error: authError };
      if (!authData.user) return { error: { message: 'User creation failed' } };
      
      // Create profile first
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: firstName,
        last_name: lastName,
        account_type: accountType,
        kyc_status: 'pending'
      });
      
      if (profileError) {
        console.error('Profile creation failed:', profileError);
        return { error: profileError };
      }
      
      // Create wallet, notification preferences, security settings
      await supabase.from('wallets').insert({ 
        user_id: authData.user.id, 
        balance: 0, 
        currency: 'KES'
      });
      await supabase.from('notification_preferences').insert({ 
        user_id: authData.user.id, 
        email_notifications: true, 
        sms_notifications: true, 
        push_notifications: true 
      });
      await supabase.from('security_settings').insert({ 
        user_id: authData.user.id, 
        two_factor_enabled: false, 
        last_password_change: new Date().toISOString() 
      });
      return { user: authData.user };
    }

    if (accountType === 'group' && groupMembers && groupMembers.length > 0) {
      // Validate that no group member has the same email as the primary user
      const duplicateEmail = groupMembers.find((member: any) => member.email === email);
      if (duplicateEmail) {
        return res.status(400).json({ 
          error: 'Duplicate email found', 
          details: `The email ${email} is already used for the primary account and cannot be used for group member "${duplicateEmail.firstName} ${duplicateEmail.lastName}"` 
        });
      }

      // Validate that group member emails are unique
      const memberEmails = groupMembers.map((member: any) => member.email);
      const uniqueEmails = new Set(memberEmails);
      if (memberEmails.length !== uniqueEmails.size) {
        const duplicates = memberEmails.filter((email: string, index: number) => memberEmails.indexOf(email) !== index);
        return res.status(400).json({ 
          error: 'Duplicate emails found among group members', 
          details: `The following emails are used multiple times: ${[...new Set(duplicates)].join(', ')}` 
        });
      }

      // Register the primary user (account creator) first
      const primary = await registerUser({ 
        email, 
        password, 
        firstName, 
        lastName, 
        accountType: 'individual', // Create as individual first, then update
        groupId: null // Will be set after group creation
      });
      
      if (primary.error) {
        return res.status(400).json({ error: primary.error.message || 'Primary user registration failed' });
      }

      console.log('DEBUG: primary user object:', primary.user);
      console.log('DEBUG: primary user id:', primary.user?.id);
      console.log('DEBUG: primary user email:', primary.user?.email);

      // Ensure we have a valid UUID for created_by
      const createdByUserId = primary.user?.id;
      if (!createdByUserId || typeof createdByUserId !== 'string' || createdByUserId.includes('@')) {
        console.error('DEBUG: Invalid user ID:', createdByUserId);
        return res.status(400).json({ error: 'Invalid user ID for group creation' });
      }

      // Now create the group with the actual user ID
      const { data: groupData, error: groupError } = await supabase
        .from('account_groups')
        .insert({
          name: groupName,
          type: groupType || 'sacco',
          status: 'pending',
          created_by: createdByUserId,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Group creation error:', groupError);
        return res.status(400).json({ error: 'Group creation failed', details: groupError });
      }

      const groupId = groupData.id;
      const registeredMembers = [];

      // Update primary user's profile to set account type as group
      await supabase
        .from('profiles')
        .update({ 
          account_type: 'group'
        })
        .eq('id', primary.user.id);

      // Create group membership record for primary user
      await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: primary.user.id,
        account_number: 'MAIN',
        role: 'admin',
        is_account_manager: true,
        status: 'active', // Primary user is immediately active
      });

      registeredMembers.push({
        user: primary.user,
        accountNumber: 'MAIN', // Main account holder
        role: 'admin',
        isAccountManager: true,
      });

      // Register each group member
      for (const member of groupMembers) {
        const memberUser = await registerUser({
          email: member.email,
          password: `TempPass123!${Date.now()}`, // Generate temporary password
          firstName: member.firstName,
          lastName: member.lastName,
          accountType: 'group',
          groupId,
        });

        if (memberUser.error) {
          console.error(`Failed to register member ${member.email}:`, memberUser.error);
          continue; // Continue with other members
        }

        registeredMembers.push({
          user: memberUser.user,
          accountNumber: member.accountNumber,
          role: member.role,
          isAccountManager: member.isAccountManager,
        });

        // Create group membership record
        await supabase.from('group_members').insert({
          group_id: groupId,
          user_id: memberUser.user.id,
          account_number: member.accountNumber,
          role: member.role,
          is_account_manager: member.isAccountManager,
          phone_number: member.phoneNumber,
          status: 'pending',
        });
      }

      return res.status(200).json({
        message: 'Group account registration initiated. Members will receive email invitations.',
        requiresEmailConfirmation: true,
        group: {
          id: groupId,
          name: groupName,
          type: groupType,
        },
        members: registeredMembers.map(m => ({
          id: m.user.id,
          email: m.user.email,
          accountNumber: m.accountNumber,
          role: m.role,
          isAccountManager: m.isAccountManager,
        })),
      });
    } else {
      // Individual account (original logic)
      const single = await registerUser({ email, password, firstName, lastName, accountType });
      if (single.error) return res.status(400).json({ error: single.error.message || 'Registration failed' });
      return res.status(200).json({
        message: 'Registration initiated. Please check your email to confirm your account.',
        requiresEmailConfirmation: true,
        user: { id: single.user.id, email: single.user.email }
      });
    }
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