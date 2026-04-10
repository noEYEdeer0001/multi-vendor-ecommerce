const API_BASE = 'https://multi-vendor-ecommerce-qr2y.onrender.com/api';

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentRole = localStorage.getItem('userRole') || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ================= TOAST =================
function showToast(msg) {
alert(msg); // simple for now
}

// ================= API =================
async function apiRequest(endpoint, options = {}) {
const token = localStorage.getItem('token');

const config = {
headers: {
'Content-Type': 'application/json',
...(token && { Authorization: `Bearer ${token}` })
},
...options
};

const res = await fetch(`${API_BASE}${endpoint}`, config);
return await res.json();
}

// ================= NAVBAR =================
function updateNavbar() {
const auth = document.getElementById('auth-section');
const user = document.getElementById('user-section');

if (currentUser) {
auth?.classList.add('hidden');
user?.classList.remove('hidden');

```
document.getElementById('user-name').textContent = currentUser.name;
document.getElementById('user-role').textContent = currentRole;
```

} else {
auth?.classList.remove('hidden');
user?.classList.add('hidden');
}
}

// ================= PRODUCTS =================
async function loadProducts(filters = {}) {
const container = document.getElementById('products-container');
container.innerHTML = 'Loading...';

const params = new URLSearchParams(filters);
const data = await apiRequest(`/products?${params}`);

if (!data.products || data.products.length === 0) {
container.innerHTML = `<h2>No products found 😔</h2>`;
return;
}

container.innerHTML = data.products.map(p => `     <div class="product-card">       <img src="${p.image}" class="product-image">       <div class="product-info">         <h3>${p.name}</h3>         <p>₹${p.price}</p>         <button onclick="addToCart('${p._id}','${p.name}',${p.price})">Add</button>       </div>     </div>
  `).join('');
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
const item = cart.find(i => i.id === id);

if (item) {
item.qty += 1;
} else {
cart.push({ id, name, price, qty: 1 });
}

localStorage.setItem('cart', JSON.stringify(cart));
showToast('Added to cart');
}

// ================= LOGIN =================
async function loginUser(data) {
const res = await apiRequest('/auth/login', {
method: 'POST',
body: JSON.stringify(data)
});

localStorage.setItem('token', res.token);
localStorage.setItem('user', JSON.stringify(res.user));
localStorage.setItem('userRole', res.user.role);

currentUser = res.user;
currentRole = res.user.role;

updateNavbar();
showToast('Login success');
}

// ================= REGISTER =================
async function registerUser(data) {
const res = await apiRequest('/auth/register', {
method: 'POST',
body: JSON.stringify(data)
});

localStorage.setItem('token', res.token);
currentUser = res.user;
currentRole = res.user.role;

updateNavbar();
showToast('Registered');
}

// ================= ADD PRODUCT =================
async function addProduct() {
if (currentRole !== 'shopOwner') {
return showToast('Only shopOwner can add products');
}

const form = document.getElementById('add-product-form');

const data = {
name: document.getElementById('product-name').value,
price: document.getElementById('product-price').value,
category: document.getElementById('product-category').value,
image: document.getElementById('product-image').value
};

await apiRequest('/products', {
method: 'POST',
body: JSON.stringify(data)
});

showToast('Product added');
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
