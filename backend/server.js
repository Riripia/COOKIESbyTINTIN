import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './admin/admin.routes.js';

dotenv.config();

const app = express();

/* =========================
   Global Middleware
========================= */


// CORS: Allow all origins in development, restrict in production
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
} else {
  app.use(cors({
    origin: true, // allow all origins for local development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}

app.use(express.json());
// Helmet for basic security headers
app.use(helmet());

// Custom Security Headers
app.use((req, res, next) => {
  // Content Security Policy (CSP)
  // Allow connect-src to self and localhost:5000 for dev, restrict in prod
  let connectSrc = "'self'";
  if (process.env.NODE_ENV !== 'production') {
    connectSrc += ' http://localhost:5000 http://localhost:3000';
  }
  res.setHeader('Content-Security-Policy',
    `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src ${connectSrc}; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';`
  );
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS Protection (legacy)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // HSTS (Strict-Transport-Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // Remove X-Powered-By
  res.removeHeader('X-Powered-By');
  next();
});

// Force HTTPS (redirect HTTP to HTTPS) only in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}

/* =========================
   Database Connection
========================= */
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err.message));
} else {
  console.warn('MONGO_URI not set — starting without DB connection (dev mode)');
}

/* =========================
   Routes
========================= */
app.use('/api/auth', authRoutes);        // customers
app.use('/api/products', productRoutes);// public/products
app.use('/api/orders', orderRoutes);    // customer orders
app.use('/api/admin', adminRoutes);     // admin interface

/* =========================
   Health Check
========================= */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Cookies by TinTin API' });
});

// Test endpoint to verify routing
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth route test successful' });
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

/* =========================
   Server Start
========================= */
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));