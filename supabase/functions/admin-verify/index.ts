import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  createAdminSupabaseClient, 
  AdminAuthError,
  type AdminUser 
} from '../_shared/admin-utils.ts'

console.log('Admin verify function initialized')

interface VerifyRequest {
  token: string;
}

interface VerifyResponse {
  success: boolean;
  user?: AdminUser;
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
    console.log('Verifying admin token...')

    // Create Supabase client with the provided token
    const supabase = createAdminSupabaseClient(token)

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('Token verification failed:', userError?.message)
      throw new AdminAuthError('Invalid or expired token', 401)
    }

    // Get admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single()

    if (profileError || !profile) {
      console.error('Admin profile not found:', profileError?.message)
      throw new AdminAuthError('Admin access denied', 403)
    }

    // Create admin user object
    const adminUser: AdminUser = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || 'Admin',
      lastName: profile.last_name || 'User',
      role: profile.role || 'admin',
      permissions: ['all'],
      isActive: true,
      lastLoginAt: profile.last_sign_in_at,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at || new Date().toISOString()
    }

    console.log(`Token verified for admin: ${profile.email}`)

    const response: VerifyResponse = {
      success: true,
      user: adminUser
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin verification error:', error)

    let statusCode = 500
    let message = 'Internal server error'

    if (error instanceof AdminAuthError) {
      statusCode = error.statusCode
      message = error.message
    }

    const errorResponse: VerifyResponse = {
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
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/admin-verify' \
  --header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
  --header 'Content-Type: application/json'
*/
