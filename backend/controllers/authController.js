import User from "../models/userModel.js"; 
import jwt from "jsonwebtoken"; 
 
// Fallback secret for dev/test 
const JWT_FALLBACK_SECRET = "insecure-test-secret"; 
 
// Generate JWT token 
const generateToken = (id, role) => { 
  const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET; 
  return jwt.sign({ id, role }, secret, { expiresIn: "30d" }); 
};