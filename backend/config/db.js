import mongoose from "mongoose"; 
import dotenv from "dotenv"; 
dotenv.config(); 
 
const connectDB = async () => { 
  try { 
    const mongoURI = process.env.MONGO_URI; 
    if (!mongoURI) throw new Error("MONGO_URI is not defined in .env"); 
 
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
      // Avoid invalid write concern 
      w: "majority", // safe default 
    }); 
 
    console.log("MongoDB connected successfully"); 
  } catch (err) { 
    console.error("MongoDB connection error:", err.message); 
    throw err; 
  } 
}; 
 
export default connectDB; 
 
 
// backend/controllers/authController.js 
import User from "../models/userModel.js"; 
import jwt from "jsonwebtoken"; 
 
// Fallback secret for dev/test 
const JWT_FALLBACK_SECRET = "insecure-test-secret"; 
 
// Generate JWT token 
const generateToken = (id, role) => { 
  const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET; 
  return jwt.sign({ id, role }, secret, { expiresIn: "30d" }); 
}; 
 
// REGISTER 
export const register = async (req, res) => { 
  try { 
    const { username, email, password, role } = req.body; 
    if (!username || !email || !password) { 
      return res.status(400).json({ message: "All fields are required" }); 
    } 
 
    const normalizedEmail = email.trim().toLowerCase(); 
    const exists = await User.findOne({ email: normalizedEmail }); 
    if (exists) return res.status(409).json({ message: "Email already registered" }); 
 
    const newUser = new User({ 
      username: username.trim(), 
      email: normalizedEmail, 
      password: password.trim(), 
      role: role || "user", // default role is "user" 
    }); 
 
    await newUser.save(); 
 
    const token = generateToken(newUser._id, newUser.role); 
 
    return res.status(201).json({ 
      message: `User registered successfully as ${newUser.role}`, 
      token, 
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role, 
      }, 
    }); 
  } catch (err) { 
    return res.status(500).json({ error: "Registration failed", details: err.message }); 
  } 
};