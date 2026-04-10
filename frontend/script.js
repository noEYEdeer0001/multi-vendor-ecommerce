// ✅ FINAL CLEAN WORKING SCRIPT.JS

const API_BASE = 'https://multi-vendor-ecommerce-qr2y.onrender.com/api';

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentRole = localStorage.getItem('userRole') || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const DEBOUNCE_DELAY = 300;
let debounceTimer;

// ================= TOAST =================
function showToast(message, type = 'success') {
const toast = document.createElement('div');
toast.className = `toast toast-${type}`;
toast.textContent = message;
document.body.appendChild(toast);

setTimeout(() => toast.classList.add('show'), 100);
setTimeout(() => {
toast.remove();
}, 3000);
}

// ================= DEBOUNCE =================
function debounce(func, delay) {
return function (...args) {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => func.apply(this, args), delay);
};
}

// ================= API =================
async function apiRequest(endpoint, options = {}) {
let retries = 3;

while (retries--) {
try {
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

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) throw new Error('Request failed');

  return await res.json();
} catch (err) {
  if (retries === 0) {
    showToast('Server waking up... ⏳', 'error');
    throw err;
  }
  await new Promise(r => setTimeout(r, 2000));
}


}
}

// ================= NAVBAR =================
function updateNavbar() {
const auth = document.getElementById('auth-section');
const user = document.getElementById('user-section');

if (currentUser) {
auth?.classList.add('hidden');
user?.classList.remove('hidden');


document.getElementById('user-name').textContent = currentUser.name;
document.getElementById('user-role').textContent = currentRole;


} else {
auth?.classList.remove('hidden');
user?.classList.add('hidden');
}
}

// ================= PRODUCTS =================
async function loadProducts(filters = {}) {
const container = document.getElementById('products-container');
if (!container) return;

container.innerHTML = `<p>Loading...</p>`;

try {
const params = new URLSearchParams(filters);
const { products } = await apiRequest(`/products?${params}`);


if (!products.length) {
  container.innerHTML = `
    <div class="empty-state">
      <h2>No products found 😔</h2>
    </div>
  `;
  return;
}

container.innerHTML = products.map(p => `
  <div class="product-card">
    <img src="${p.image}" class="product-image">
    <div class="product-info">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart('${p._id}','${p.name}',${p.price})">Add</button>
    </div>
  </div>
`).join('');


} catch {
container.innerHTML = `<p>Server waking up...</p>`;
}
}

// ================= FILTER =================
function applyFilters() {
const filters = {
search: document.getElementById('search-input')?.value || '',
category: document.getElementById('category-filter')?.value || ''
};

loadProducts(filters);
}

// ================= CART =================
function addToCart(id, name, price) {
cart.push({ id, name, price });
localStorage.setItem('cart', JSON.stringify(cart));
showToast('Added to cart');
}

// ================= AUTH =================
async function loginUser(data) {
const res = await apiRequest('/auth/login', {
method: 'POST',
body: JSON.stringify(data)
});

localStorage.setItem('token', res.token);
currentUser = res.user;
currentRole = res.user.role;

localStorage.setItem('user', JSON.stringify(res.user));
localStorage.setItem('userRole', res.user.role);

updateNavbar();
showToast('Login success');
}

async function registerUser(data) {
const res = await apiRequest('/auth/register', {
method: 'POST',
body: JSON.stringify(data)
});

localStorage.setItem('token', res.token);
currentUser = res.user;
currentRole = res.user.role;

updateNavbar();
showToast('Registered!');
}

// ================= ADD PRODUCT =================
async function addProduct() {
if (currentRole !== 'shopOwner') {
return showToast('Only shopOwner allowed', 'error');
}

const form = document.getElementById('add-product-form');

const data = {
name: form.querySelector('#product-name').value,
price: form.querySelector('#product-price').value,
category: form.querySelector('#product-category').value,
image: form.querySelector('#product-image').value
};

await apiRequest('/products', {
method: 'POST',
body: JSON.stringify(data)
});

showToast('Product added!');
loadProducts();
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
updateNavbar();
loadProducts();

document.getElementById('login-form')?.addEventListener('submit', e => {
e.preventDefault();
loginUser({
email: document.getElementById('login-email').value,
password: document.getElementById('login-password').value
});
});

document.getElementById('register-form')?.addEventListener('submit', e => {
e.preventDefault();
registerUser({
name: document.getElementById('reg-name').value,
email: document.getElementById('reg-email').value,
password: document.getElementById('reg-password').value,
role: document.getElementById('reg-role').value
});
});

document.getElementById('add-product-btn')?.addEventListener('click', addProduct);
});
