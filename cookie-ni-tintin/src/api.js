// api.js
const API_URL = 'http://localhost:5000';

// Helper function for API calls
async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (e) {
      responseBody = null;
    }
    if (!response.ok) {
      const error = new Error(responseBody?.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.response = { status: response.status, data: responseBody };
      throw error;
    }
    return { data: responseBody };
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
}

// API Functions
export const fetchProducts = async () => {
  try {
    return await apiRequest('/products');
  } catch (error) {
    throw new Error('Failed to fetch products from MongoDB. Please try again later.');
  }
};


export const register = async (userData) => {
  try {
    return await apiRequest('/api/auth/register', 'POST', userData);
  } catch (error) {
    throw new Error('Registration service unavailable. Using demo mode.');
  }
};


export const login = async (userData) => {
  try {
    return await apiRequest('/api/auth/login', 'POST', userData);
  } catch (error) {
    throw new Error('Login service unavailable. Using demo mode.');
  }
};


export const createOrder = async (orderData) => {
  try {
    return await apiRequest('/api/orders', 'POST', orderData);
  } catch (error) {
    throw new Error('Order service unavailable. Using demo mode.');
  }
};

// Fetch orders for a user

export const fetchOrders = async (userId) => {
  try {
    return await apiRequest(`/api/orders?user=${userId}`);
  } catch (error) {
    const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
    return { data: localOrders.filter(o => o.user === userId) };
  }
};