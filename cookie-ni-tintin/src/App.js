import React, { useState, useEffect } from 'react';
import './App.css';

// ============================================
// COMPONENT DEFINITIONS (Define before use)
// ============================================

// Header Component
function Header() {
  return (
    <header>
      <h1>Cookie ni Tintin</h1>
      <p>Freshly baked Cookies made with love</p>
    </header>
  );
}

// Navigation Component
function Navigation({ currentUser, totalItems, onLoginClick, onRegisterClick, onLogout, onCartClick }) {
  return (
    <nav>
      <a href="#home">Home</a>
      <a href="#menu">Menu</a>
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
  return (
    <div className="card">
      <img src={`/cookie/${product.image}`} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span className="price">₱{product.price}</span>
      <button onClick={onOrderClick}>Order Now</button>
    </div>
  );
}

// Menu Component
function Menu({ products, onOrderClick }) {
  return (
    <section id="menu">
      <main className="container">
        <h2 className="section-title">Our Menu</h2>
        <div className="products">
          {products.map((product, index) => (
            <ProductCard 
              key={index} 
              product={product} 
              onOrderClick={() => onOrderClick(product.name, product.price)} 
            />
          ))}
        </div>
      </main>
    </section>
  );
}

// About Component
function About() {
  return (
    <section id="about" className="content-section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        <div className="about-content">
          <p>Welcome to Cookie ni Tintin! We're passionate about baking the most delicious, freshly-made cookies that bring joy to every bite.</p>
          <p>Our cookies are baked daily using only the finest ingredients, ensuring that every batch is perfect. From classic chocolate chip to unique matcha flavors, we have something for everyone.</p>
          <p>Founded with love and dedication, Cookie ni Tintin has been serving the community with premium quality cookies that create sweet memories for families and friends.</p>
        </div>
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
        <div className="contact-content">
          <p><strong>Address:</strong> Quezon City, Metro Manila, Philippines</p>
          <p><strong>Phone:</strong> +63 123 456 7890</p>
          <p><strong>Email:</strong> hello@cookienitintin.com</p>
          <p><strong>Business Hours:</strong></p>
          <p>Monday - Saturday: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 6:00 PM</p>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer>
      © 2026 Cookie ni Tintin
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
        <button onClick={onClose} className="alert-btn">OK</button>
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
  const [alertData, setAlertData] = useState({ title: 'Alert', message: '' });

  // Products data
  const products = [
  { name: 'Chocolate Chip Cookies', description: 'Classic cookies with rich chocolate chips', price: 120, image: 'cookies5.jpg' },
  { name: 'Matcha Cookies', description: 'Premium green tea flavored cookies', price: 180, image: 'matcha.jpg' },
  { name: 'Double Chocolate Cookies', description: 'Extra chocolatey with cocoa and chips', price: 250, image: 'double_choco.jpg' },
  { name: 'Oatmeal Raisin Cookies', description: 'Healthy and delicious oat cookies', price: 90, image: 'oatmeal.jpg' }
];


  // Load user and cart on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (user) setCurrentUser(user);
    setCart(savedCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Custom alert function
  const showAlert = (message, title = 'Alert') => {
    setAlertData({ title, message });
    setShowAlertModal(true);
  };

  // Handle login
  const handleLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.length === 0) {
      showAlert('No users registered yet. Please register first!', 'No Users');
      setShowLoginModal(false);
      setShowRegisterModal(true);
      return;
    }
    
    const emailExists = users.find(u => u.email === email);
    if (!emailExists) {
      showAlert('Email not found! Please register first.', 'Email Not Found');
      setShowLoginModal(false);
      setShowRegisterModal(true);
      return;
    }
    
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      showAlert('Login successful! Welcome back, ' + user.username + '!', 'Login Successful');
      setShowLoginModal(false);
    } else {
      showAlert('Wrong password!', 'Error');
    }
  };

  // Handle register
  const handleRegister = (username, email, password) => {
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
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setCart([]);
    }
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
      setCart([...cart, { name: productName, price: price, quantity: 1 }]);
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
  const handleCheckout = (customerData) => {
    const orderData = {
      customer: customerData,
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      orderDate: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    setCart([]);
    showAlert('Order placed successfully! Thank you for your purchase.', 'Order Confirmed');
    setShowCheckoutModal(false);
  };

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
      />
      
      <Hero />
      <Menu products={products} onOrderClick={addToCart} />
      <About />
      <Contact />
      <Footer />

      {/* Alert Modal */}
      {showAlertModal && (
        <AlertModal 
          title={alertData.title}
          message={alertData.message}
          onClose={() => setShowAlertModal(false)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
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
              showAlert('Your cart is empty!', 'Empty Cart');
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