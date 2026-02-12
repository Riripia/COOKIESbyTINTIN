const API_BASE = 'http://localhost:5000/api';
const ADMIN_API = 'http://localhost:5000/api/admin';

let editingProductId = null;
let productEventSource = null; // SSE connection for products

/* ==========================================
   INITIALIZATION & AUTH HANDLING
========================================== */

// Check if admin is logged in and initialize appropriately
function initializeApp() {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    // User is logged in - show dashboard
    showDashboard();
    initializeDashboardFunctionality();
  } else {
    // User is not logged in - show login
    showLogin();
  }
}

function showLogin() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('dashboardSection').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('dashboardSection').classList.remove('hidden');
}

// Get admin token
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Simple non-blocking admin message (toast) helper
function showAdminMessage(message, type = 'info', duration = 3500) {
  let container = document.getElementById('adminMessageContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminMessageContainer';
    container.style.position = 'fixed';
    container.style.top = '16px';
    container.style.right = '16px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.textContent = message;
  el.style.marginTop = '8px';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.color = '#fff';
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
  el.style.fontWeight = '600';
  el.style.minWidth = '200px';

  if (type === 'error') el.style.background = '#ef4444';
  else if (type === 'success') el.style.background = '#10b981';
  else if (type === 'warn') el.style.background = '#f59e0b';
  else el.style.background = '#4b5563';

  container.appendChild(el);
  setTimeout(() => {
    try { container.removeChild(el); } catch (e) {}
  }, duration);
}

/* ==========================================
   LOGIN FUNCTIONALITY
========================================== */

async function adminLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  if (!email || !password) {
    errorDiv.textContent = 'Please enter email and password';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${ADMIN_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      errorDiv.style.display = 'none';
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      
      // Show dashboard instead of redirecting
      showDashboard();
      initializeDashboardFunctionality();
    } else {
      errorDiv.textContent = 'Login failed: ' + (data.message || 'Unknown error');
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Error: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

/* ==========================================
   DASHBOARD FUNCTIONALITY
========================================== */

function initializeDashboardFunctionality() {
  // Initialize menu navigation
  const menuButtons = document.querySelectorAll('.menu-btn');
  
  menuButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      
      // Remove active class from all buttons and sections
      menuButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked button and corresponding section
      this.classList.add('active');
      document.getElementById(sectionId).classList.add('active');
      
      // Load data for the section
      if (sectionId === 'products') {
        loadProducts();
      } else if (sectionId === 'orders') {
        loadOrders();
      } else if (sectionId === 'users') {
        loadUsers();
      }
    });
  });

  // Load initial data (products on first view)
  loadProducts();
  
  // Connect to SSE stream for real-time product updates
  connectToProductStream();
}

// Connect to SSE product stream for real-time updates
function connectToProductStream() {
  if (productEventSource) {
    productEventSource.close();
  }
  
  productEventSource = new EventSource('http://localhost:5000/api/products/stream');
  
  productEventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'initial') {
        // Initial data on connection - products already loaded
        console.log('Connected to product stream');
      } else if (data.type === 'products-updated') {
        // Product was modified - refresh products table immediately with new data
        console.log('Product update broadcast received');
        loadProducts();
      } else if (data.type === 'update') {
        // Legacy update signal - refresh products table
        loadProducts();
      }
    } catch (e) {
      console.log('SSE parse error:', e.message);
    }
  };
  
  productEventSource.onerror = () => {
    console.log('SSE connection lost, will retry...');
    productEventSource.close();
    // Attempt to reconnect after 5 seconds
    setTimeout(connectToProductStream, 5000);
  };
}

// Menu navigation is now handled in initializeDashboardFunctionality

/* ==========================================
   PRODUCT MANAGEMENT
========================================== */

async function addProduct() {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const image = document.getElementById('productImage').value;

  if (!name || !description || !price || !image) {
    showAdminMessage('Please fill in all required fields', 'warn');
    return;
  }

  try {
    const url = editingProductId 
      ? `${ADMIN_API}/product/${editingProductId}` 
      : `${ADMIN_API}/product`;
    const method = editingProductId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        name, 
        description, 
        price: parseFloat(price), 
        image 
      })
    });

    if (res.ok) {
      showAdminMessage(editingProductId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
      document.getElementById('productName').value = '';
      document.getElementById('productDescription').value = '';
      document.getElementById('productPrice').value = '';
      document.getElementById('productImage').value = '';
      editingProductId = null;
      document.querySelector('.btn-primary').textContent = 'Add Product';
      loadProducts();
    } else {
      showAdminMessage('Failed to save product', 'error');
    }
  } catch (error) {
    showAdminMessage('Error: ' + error.message, 'error');
  }
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const products = await res.json();
    
    const tbody = document.getElementById('productsTableBody');
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No products yet. Add one to get started!</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td><strong>${product.name}</strong></td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${(product.description || 'N/A').substring(0, 40)}...</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary" data-product-id="${product._id}" data-name="${(product.name || '').replace(/"/g, '&quot;')}" data-description="${(product.description || '').replace(/"/g, '&quot;')}" data-price="${product.price}" data-image="${(product.image || '').replace(/"/g, '&quot;')}" onclick="editProductData(this)">Edit</button>
            <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function editProductData(button) {
  const productId = button.getAttribute('data-product-id');
  const name = button.getAttribute('data-name');
  const description = button.getAttribute('data-description');
  const price = button.getAttribute('data-price');
  const image = button.getAttribute('data-image');
  editProduct(productId, name, description, price, image);
}

function editProduct(productId, name, description, price, image) {
  editingProductId = productId;
  document.getElementById('productName').value = name;
  document.getElementById('productDescription').value = description;
  document.getElementById('productPrice').value = price;
  document.getElementById('productImage').value = image;
  document.querySelector('.btn-primary').textContent = 'Update Product';
  document.getElementById('clearBtn').textContent = 'Cancel';
  document.getElementById('productName').focus();
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingProductId = null;
  document.getElementById('productName').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productImage').value = '';
  document.querySelector('.btn-primary').textContent = 'Add Product';
  document.getElementById('clearBtn').textContent = 'Clear';
  showAdminMessage('Edit cancelled', 'info');
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${ADMIN_API}/product/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      showAdminMessage('Product deleted successfully!', 'success');
      loadProducts();
    } else {
      showAdminMessage('Failed to delete product', 'error');
    }
  } catch (error) {
    showAdminMessage('Error: ' + error.message, 'error');
  }
}

/* ==========================================
   ORDER MANAGEMENT
========================================== */

async function loadOrders() {
  try {
    const res = await fetch(`${ADMIN_API}/orders`, {
      headers: getAuthHeaders()
    });
    const orders = await res.json();
    
    const tbody = document.getElementById('ordersTableBody');
    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No orders yet.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order._id.substring(0, 8)}...</td>
        <td>${order.customer?.name || 'Unknown'}</td>
        <td>$${order.total?.toFixed(2) || '0.00'}</td>
        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">View</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function viewOrderDetails(orderId) {
  showAdminMessage('Order details for: ' + orderId, 'info');
}

/* ==========================================
   USER MANAGEMENT
========================================== */

async function loadUsers() {
  try {
    // Try fetching users without auth header first
    let res = await fetch(`${API_BASE}/auth/users`);
    
    if (!res.ok && res.status === 401) {
      // Try with auth header if unauthorized
      res = await fetch(`${API_BASE}/auth/users`, {
        headers: getAuthHeaders()
      });
    }
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch users`);
    }
    
    const users = await res.json();
    
    const tbody = document.getElementById('usersTableBody');
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-message">No users found. Register a new user first.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td><strong>${user.username || 'N/A'}</strong></td>
        <td>${user.email}</td>
        <td><span class="status-badge" style="background: linear-gradient(135deg, #60a5fa, #7e22ce); color: white;">${user.role || 'customer'}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="empty-message"><strong>Cannot load users.</strong> Make sure the backend is running at localhost:5000. Error: ' + error.message + '</td></tr>';
  }
}

/* ==========================================
   LOGOUT
========================================== */

function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    // Close SSE connection
    if (productEventSource) {
      productEventSource.close();
      productEventSource = null;
    }
    
    localStorage.removeItem('adminToken');
    showLogin();
    // Clear form fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').style.display = 'none';
  }
}

/* ==========================================
   INITIALIZE APP ON PAGE LOAD
========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});
