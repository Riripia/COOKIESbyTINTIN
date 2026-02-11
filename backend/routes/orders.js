import express from 'express';
import { getOrders, createOrder } from '../controllers/orderController.js';

const router = express.Router();

// Get orders for user (filtered)
router.get('/', getOrders);

// Create order
router.post('/', createOrder);

export default router;
