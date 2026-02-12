const API_BASE = 'http://localhost:5000/api';
const ADMIN_API = 'http://localhost:5000/api/admin';

let editingProductId = null;

// Check if admin is logged in
function checkAdminAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/admin/adminLogin.html';
  }
}

// Get admin token
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Menu navigation
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const sectionId = this.getAttribute('data-section');
    
    // Remove active class from all buttons and sections
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
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

// Add Product
function getBase64FromFileInput(input, callback) {
  const file = input.files[0];
  if (!file) return callback('');
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function addProduct() {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const imageInput = document.getElementById('productImage');

  if (!name || !description || !price || !imageInput.files.length) {
    alert('Please fill in all required fields');
    return;
  }

  getBase64FromFileInput(imageInput, async (base64Image) => {
    try {
      const url = editingProductId 
        ? `${ADMIN_API}/product/${editingProductId}` 
        : `${ADMIN_API}/product`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description, price: parseFloat(price), image: base64Image })
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
        const error = await res.json();
        alert('Failed to save product: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
}

// Load Products
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
        <td>${product.description.substring(0, 50)}...</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="editProduct('${product._id}', '${product.name}', '${product.description}', ${product.price}, '${product.image}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Edit Product
function editProduct(productId, name, description, price, image) {
  editingProductId = productId;
  document.getElementById('productName').value = name;
  document.getElementById('productDescription').value = description;
  document.getElementById('productPrice').value = price;
  document.getElementById('productImage').value = image;
  document.querySelector('.btn-primary').textContent = 'Update Product';
  document.getElementById('productName').focus();
  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete Product
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

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

// Load Orders
async function loadOrders() {
  try {
    const res = await fetch(`${ADMIN_API}/orders`, {
      headers: getAuthHeaders()
    });
    const orders = await res.json();
    
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

// Update Order Status
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

// View Order Details
function viewOrderDetails(orderId) {
  alert('Order details for: ' + orderId);
}

// Load Users - Fixed endpoint
async function loadUsers() {
  try {
    // Try fetching users without auth header first (simpler approach)
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
    tbody.innerHTML = '<tr><td colspan="4" class="empty-message"><strong>Cannot load users.</strong> Make sure the backend is running and accessible at localhost:5000. Error: ' + error.message + '</td></tr>';
  }
}

// Remove User
async function removeUser(userId) {
  if (!confirm('Are you sure you want to remove this user?')) return;

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

// Logout
function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/adminLogin.html';
  }
}

// Initialize
checkAdminAuth();
