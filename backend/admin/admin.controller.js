import Admin from './adminModel.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { broadcastProductUpdate } from '../routes/products.js';

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcryptjs.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

export const dashboard = async (req, res) => {
  res.json({ message: 'Admin dashboard access granted' });
};

export const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    // Broadcast update to all connected clients
    broadcastProductUpdate();
    res.status(201).json({ message: 'Product added', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Broadcast update to all connected clients
    broadcastProductUpdate();
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Broadcast update to all connected clients
    broadcastProductUpdate();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    // Return all fields for each order
    const orders = await Order.find({}, '-__v').lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

