import express from 'express';
import { verifyToken, checkRole } from './middleware.js';
import Order from './orderModel.js';
import Product from './productModel.js';
import User from './userModel.js';

const router = express.Router();

// Middleware: Verify token and check customer role
const customerAuth = [verifyToken, checkRole('customer', 'admin')];

// ============ CART & ORDERS ============

// Create order
router.post('/orders', customerAuth, async (req, res) => {
  try {
    const { items, deliveryName, deliveryAddress, deliveryPhone, deliveryEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have items' });
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const subtotal = product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });

      totalAmount += subtotal;
    }

    // Create order
    const order = new Order({
      userId: req.user.userId,
      items: orderItems,
      totalAmount,
      deliveryName,
      deliveryAddress,
      deliveryPhone,
      deliveryEmail,
      status: 'pending'
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer's orders
router.get('/orders', customerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).populate('items.productId', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get('/orders/:id', customerAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to user (unless admin)
    if (order.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ PROFILE MANAGEMENT ============

// Get user profile
router.get('/profile', customerAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', customerAuth, async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, email },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.post('/profile/change-password', customerAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }

    const user = await User.findById(req.user.userId);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
