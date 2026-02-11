import express from 'express';
import cors from 'cors';
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
app.use(cors({
  origin: ['http://localhost:3000'], // frontend origin
  credentials: true
}));

app.use(express.json());
app.use(helmet()); // security headers

/* =========================
   Database Connection
========================= */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));