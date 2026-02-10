import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const register = (userData) => API.post('/auth/register', userData);
export const login = (userData) => API.post('/auth/login', userData);

// Products
export const fetchProducts = () => API.get('/products');
export const addProduct = (productData) => API.post('/products', productData);

// Orders
export const fetchOrders = () => API.get('/orders');
export const createOrder = (orderData) => API.post('/orders', orderData);
