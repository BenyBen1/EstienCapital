import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import kycRoutes from './routes/kyc';
import transactionRoutes from './routes/transactions';
import portfolioRoutes from './routes/portfolio';
import goalsRoutes from './routes/goals';
import profileRoutes from './routes/profile';
import productRoutes from './routes/products';
import memoRoutes from './routes/memos';
import { logRequest, logError } from './middleware/logger';
import { apiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimit';
import { requireAuth, requireKYC, requireAdmin } from './middleware/auth';
import fs from 'fs';
import https from 'https';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(logRequest);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/upload/', uploadLimiter);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/memos', memoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kyc', requireAuth, kycRoutes);
app.use('/api/transactions', requireAuth, requireKYC, transactionRoutes);
app.use('/api/portfolio', requireAuth, requireKYC, portfolioRoutes);
app.use('/api/goals', requireAuth, requireKYC, goalsRoutes);
app.use('/api/profile', requireAuth, profileRoutes);

// Admin routes
app.use('/api/admin', requireAuth, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log('[DEBUG] Incoming request:', req.method, req.originalUrl, req.headers.authorization);
  next();
});

// Error handling middleware
app.use(logError);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
if (process.env.NODE_ENV === 'production') {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY || ''),
    cert: fs.readFileSync(process.env.SSL_CERT || '')
  };
  https.createServer(httpsOptions, app).listen(process.env.HTTPS_PORT || 443, () => {
    console.log(`HTTPS Server running on port ${process.env.HTTPS_PORT || 443}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}