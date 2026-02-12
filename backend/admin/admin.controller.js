import Admin from './adminModel.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

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
  // If image is already Base64, just save
  // If image is a file, convert to Base64 before saving (frontend should send Base64)
  const product = new Product(req.body);
  await product.save();
  res.json({ message: 'Product added' });
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated', product: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
};

export const getOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};

