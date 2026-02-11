import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './adminModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const hash = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      email: "admin@email.com",
      password: hash,
      role: "admin"
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
})();