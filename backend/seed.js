import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const products = [
  { name: 'Chocolate Chip Cookies', description: 'Classic cookies with rich chocolate chips', price: 120, image: '/cookie/chocolate chip cookie.jpg' },
  { name: 'Matcha Cookies', description: 'Premium green tea flavored cookies', price: 180, image: '/cookie/matcha cookie.jpg' },
  { name: 'Double Chocolate Cookies', description: 'Extra chocolatey with cocoa and chips', price: 250, image: '/cookie/double chocolate cookie.jpg' },
  { name: 'Oatmeal Raisin Cookies', description: 'Healthy and delicious oat cookies', price: 90, image: '/cookie/oatmeal raisin cookie.jpg' }
];

const seedProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');
    const beforeCount = await Product.countDocuments();
    console.log('Products in DB before delete:', beforeCount);
    await Product.deleteMany(); // Clear existing
    const afterDeleteCount = await Product.countDocuments();
    console.log('Products in DB after delete:', afterDeleteCount);
    const inserted = await Product.insertMany(products);
    console.log('Inserted products:', inserted);
    const afterInsertCount = await Product.countDocuments();
    console.log('Products in DB after insert:', afterInsertCount);
    console.log('Products seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

