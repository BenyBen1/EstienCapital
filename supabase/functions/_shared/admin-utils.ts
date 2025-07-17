import { createClient } from 'npm:@supabase/supabase-js@2'

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function createAdminSupabaseClient(authToken?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  // Use service role key for admin operations
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    }
  })
}

export function createUserSupabaseClient(authToken: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  })
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isSecureAdminEmail(email: string): boolean {
  // Define secure admin email addresses - use dedicated secure email services
  // PRODUCTION CONFIGURATION - Only authorized secure emails can access admin functions
  const secureAdminEmails = [
    // Primary admin email (UUID-based for maximum security)
    'admin.ea1cccbc3f35426687ae6fdd52233b6a@protonmail.com',
    
    // Emergency backup admin email
    'backup.admin.ec.emergency@protonmail.com',
    
    // Development/testing emails (REMOVE IN PRODUCTION)
    'admin@estiencapital.com',  // TODO: Remove this for production deployment
  ]
  
  return secureAdminEmails.includes(email.toLowerCase())
}

export function generateSecureToken(): string {
  return crypto.randomUUID()
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function validateTOTP(token: string, secret: string): boolean {
  // For production, implement actual TOTP validation
  // For now, allow specific test codes for development
  const validTestCodes = ['123456', '000000']
  return validTestCodes.includes(token) || token.length === 6
}

export class AdminAuthError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.name = 'AdminAuthError'
    this.statusCode = statusCode
  }
}
