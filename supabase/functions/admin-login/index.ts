import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  createAdminSupabaseClient, 
  isSecureAdminEmail, 
  validateEmail,
  validateTOTP,
  AdminAuthError,
  type AdminUser 
} from '../_shared/admin-utils.ts'

console.log('Admin login function initialized')

interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

interface LoginResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  requires2FA?: boolean;
  sessionId?: string;
  error?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new AdminAuthError('Method not allowed', 405)
    }

    const { email, password, totpCode }: LoginRequest = await req.json()

    // Input validation
    if (!email || !password) {
      throw new AdminAuthError('Email and password are required')
    }

    if (!validateEmail(email)) {
      throw new AdminAuthError('Invalid email format')
    }

    // Security check: Only allow secure admin emails
    if (!isSecureAdminEmail(email)) {
      throw new AdminAuthError('Unauthorized admin email')
    }

    console.log(`Admin login attempt for: ${email}`)

    // Create Supabase client with service role for admin operations
    const supabase = createAdminSupabaseClient()

    // Attempt authentication with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Auth failed:', authError?.message)
      throw new AdminAuthError('Invalid credentials', 401)
    }

    // Get admin profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .eq('role', 'admin')
      .single()

    if (profileError || !profile) {
      console.error('Admin profile not found:', profileError?.message)
      throw new AdminAuthError('Admin access denied', 403)
    }

    // Check if 2FA is enabled
    const { data: securitySettings, error: securityError } = await supabase
      .from('security_settings')
      .select('two_factor_enabled, two_factor_secret')
      .eq('user_id', authData.user.id)
      .single()

    if (securityError) {
      console.error('Security settings error:', securityError.message)
      throw new AdminAuthError('Security check failed', 500)
    }

    // If 2FA is enabled, verify TOTP code
    if (securitySettings.two_factor_enabled) {
      if (!totpCode) {
        return new Response(JSON.stringify({
          success: false,
          requires2FA: true,
          error: 'Two-factor authentication required'
        } as LoginResponse), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate TOTP code
      if (!validateTOTP(totpCode, securitySettings.two_factor_secret || '')) {
        throw new AdminAuthError('Invalid 2FA code', 401)
      }
    }

    // Create admin user object
    const adminUser: AdminUser = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || 'Admin',
      lastName: profile.last_name || 'User',
      role: profile.role || 'admin',
      permissions: ['all'], // Define specific permissions based on role
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at || new Date().toISOString()
    }

    // Update last login time
    await supabase
      .from('profiles')
      .update({ 
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    // Log admin login activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: profile.id,
        action: 'admin_login',
        details: `Admin login from ${req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown'}`,
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || '',
        user_agent: req.headers.get('User-Agent') || '',
        created_at: new Date().toISOString()
      }])

    console.log(`Admin login successful for: ${email}`)

    const response: LoginResponse = {
      success: true,
      user: adminUser,
      token: authData.session?.access_token,
      sessionId: authData.session?.access_token?.slice(-8) // Last 8 chars for session reference
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin login error:', error)

    let statusCode = 500
    let message = 'Internal server error'

    if (error instanceof AdminAuthError) {
      statusCode = error.statusCode
      message = error.message
    }

    const errorResponse: LoginResponse = {
      success: false,
      error: message
    }

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/* To invoke this function:
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/admin-login' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "admin@estiencapital.com",
    "password": "your-secure-password",
    "totpCode": "123456"
  }'
*/
