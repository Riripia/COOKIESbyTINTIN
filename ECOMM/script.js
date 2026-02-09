// Modal functionality
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginLink = document.getElementById('login-link');
const registerLink = document.getElementById('register-link');
const loginClose = document.getElementById('login-close');
const registerClose = document.getElementById('register-close');
const alertModal = document.getElementById('alert-modal');
const alertBtn = document.getElementById('alert-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmOkBtn = document.getElementById('confirm-ok-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
let confirmCallback = null;

// Custom Alert Function
function showAlert(message, title = 'Alert') {
  document.getElementById('alert-title').textContent = title;
  document.getElementById('alert-message').textContent = message;
  alertModal.style.display = 'block';
}

alertBtn.onclick = function() {
  alertModal.style.display = 'none';
}

// Custom Confirm Function
function showConfirm(message, title = 'Confirm', callback) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  confirmCallback = callback;
  confirmModal.style.display = 'block';
}

confirmOkBtn.onclick = function() {
  confirmModal.style.display = 'none';
  if (confirmCallback) {
    confirmCallback();
  }
}

confirmCancelBtn.onclick = function() {
  confirmModal.style.display = 'none';
  confirmCallback = null;
}

// Close alert when clicking outside
window.addEventListener('click', function(event) {
  if (event.target == alertModal) {
    alertModal.style.display = 'none';
  }
});

// Open modals
loginLink.onclick = function() {
  loginModal.style.display = 'block';
}

registerLink.onclick = function() {
  registerModal.style.display = 'block';
}

// Redirect from login to register
document.getElementById('login-to-register').onclick = function(e) {
  e.preventDefault();
  loginModal.style.display = 'none';
  registerModal.style.display = 'block';
}

// Close modals
loginClose.onclick = function() {
  loginModal.style.display = 'none';
}

registerClose.onclick = function() {
  registerModal.style.display = 'none';
}

// Form handling
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  if (users.length === 0) {
    showAlert('No users registered yet. Please register first!', 'No Users');
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
    return;
  }
  
  const emailExists = users.find(u => u.email === email);
  if (!emailExists) {
    showAlert('Email not found! Please register first.', 'Email Not Found');
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
    return;
  }
  
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    showAlert('Login successful! Welcome back, ' + user.username + '!', 'Login Successful');
    loginModal.style.display = 'none';
    updateNavForLoggedInUser();
  } else {
    showAlert('Wrong password!', 'Error');
  } 
});


document.getElementById('register-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    showAlert('Email already registered!', 'Registration Error');
    return;
  }

  const newUser = { username, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  showAlert('Registration successful! Please login.', 'Registration Successful');
  registerModal.style.display = 'none';
  loginModal.style.display = 'block';
});

// Update navigation for logged in user
function updateNavForLoggedInUser() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    loginLink.textContent = 'Welcome, ' + currentUser.username;
    loginLink.onclick = function() {
      showConfirm('Are you sure you want to logout?', 'Logout', function() {
        localStorage.removeItem('currentUser');
        location.reload();
      });
    };
    registerLink.style.display = 'none';
  }
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Product prices - Updated to match the new product names
const productPrices = {
  'Chocolate Chip Cookies': 120,
  'Matcha Cookies': 180,
  'Double Chocolate Cookies': 250,
  'Oatmeal Raisin Cookies': 90
};

// Update cart display
function updateCartDisplay() {
  const cartLink = document.getElementById('cart-link');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartLink.textContent = `Cart (${totalItems})`;

  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty</p>';
    cartTotal.textContent = 'Total: ₱0';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${item.name}</strong><br>
        ₱${item.price} each
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
        <button onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
        <button onclick="removeFromCart(${index})" style="background: #ef4444;">Remove</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `Total: ₱${total}`;
}

// Add to cart function
function addToCart(productName) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    showAlert('Please login to add items to cart!', 'Login Required');
    loginModal.style.display = 'block';
    return;
  }

  const price = productPrices[productName];
  const existingItem = cart.find(item => item.name === productName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name: productName, price: price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
  showAlert(productName + ' added to cart!', 'Added to Cart');
}

// Update quantity
function updateQuantity(index, newQuantity) {
  newQuantity = parseInt(newQuantity);
  if (newQuantity < 1) {
    removeFromCart(index);
    return;
  }
  cart[index].quantity = newQuantity;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

// Remove from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

// Cart modal functionality
const cartModal = document.getElementById('cart-modal');
const cartLink = document.getElementById('cart-link');
const cartClose = document.getElementById('cart-close');

cartLink.onclick = function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    showAlert('Please login to view your cart!', 'Login Required');
    loginModal.style.display = 'block';
    return;
  }
  updateCartDisplay();
  cartModal.style.display = 'block';
}

cartClose.onclick = function() {
  cartModal.style.display = 'none';
}

// Checkout modal functionality
const checkoutModal = document.getElementById('checkout-modal');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutClose = document.getElementById('checkout-close');

checkoutBtn.onclick = function() {
  if (cart.length === 0) {
    showAlert('Your cart is empty!', 'Empty Cart');
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('checkout-total').textContent = `Total: ₱${total}`;
  cartModal.style.display = 'none';
  checkoutModal.style.display = 'block';
}

checkoutClose.onclick = function() {
  checkoutModal.style.display = 'none';
}

// Checkout form submission
document.getElementById('checkout-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const orderData = {
    customer: {
      name: document.getElementById('delivery-name').value,
      address: document.getElementById('delivery-address').value,
      phone: document.getElementById('delivery-phone').value,
      email: document.getElementById('delivery-email').value
    },
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    orderDate: new Date().toISOString()
  };

  // Store order in localStorage (in a real app, this would be sent to a server)
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));

  showAlert('Order placed successfully! Thank you for your purchase.', 'Order Confirmed');
  checkoutModal.style.display = 'none';
  updateCartDisplay();
});

// Close modal when clicking outside
// window.onclick = function(event) {
//   if (event.target == loginModal) {
//     loginModal.style.display = 'none';
//   }
//   if (event.target == registerModal) {
//     registerModal.style.display = 'none';
//   }
//   if (event.target == cartModal) {
//     cartModal.style.display = 'none';
//   }
//   if (event.target == checkoutModal) {
//     checkoutModal.style.display = 'none';
//   }
// }

// Update order function to add to cart instead
function order(item) {
  addToCart(item);
}

// Initialize cart display on page load
window.onload = function() {
  updateCartDisplay();
  updateNavForLoggedInUser();
}
