import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No Authorization header or not Bearer');
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    // Verify and decode the JWT token from Supabase
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as {
      sub: string;
      email?: string;
      exp?: number;
    };

    const userId = decoded.sub;
    console.log('Decoded user ID:', userId);

    // Fetch user profile using supabaseAdmin (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Profile lookup result:', { profile, profileError });

    if (profileError || !profile) {
      console.error('User profile not found:', profileError);
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = {
      id: userId,
      email: decoded.email || profile.email || '',
      role: profile.role,
    };

    console.log('User authenticated:', req.user);
    next();
  } catch (err: any) {
    console.error('Auth error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    return res.status(401).json({ error: 'Invalid or malformed token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireKYC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Use supabaseAdmin to bypass RLS and check KYC status
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('kyc_status')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      console.error('KYC status check error:', error);
      return res.status(500).json({ error: 'Error checking KYC status' });
    }

    if (profile.kyc_status !== 'approved') {
      return res.status(403).json({ 
        error: 'KYC verification required',
        kyc_status: profile.kyc_status
      });
    }

    next();
  } catch (error) {
    console.error('KYC middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 