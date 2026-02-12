import express from 'express';
import Product from '../models/Product.js';
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Store connected SSE clients
const productStreamClients = new Set();

// Broadcast product updates to all connected clients
export async function broadcastProductUpdate() {
  try {
    // Fetch latest products from database
    const products = await Product.find();
    const data = { type: 'products-updated', products, timestamp: new Date().toISOString() };
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    console.log(`Broadcasting product update to ${productStreamClients.size} clients`);
    
    productStreamClients.forEach(client => {
      try {
        client.write(message);
      } catch (e) {
        productStreamClients.delete(client);
      }
    });
  } catch (error) {
    console.error('Error broadcasting product update:', error);
  }
}

// SSE endpoint - Stream product updates
router.get('/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial product data
  Product.find()
    .then(products => {
      const data = { type: 'initial', products };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      
      // Add client to the set
      productStreamClients.add(res);
      
      // Send heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        res.write(`: heartbeat\n\n`);
      }, 30000);
      
      // Cleanup on disconnect
      req.on('close', () => {
        clearInterval(heartbeat);
        productStreamClients.delete(res);
      });
    })
    .catch(error => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    });
});

// Get all products (REST fallback)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product (admin only)
router.post('/product', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Save product with imageUrl
    const product = new Product({
      name,
      description,
      price,
      image: imageUrl
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (admin only)
router.put('/product/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updateData = { name, description, price };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Broadcast update to all connected clients
    broadcastProductUpdate();
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

app.use('/uploads', express.static('uploads'));
