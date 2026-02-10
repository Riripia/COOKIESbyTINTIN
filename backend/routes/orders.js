import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Get orders for user
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
