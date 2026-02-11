import Order from '../models/Order.js';

// Get orders for a specific user
export const getOrders = async (req, res) => {
  try {
    const userId = req.query.user;
    const filter = userId ? { user: userId } : {};
    const orders = await Order.find(filter).populate('user');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
