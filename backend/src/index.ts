import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// TODO: Add routes for auth, kyc, deposits, withdrawals, profile, etc.

const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Optional: Enable HTTPS if certs are provided
const SSL_KEY = process.env.SSL_KEY || '';
const SSL_CERT = process.env.SSL_CERT || '';

if (SSL_KEY && SSL_CERT && fs.existsSync(SSL_KEY) && fs.existsSync(SSL_CERT)) {
  const sslOptions = {
    key: fs.readFileSync(SSL_KEY),
    cert: fs.readFileSync(SSL_CERT),
  };
  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`✅ HTTPS server running on port ${HTTPS_PORT}`);
    console.log(`    SSL_KEY: ${SSL_KEY}`);
    console.log(`    SSL_CERT: ${SSL_CERT}`);
    console.log(`    NODE_ENV: ${NODE_ENV}`);
  });
} else {
  app.listen(HTTP_PORT, () => {
    console.log(`✅ HTTP server running on port ${HTTP_PORT}`);
    if (SSL_KEY || SSL_CERT) {
      console.log('⚠️  SSL_KEY or SSL_CERT provided but files not found. HTTPS not enabled.');
    } else {
      console.log('ℹ️  To enable HTTPS, set SSL_KEY and SSL_CERT in your .env file.');
    }
    console.log(`    NODE_ENV: ${NODE_ENV}`);
  });
}