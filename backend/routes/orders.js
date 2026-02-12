import express from 'express';
import Order from '../models/Order.js';
import { getOrders, createOrder } from '../controllers/orderController.js';
import { verifyToken } from '../middleware.js';

const router = express.Router();

// Get orders for user (filtered)
router.get('/', getOrders);

// Get authenticated user's own orders
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', createOrder);

export default router;
