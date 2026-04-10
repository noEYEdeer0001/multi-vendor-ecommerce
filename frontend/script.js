// Frontend JavaScript - API utils, localStorage, UI logic

const API_BASE = 'https://multi-vendor-ecommerce-qr2y.onrender.com/api';
let currentUser = null;
let currentRole = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Loading spinner
function showLoading(element) {
  element.innerHTML = '<div class="loading"></div>';
}

// API fetch wrapper
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

// Auth functions
async function registerUser(formData) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  localStorage.setItem('token', data.token);
  currentUser = data.user;
  currentRole = data.user.role;
  showToast('Registration successful!');
  loadDashboard();
}

async function loginUser(formData) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  localStorage.setItem('token', data.token);
  currentUser = data.user;
  currentRole = data.user.role;
  showToast('Login successful!');
  loadDashboard();
}

function logoutUser() {
  localStorage.removeItem('token');
  currentUser = null;
  currentRole = null;
  cart = [];
  wishlist = [];
  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  showToast('Logged out successfully!');
  showPage('home');
}

// Load current user on startup
async function loadUser() {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      currentUser = { name: 'User', role: 'user' }; // Temp - add /auth/profile endpoint later
      currentRole = localStorage.getItem('userRole') || 'user';
      updateNavbar();
    }
  } catch (error) {
    localStorage.removeItem('token');
  }
}

// Dark mode toggle
function toggleDarkMode() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
}

// Mobile menu
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}


// Update navbar based on auth state
function updateNavbar() {
  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');

  if (currentUser) {
    if (authSection) authSection.style.display = 'none';
    if (userSection) userSection.style.display = 'flex';
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = currentRole.toUpperCase();
  } else {
    if (authSection) authSection.style.display = 'flex';
    if (userSection) userSection.style.display = 'none';
  }
}

// Page navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.add('fade-out');
    setTimeout(() => p.classList.add('hidden'), 300);
  });
  setTimeout(() => {
    document.getElementById(`${page}-page`).classList.remove('hidden', 'fade-out');
    document.getElementById(`${page}-page`).style.animation = 'fadeIn 0.5s ease';
    window.scrollTo(0, 0);
  }, 300);
}


// Load products
async function loadProducts(filters = {}) {
  const productsContainer = document.getElementById('products-container');
  const skeleton = document.getElementById('skeleton-products');
  if (!productsContainer || !skeleton) return;
  skeleton.style.display = 'grid';
  showSkeletonLoaders();
  
  try {
    const params = new URLSearchParams(filters);
    const { products } = await apiRequest(`/products?${params}`);
    
    skeleton.style.display = 'none';
    productsContainer.innerHTML = '';
    
    products.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.animationDelay = `${index * 0.1}s`;
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">$${product.price}</div>
          <div class="product-category">${product.category}</div>
          <div class="product-shop">by ${product.shopOwnerId.name}</div>
          <div class="product-actions">
            <button class="btn btn-primary btn-small" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">Add to Cart</button>
            <button class="btn btn-secondary btn-small" onclick="toggleWishlist('${product._id}')">♥</button>
          </div>
        </div>
      `;
      productsContainer.appendChild(card);
    });
  } catch (error) {
    skeleton.style.display = 'none';
    productsContainer.innerHTML = '<div style="text-align:center; padding: 4rem; color: var(--text-secondary);"><h2>No products found 😔</h2><p>Try adjusting your search or filters</p></div>';
  }
}

function showSkeletonLoaders() {
  const skeletonContainer = document.getElementById('skeleton-products');
  skeletonContainer.innerHTML = `
    <div class="skeleton skeleton-product"></div>
    <div class="skeleton skeleton-product"></div>
    <div class="skeleton skeleton-product"></div>
    <div class="skeleton skeleton-product"></div>
    <div class="skeleton skeleton-product"></div>
    <div class="skeleton skeleton-product"></div>
  `;
}


// Cart functions
function addToCart(productId, name, price) {
  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex > -1) {
    cart[itemIndex].quantity += 1;
  } else {
    cart.push({ productId, name, price, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast('Added to cart!');
  updateCartCount();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = totalItems;
}

function loadCart() {
  const cartContainer = document.getElementById('cart-items');
  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <h4>${item.name}</h4>
      <div>$${item.price} x <input type="number" value="${item.quantity}" min="1" onchange="updateCartItem('${item.productId}', this.value)" class="qty-input"></div>
      <div>$${ (item.price * item.quantity).toFixed(2) }</div>
      <button class="btn btn-danger btn-small" onclick="removeFromCart('${item.productId}')">Remove</button>
    </div>
  `).join('') || '<p>Cart is empty</p>';
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

function updateCartItem(productId, quantity) {
  const itemIndex = cart.findIndex(item => item.productId === productId);
  cart[itemIndex].quantity = parseInt(quantity);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
  showToast('Removed from cart');
}

async function checkout() {
  if (cart.length === 0) return showToast('Cart is empty', 'error');
  
  const orderData = {
    products: cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })),
    totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  try {
    await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    cart = [];
    localStorage.setItem('cart', '[]');
    showToast('Order placed successfully!');
    loadCart();
    updateCartCount();
  } catch (error) {
    // error handled in apiRequest
  }
}

// Wishlist functions
async function toggleWishlist(productId) {
  try {
    const { wishlist: current } = await apiRequest('/wishlist');
    const isInWishlist = current.products.some(p => p._id === productId);
    
    if (isInWishlist) {
      await apiRequest(`/wishlist/${productId}`, { method: 'DELETE' });
      showToast('Removed from wishlist');
    } else {
      await apiRequest('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      showToast('Added to wishlist');
    }
    loadWishlist();
  } catch (error) {
    // handled
  }
}

async function loadWishlist() {
  try {
    const { wishlist } = await apiRequest('/wishlist');
    const container = document.getElementById('wishlist-items');
    container.innerHTML = wishlist.products.map(product => `
      <div class="wishlist-item">
        <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
        <div>
          <h4>${product.name}</h4>
          <p>$${product.price}</p>
          <button class="btn btn-primary btn-small" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">Add to Cart</button>
          <button class="btn btn-danger btn-small" onclick="toggleWishlist('${product._id}')">Remove</button>
        </div>
      </div>
    `).join('') || '<p>Wishlist is empty</p>';
  } catch (error) {
    // handled
  }
}

// Load orders
async function loadOrders() {
  try {
    const { orders } = await apiRequest('/orders');
    const container = document.getElementById('orders-list');
    container.innerHTML = orders.map(order => `
      <div class="order-item">
        <h4>Order #${order._id.slice(-6)}</h4>
        <p>Total: $${order.totalPrice}</p>
        <span class="status ${order.status}">${order.status.toUpperCase()}</span>
        <div>${order.products.map(item => `${item.productId.name} x${item.quantity}`).join(', ')}</div>
      </div>
    `).join('');
  } catch (error) {
    // handled
  }
}

// Dashboard
async function loadDashboard() {
  if (currentRole === 'staff') {
    try {
      const { stats } = await apiRequest('/users/stats');
      document.getElementById('stat-users').textContent = stats.totalUsers;
      document.getElementById('stat-products').textContent = stats.totalProducts;
      document.getElementById('stat-orders').textContent = stats.totalOrders;
    } catch (error) {}
  } else if (currentRole === 'shopOwner') {
    // Load own products and orders
    loadOwnProducts();
    loadShopOrders();
  }
  updateNavbar();
}

// Search & filters
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  showPage('home');
  loadProducts();
  updateCartCount();
});

function applyFilters() {
  const filters = {
    search: document.getElementById('search-input').value,
    category: document.getElementById('category-filter').value,
    minPrice: document.getElementById('min-price').value,
    maxPrice: document.getElementById('max-price').value,
    sort: document.getElementById('sort-select').value
  };
  loadProducts(filters);
}
// ✅ LOGIN FORM HANDLER
document.getElementById('login-form')?.addEventListener('submit', function(e) {
  e.preventDefault(); // ❗ stop page reload

  const formData = {
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value
  };

  loginUser(formData);
});


// ✅ REGISTER FORM HANDLER
document.getElementById('register-form')?.addEventListener('submit', function(e) {
  e.preventDefault(); // ❗ stop page reload

  const formData = {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    role: document.getElementById('reg-role').value
  };

  registerUser(formData);
});


// Event listeners for filters
document.getElementById('search-btn')?.addEventListener('click', applyFilters);
document.getElementById('category-filter')?.addEventListener('change', applyFilters);
document.getElementById('min-price')?.addEventListener('input', applyFilters);
document.getElementById('max-price')?.addEventListener('input', applyFilters);
document.getElementById('sort-select')?.addEventListener('change', applyFilters);

// Page load listeners
document.getElementById('load-cart')?.addEventListener('click', loadCart);
document.getElementById('checkout-btn')?.addEventListener('click', checkout);
document.getElementById('load-wishlist')?.addEventListener('click', loadWishlist);
document.getElementById('load-orders')?.addEventListener('click', loadOrders);

