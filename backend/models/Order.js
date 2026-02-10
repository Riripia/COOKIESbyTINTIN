import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  orderDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Order', orderSchema);
