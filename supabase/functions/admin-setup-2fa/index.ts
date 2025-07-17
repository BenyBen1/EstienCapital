import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  createAdminSupabaseClient, 
  AdminAuthError,
  generateSecureToken,
  validateTOTP
} from '../_shared/admin-utils.ts'

console.log('Admin 2FA setup function initialized')

interface Setup2FARequest {
  action: 'generate' | 'verify' | 'disable';
  totpCode?: string;
}

interface Setup2FAResponse {
  success: boolean;
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  enabled?: boolean;
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AdminAuthError('Missing or invalid authorization header', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { action, totpCode }: Setup2FARequest = await req.json()

    if (!action || !['generate', 'verify', 'disable'].includes(action)) {
      throw new AdminAuthError('Invalid action')
    }

    console.log(`2FA ${action} request received`)

    const supabase = createAdminSupabaseClient(token)

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new AdminAuthError('Invalid or expired token', 401)
    }

    // Verify admin access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single()

    if (profileError || !profile) {
      throw new AdminAuthError('Admin access denied', 403)
    }

    let response: Setup2FAResponse

    switch (action) {
      case 'generate': {
        // Generate new 2FA secret
        const secret = generateSecureToken()
        const appName = 'Estien Capital Admin'
        const accountName = profile.email
        
        // Create OTP Auth URL for QR code
        const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`
        
        // Generate QR code URL (using a QR code service)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`
        
        // Generate backup codes
        const backupCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        )

        // Store the secret (temporarily, not enabled yet)
        await supabase
          .from('security_settings')
          .upsert({
            user_id: user.id,
            two_factor_secret: secret,
            two_factor_enabled: false, // Not enabled until verified
            backup_codes: JSON.stringify(backupCodes),
            updated_at: new Date().toISOString()
          })

        response = {
          success: true,
          secret,
          qrCodeUrl,
          backupCodes
        }
        break
      }

      case 'verify': {
        if (!totpCode) {
          throw new AdminAuthError('TOTP code required for verification')
        }

        // Get the stored secret
        const { data: settings, error: settingsError } = await supabase
          .from('security_settings')
          .select('two_factor_secret')
          .eq('user_id', user.id)
          .single()

        if (settingsError || !settings?.two_factor_secret) {
          throw new AdminAuthError('2FA secret not found. Please generate a new secret first.')
        }

        // Verify the TOTP code
        if (!validateTOTP(totpCode, settings.two_factor_secret)) {
          throw new AdminAuthError('Invalid 2FA code')
        }

        // Enable 2FA
        await supabase
          .from('security_settings')
          .update({
            two_factor_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        // Log the security change
        await supabase
          .from('activity_logs')
          .insert([{
            user_id: user.id,
            action: 'admin_2fa_enabled',
            details: 'Two-factor authentication enabled',
            ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || '',
            user_agent: req.headers.get('User-Agent') || '',
            created_at: new Date().toISOString()
          }])

        response = {
          success: true,
          enabled: true
        }
        break
      }

      case 'disable': {
        if (!totpCode) {
          throw new AdminAuthError('TOTP code required to disable 2FA')
        }

        // Get current settings
        const { data: settings, error: settingsError } = await supabase
          .from('security_settings')
          .select('two_factor_secret, two_factor_enabled')
          .eq('user_id', user.id)
          .single()

        if (settingsError || !settings?.two_factor_enabled) {
          throw new AdminAuthError('2FA is not currently enabled')
        }

        // Verify the TOTP code before disabling
        if (!validateTOTP(totpCode, settings.two_factor_secret)) {
          throw new AdminAuthError('Invalid 2FA code')
        }

        // Disable 2FA
        await supabase
          .from('security_settings')
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            backup_codes: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        // Log the security change
        await supabase
          .from('activity_logs')
          .insert([{
            user_id: user.id,
            action: 'admin_2fa_disabled',
            details: 'Two-factor authentication disabled',
            ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || '',
            user_agent: req.headers.get('User-Agent') || '',
            created_at: new Date().toISOString()
          }])

        response = {
          success: true,
          enabled: false
        }
        break
      }

      default:
        throw new AdminAuthError('Invalid action')
    }

    console.log(`2FA ${action} completed successfully`)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('2FA setup error:', error)

    let statusCode = 500
    let message = 'Internal server error'

    if (error instanceof AdminAuthError) {
      statusCode = error.statusCode
      message = error.message
    }

    const errorResponse: Setup2FAResponse = {
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
// Generate 2FA secret
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/admin-setup-2fa' \
  --header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"action": "generate"}'

// Verify and enable 2FA
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/admin-setup-2fa' \
  --header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"action": "verify", "totpCode": "123456"}'
*/
