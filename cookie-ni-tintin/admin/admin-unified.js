const API_BASE = 'http://localhost:5000/api';
const ADMIN_API = 'http://localhost:5000/api/admin';

let editingProductId = null;

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

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    if (data && data.token) {
      localStorage.setItem('adminToken', data.token);
      errorDiv.style.display = 'none';
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      
      // Show dashboard instead of redirecting
      showDashboard();
      initializeDashboardFunctionality();
    } else {
      errorDiv.textContent = 'Login failed: ' + (data?.message || data || 'Unknown error');
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
}

// Menu navigation is now handled in initializeDashboardFunctionality

/* ==========================================
   PRODUCT MANAGEMENT
========================================== */

async function addProduct() {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const imageInput = document.getElementById('productImage');

  if (!name || !description || !price || !imageInput.files.length) {
    alert('Please fill in all required fields');
    return;
  }

  // Use FormData for file upload
  const file = imageInput.files[0];
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', parseFloat(price));
  formData.append('image', file);

  try {
    const url = editingProductId 
      ? `${ADMIN_API}/product/${editingProductId}` 
      : `${ADMIN_API}/product`;
    const method = editingProductId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });

    if (res.ok) {
      alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
      document.getElementById('productName').value = '';
      document.getElementById('productDescription').value = '';
      document.getElementById('productPrice').value = '';
      imageInput.value = '';
      editingProductId = null;
      document.querySelector('.btn-primary').textContent = 'Add Product';
      loadProducts();
    } else {
      alert('Failed to save product');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const productsText = await res.text();
    let products;
    try { products = productsText ? JSON.parse(productsText) : []; } catch (e) { products = []; }
    
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
  alert('Edit cancelled');
}

async function deleteProduct(productId) {
  const confirmed = await showConfirmDialog('Are you sure you want to delete this product?');
  if (!confirmed) return;

  try {
    const res = await fetch(`${ADMIN_API}/product/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      alert('Product deleted successfully!');
      loadProducts();
    } else {
      alert('Failed to delete product');
    }
  } catch (error) {
    alert('Error: ' + error.message);
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
    const ordersText = await res.text();
    let orders;
    try { orders = ordersText ? JSON.parse(ordersText) : []; } catch (e) { orders = []; }
    
    const tbody = document.getElementById('ordersTableBody');
    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No orders yet.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order._id.substring(0, 8)}...</td>
        <td>${order.customer?.name || 'Unknown'}</td>
        <td>$${order.total?.toFixed(2) || '0.00'}</td>
        <td>
          <select onchange="updateOrderStatus('${order._id}', this.value)" class="status-badge">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
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

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      alert('Order status updated!');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function viewOrderDetails(orderId) {
  alert('Order details for: ' + orderId);
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
    
    const usersText = await res.text();
    let users;
    try { users = usersText ? JSON.parse(usersText) : []; } catch (e) { users = []; }
    
    const tbody = document.getElementById('usersTableBody');
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No users found. Register a new user first.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td><strong>${user.username || 'N/A'}</strong></td>
        <td>${user.email}</td>
        <td><span class="status-badge" style="background: linear-gradient(135deg, #60a5fa, #7e22ce); color: white;">${user.role || 'customer'}</span></td>
        <td>
          <button class="btn btn-danger" onclick="removeUser('${user._id}')">Remove</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="empty-message"><strong>Cannot load users.</strong> Make sure the backend is running at localhost:5000. Error: ' + error.message + '</td></tr>';
  }
}

async function removeUser(userId) {
  const confirmed = await showConfirmDialog('Are you sure you want to remove this user?');
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      alert('User removed successfully!');
      loadUsers();
    } else {
      alert('Failed to remove user');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

/* ==========================================
   LOGOUT
========================================== */

async function adminLogout() {
  const confirmed = await showConfirmDialog('Are you sure you want to logout?');
  if (confirmed) {
    localStorage.removeItem('adminToken');
    showLogin();
    // Clear form fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').style.display = 'none';
  }
}

function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:10000;min-width:300px;';
    dialog.innerHTML = `
      <p style="margin:0 0 20px 0;font-size:16px;">${message}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button id="confirmNo" style="padding:8px 16px;border:1px solid #ccc;border-radius:4px;background:#f3f4f6;cursor:pointer;">Cancel</button>
        <button id="confirmYes" style="padding:8px 16px;border:none;border-radius:4px;background:#3b82f6;color:white;cursor:pointer;">Confirm</button>
      </div>
    `;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;';
    
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    
    document.getElementById('confirmYes').addEventListener('click', () => {
      overlay.remove();
      dialog.remove();
      resolve(true);
    });
    document.getElementById('confirmNo').addEventListener('click', () => {
      overlay.remove();
      dialog.remove();
      resolve(false);
    });
  });
}

/* ==========================================
   INITIALIZE APP ON PAGE LOAD
========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  // Export functions globally for HTML access
  window.adminLogin = adminLogin;
  window.addProduct = addProduct;
  window.editProductData = editProductData;
  window.cancelEdit = cancelEdit;
  window.deleteProduct = deleteProduct;
  window.updateOrderStatus = updateOrderStatus;
  window.viewOrderDetails = viewOrderDetails;
  window.removeUser = removeUser;
  window.adminLogout = adminLogout;
});
