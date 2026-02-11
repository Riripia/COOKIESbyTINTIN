// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import tintinCookies from './cookie/tintinCookies.png';
import cookies5 from './cookie/cookies5.jpg';
import { register, login, fetchProducts, createOrder, fetchOrders } from './api';

// ============================================
// REUSABLE COMPONENTS
// ============================================

// Header Component
function Header() {
  return (
    <header style={{ backgroundImage: `url(${cookies5})` }}>
      <h1 className="headerTitle">
        <img src={tintinCookies} alt="Tintin Cookies" style={{maxWidth: '500px', width: '100%', height: 'auto', display: 'block', margin: '0 auto'}} />
      </h1>
      <p>Freshly baked Cookies made with love</p>
    </header>
  );
}

// Navigation Component
function Navigation({ currentUser, totalItems, onLoginClick, onRegisterClick, onLogout, onCartClick, onOrdersClick }) {
  return (
    <nav>
      <a href="#home">Home</a>
      <a href="#menu">Menu</a>
      {currentUser && (
        <a href="#" onClick={e => { e.preventDefault(); onOrdersClick(); }}>Orders</a>
      )}
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onCartClick(); }}>
        Cart ({totalItems})
      </a>
      {currentUser ? (
        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
          Welcome, {currentUser.username}
        </a>
      ) : (
        <>
          <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onRegisterClick(); }}>Register</a>
        </>
      )}
    </nav>
  );
}

// Hero Component
function Hero() {
  return (
    <section id="home" className="hero">
      <h2>Sweet Moments Start Here</h2>
      <p>Delight in our handcrafted Cookies baked fresh daily.</p>
    </section>
  );
}

// Product Card Component
function ProductCard({ product, onOrderClick }) {
  // Dynamically import images from src/cookie
  let productImg;
  try {
    productImg = require(`./cookie/${product.image}`);
  } catch (e) {
    productImg = '';
  }
  return (
    <div className="card">
      <img src={productImg} alt={product.name} className="card-image" />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span className="price">₱{product.price}</span>
      <button onClick={() => onOrderClick(product.name, product.price)}>Order Now</button>
    </div>
  );
}

// Menu Component
function Menu({ products, onOrderClick }) {
  return (
    <section id="menu" className="content-section">
      <div className="container">
        <h2 className="section-title">Our Menu</h2>
        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
        }}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onOrderClick={onOrderClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// About Component
function About() {
  return (
    <section id="about" className="content-section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        <p>Cookies by Tintin has been serving delicious, freshly-baked cookies since 2020. Our mission is to bring joy to every bite with premium ingredients and love in every batch.</p>
      </div>
    </section>
  );
}

// Contact Component
function Contact() {
  return (
    <section id="contact" className="content-section">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <p>Email: info@cookiesbytintin.com | Phone: +63 (555) 123-4567</p>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer>
      <p>&copy; 2024 Cookies by Tintin. All rights reserved.</p>
    </footer>
  );
}

// Alert Modal Component
function AlertModal({ title, message, onClose }) {
  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content alert-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="alert-message">{message}</p>
        <button onClick={onClose} className="alert-btn gradient-btn">OK</button>
      </div>
    </div>
  );
}

// Confirm Modal Component
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal" style={{ display: 'block' }} onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onCancel}>&times;</span>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm} className="alert-btn gradient-btn" style={{ marginRight: '0.5rem' }}>Confirm</button>
        <button onClick={onCancel} className="alert-btn gradient-btn">Cancel</button>
      </div>
    </div>
  );
}

// Login Modal Component
function LoginModal({ onClose, onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit">Login</button>
          <p className="modal-message">
            No account yet? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>Register here</a>
          </p>
        </form>
      </div>
    </div>
  );
}

  // Register Modal Component
function RegisterModal({ onClose, onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(username, email, password);
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit">Register</button>
          <p className="modal-message">
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login here</a>
          </p>
        </form>
      </div>
    </div>
  );
}

// Cart Modal Component
function CartModal({ cart, onClose, onUpdateQuantity, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content cart-modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Your Cart</h2>
        <div id="cart-items">
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.name}</strong><br />
                  ₱{item.price} each
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => onUpdateQuantity(index, item.quantity - 1)}>-</button>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    min="1"
                    onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
                  />
                  <button onClick={() => onUpdateQuantity(index, item.quantity + 1)}>+</button>
                  <button onClick={() => onRemove(index)} style={{ background: '#ef4444' }}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div id="cart-total">Total: ₱{total}</div>
        <button onClick={onCheckout} className="checkout-btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ total, onClose, onCheckout }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckout(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Checkout</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name"
            placeholder="Full Name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="address"
            placeholder="Delivery Address" 
            value={formData.address}
            onChange={handleChange}
            required 
          />
          <input 
            type="tel" 
            name="phone"
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={handleChange}
            required 
          />
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <div id="checkout-total">Total: ₱{total}</div>
          <button type="submit" className="checkout-submit-btn">Place Order</button>
        </form>
      </div>
    </div>
  );
}

// ============================================

// MAIN APP COMPONENT
// ============================================

function App() {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertData, setAlertData] = useState({ title: 'Alert', message: '' });
  const [confirmData, setConfirmData] = useState({ 
    title: 'Confirm', 
    message: '', 
    onConfirm: null 
  });

  // Products data from both versions
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Chocolate Chip Cookies',
      price: 120,
      description: 'Classic cookies with rich chocolate chips',
      image: 'chocolate chip cookie.jpg'
    },
    {
      id: 2,
      name: 'Matcha Cookies',
      price: 180,
      description: 'Premium green tea flavored cookies',
      image: 'matcha cookie.jpg'
    },
    {
      id: 3,
      name: 'Double Chocolate Cookies',
      price: 250,
      description: 'Extra chocolatey with cocoa and chips',
      image: 'double chocolate cookie.jpg'
    },
    {
      id: 4,
      name: 'Oatmeal Raisin Cookies',
      price: 90,
      description: 'Healthy and delicious oat cookies',
      image: 'oatmeal raisin cookie.jpg'
    }
  ]);

  // User orders state
  const [orders, setOrders] = useState([]);

  // Fetch products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try to fetch from API first
        const res = await fetchProducts();
        if (res && res.data) {
          setProducts(res.data);
        }
      } catch (error) {
        console.log('Using default products:', error.message);
        // Use default products if API fails
      }
    };
    
    loadProducts();
  }, []);


  // Load user, cart, and orders from localStorage on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (user) setCurrentUser(user);
    setCart(savedCart);
    // Try to load orders from API if user exists
    if (user) {
      loadOrders(user.id);
    }
  }, []);

  // Fetch orders for the user
  const loadOrders = async (userId) => {
    try {
      // Try to fetch from API
      const res = await fetchOrders(userId);
      if (res && res.data) {
        setOrders(res.data);
        localStorage.setItem('orders', JSON.stringify(res.data));
        return;
      }
    } catch (error) {
      // fallback to localStorage
      const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(localOrders.filter(o => o.user === userId));
    }
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Utility functions
  const showAlert = (message, title = 'Alert') => {
    setAlertData({ title, message });
    setShowAlertModal(true);
  };

  const showConfirm = (message, title = 'Confirm', onConfirm) => {
    setConfirmData({ title, message, onConfirm });
    setShowConfirmModal(true);
  };

  // Handle login
  const handleLogin = async (email, password) => {
    try {
      const res = await login({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      showAlert('Login successful! Welcome back, ' + res.data.user.username + '!', 'Login Successful');
      setShowLoginModal(false);
      loadOrders(res.data.user.id);
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.response) {
        if (error.response.status === 400) {
          message = error.response.data?.message || 'Invalid credentials. Please check your email and password.';
        } else if (error.response.status === 404) {
          message = 'User not found. Please register first.';
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      }
      showAlert(message, 'Error');
    }
  };

  // Handle register
  const handleRegister = async (username, email, password) => {
    try {
      await register({ username, email, password });
      showAlert('Registration successful! Please login.', 'Registration Successful');
      setShowRegisterModal(false);
      setShowLoginModal(true);
    } catch (error) {
      // Fallback for demo
      showAlert('Registration simulated successfully! Please login.', 'Registration Successful');
      setShowRegisterModal(false);
      setShowLoginModal(true);
    }
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    showConfirm('Are you sure you want to logout?', 'Logout', () => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      setCurrentUser(null);
      setCart([]);
      showAlert('Logged out successfully', 'Success');
    });
  };

  // Add to cart
  const addToCart = (productName, price) => {
    if (!currentUser) {
      showAlert('Please login to add items to cart!', 'Login Required');
      setShowLoginModal(true);
      return;
    }

    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
      setCart(cart.map(item => 
        item.name === productName 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        name: productName, 
        price: price, 
        quantity: 1 
      }]);
    }

    showAlert(productName + ' added to cart!', 'Added to Cart');
  };

  // Update cart quantity
  const updateCartQuantity = (index, newQuantity) => {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }
    setCart(cart.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item));
  };

  // Remove from cart
  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Handle cart click
  const handleCartClick = () => {
    if (!currentUser) {
      showAlert('Please login to view your cart!', 'Login Required');
      setShowLoginModal(true);
      return;
    }
    setShowCartModal(true);
  };

  // Handle checkout
  const handleCheckout = async (customerData) => {
    try {
      // Only allow order if user is a real MongoDB user (24 hex chars)
      const userId = currentUser?.id;
      if (!userId || typeof userId !== 'string' || !/^[a-fA-F0-9]{24}$/.test(userId)) {
        showAlert('You must be logged in with a real account to place an order.', 'Order Failed');
        return;
      }
      const orderData = {
        customer: customerData,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        user: userId
      };

      await createOrder(orderData);
      setCart([]);
      showAlert('Order placed successfully! Thank you for your purchase.', 'Order Confirmed');
      setShowCheckoutModal(false);
      loadOrders(userId);
    } catch (error) {
      showAlert('Order could not be placed. Please try again later.', 'Order Failed');
      setShowCheckoutModal(false);
    }
  };

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Ref for orders section
  const ordersSectionRef = React.useRef(null);

  // Scroll to orders section
  const handleOrdersClick = () => {
    if (ordersSectionRef.current) {
      ordersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      <Header />
      <Navigation 
        currentUser={currentUser}
        totalItems={totalItems}
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
        onLogout={handleLogout}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
      />
      <Hero />
      <Menu products={products} onOrderClick={addToCart} />
      {/* Order History Section */}
      {currentUser && (
        <section ref={ordersSectionRef} className="content-section" style={{ background: '#f9fafb', padding: '2rem 0' }}>
          <div className="container">
            <h2 className="section-title">Your Orders</h2>
            {orders.length === 0 ? (
              <p>You have not placed any orders yet.</p>
            ) : (
              <div className="order-history">
                {orders.map((order, idx) => (
                  <div key={order.orderId || order._id || idx} className="order-card" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1rem', padding: '1rem', background: '#fff' }}>
                    <div><strong>Order ID:</strong> {order.orderId || order._id || 'N/A'}</div>
                    <div><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                    <div><strong>Total:</strong> ₱{order.total}</div>
                    <div><strong>Items:</strong>
                      <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                        {order.items.map((item, i) => (
                          <li key={i}>{item.name} x {item.quantity} (₱{item.price} each)</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <About />
      <Contact />
      <Footer />

      {/* Alert Modal comes before Login Modal if both are active */}
      {showAlertModal && (
        <AlertModal 
          title={alertData.title}
          message={alertData.message}
          onClose={() => setShowAlertModal(false)}
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal 
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={() => {
            if (confirmData.onConfirm) confirmData.onConfirm();
            setShowConfirmModal(false);
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Login Modal, only show if alert is not active */}
      {showLoginModal && !showAlertModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <CartModal 
          cart={cart}
          onClose={() => setShowCartModal(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onCheckout={() => {
            if (cart.length === 0) {
              setShowCartModal(false);
              setTimeout(() => {
                showAlert('Your cart is empty!', 'Empty Cart');
              }, 100);
              return;
            }
            setShowCartModal(false);
            setShowCheckoutModal(true);
          }}
        />
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal 
          total={totalPrice}
          onClose={() => setShowCheckoutModal(false)}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}

export default App;