// State
let products = [];
let orders = [];
let productCounter = 0;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminScreen = document.getElementById('adminScreen');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const orderForm = document.getElementById('orderForm');
const customerEmail = document.getElementById('customerEmail');
const productsList = document.getElementById('productsList');
const addProductBtn = document.getElementById('addProductBtn');
const totalAmount = document.getElementById('totalAmount');
const tierDisplay = document.getElementById('tierDisplay');
const createOrderBtn = document.getElementById('createOrderBtn');
const orderResult = document.getElementById('orderResult');
const refreshOrders = document.getElementById('refreshOrders');
const ordersTable = document.getElementById('ordersTable');
const toggleProducts = document.getElementById('toggleProducts');
const productsManagement = document.getElementById('productsManagement');
const productsCatalog = document.getElementById('productsCatalog');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  setupEventListeners();
});

// Check authentication status
async function checkAuth() {
  try {
    const response = await fetch('/api/admin/check');
    const data = await response.json();
    
    if (data.isAuthenticated) {
      showAdminScreen();
    } else {
      showLoginScreen();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showLoginScreen();
  }
}

// Setup event listeners
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  orderForm.addEventListener('submit', handleCreateOrder);
  addProductBtn.addEventListener('click', addProductRow);
  refreshOrders.addEventListener('click', loadOrders);
  toggleProducts.addEventListener('click', toggleProductsCatalog);
}

// Login
async function handleLogin(e) {
  e.preventDefault();
  loginError.textContent = '';
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput.value })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAdminScreen();
    } else {
      loginError.textContent = data.error || 'Invalid password';
      passwordInput.value = '';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = 'Login failed. Please try again.';
  }
}

// Logout
async function handleLogout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
    showLoginScreen();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Show screens
function showLoginScreen() {
  loginScreen.classList.remove('hidden');
  adminScreen.classList.add('hidden');
  passwordInput.value = '';
  loginError.textContent = '';
}

async function showAdminScreen() {
  loginScreen.classList.add('hidden');
  adminScreen.classList.remove('hidden');
  
  // Load initial data
  await loadProducts();
  await loadOrders();
  addProductRow(); // Add first product row
}

// Load products from server
async function loadProducts() {
  try {
    const response = await fetch('/api/admin/products');
    if (response.ok) {
      products = await response.json();
      renderProductsCatalog();
    }
  } catch (error) {
    console.error('Load products error:', error);
  }
}

// Add product row to order form
function addProductRow() {
  productCounter++;
  const row = document.createElement('div');
  row.className = 'product-row';
  row.id = `product-row-${productCounter}`;
  
  row.innerHTML = `
    <select class="product-select" data-row="${productCounter}" required>
      <option value="">Select Product...</option>
      ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.category} - ${p.name} - ₹${p.price}</option>`).join('')}
    </select>
    <input type="number" class="quantity-input" data-row="${productCounter}" min="1" value="1" required placeholder="Qty">
    <button type="button" class="remove-btn" data-row="${productCounter}">Remove</button>
  `;
  
  productsList.appendChild(row);
  
  // Add event listeners
  row.querySelector('.product-select').addEventListener('change', calculateTotal);
  row.querySelector('.quantity-input').addEventListener('input', calculateTotal);
  row.querySelector('.remove-btn').addEventListener('click', () => removeProductRow(productCounter));
}

// Remove product row
function removeProductRow(rowId) {
  const row = document.getElementById(`product-row-${rowId}`);
  if (row && productsList.children.length > 1) {
    row.remove();
    calculateTotal();
  }
}

// Calculate order total and tier
function calculateTotal() {
  let total = 0;
  
  const rows = productsList.querySelectorAll('.product-row');
  rows.forEach(row => {
    const select = row.querySelector('.product-select');
    const quantity = row.querySelector('.quantity-input');
    
    if (select.value && quantity.value) {
      const price = parseFloat(select.selectedOptions[0]?.dataset.price || 0);
      const qty = parseInt(quantity.value || 0);
      total += price * qty;
    }
  });
  
  totalAmount.textContent = `₹${total.toFixed(2)}`;
  
  // Determine tier
  let tier = { name: 'None', emoji: '', class: '' };
  if (total >= 100 && total < 300) {
    tier = { name: 'Bronze', emoji: '🥉', class: 'tier-bronze' };
  } else if (total >= 300 && total < 500) {
    tier = { name: 'Silver', emoji: '🥈', class: 'tier-silver' };
  } else if (total >= 500) {
    tier = { name: 'Gold', emoji: '🥇', class: 'tier-gold' };
  }
  
  tierDisplay.textContent = tier.name !== 'None' ? `${tier.emoji} ${tier.name}` : '-';
  tierDisplay.className = `tier-badge ${tier.class}`;
}

// Create order
async function handleCreateOrder(e) {
  e.preventDefault();
  orderResult.classList.add('hidden');
  createOrderBtn.disabled = true;
  createOrderBtn.textContent = 'Creating...';
  
  try {
    // Collect product items
    const items = [];
    const rows = productsList.querySelectorAll('.product-row');
    
    rows.forEach(row => {
      const select = row.querySelector('.product-select');
      const quantity = row.querySelector('.quantity-input');
      
      if (select.value && quantity.value) {
        items.push({
          product_id: parseInt(select.value),
          quantity: parseInt(quantity.value)
        });
      }
    });
    
    if (items.length === 0) {
      throw new Error('Please add at least one product');
    }
    
    const response = await fetch('/api/admin/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail.value.trim().toLowerCase(),
        items
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showOrderSuccess(data);
      orderForm.reset();
      productsList.innerHTML = '';
      addProductRow();
      calculateTotal();
      await loadOrders();
    } else {
      showOrderError(data.error || 'Failed to create order');
    }
  } catch (error) {
    console.error('Create order error:', error);
    showOrderError(error.message || 'Failed to create order');
  } finally {
    createOrderBtn.disabled = false;
    createOrderBtn.textContent = 'Create Order';
  }
}

// Show order success
function showOrderSuccess(data) {
  orderResult.className = 'result success';
  orderResult.innerHTML = `
    <h3>✅ Order Created Successfully!</h3>
    <div class="order-id">${data.orderId}</div>
    <div>
      <strong>Amount:</strong> ₹${data.amount.toFixed(2)}<br>
      <strong>Tier:</strong> ${data.tier.emoji} ${data.tier.name} (${data.tier.range})<br>
      <strong>Eligible:</strong> ${data.isEligible ? '✅ Yes' : '❌ No'}
    </div>
    <div class="message">
      📢 Tell customer: <strong>"Your Order ID is ${data.orderId}"</strong>
    </div>
  `;
  orderResult.classList.remove('hidden');
  
  // Scroll to result
  orderResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show order error
function showOrderError(message) {
  orderResult.className = 'result error';
  orderResult.innerHTML = `
    <h3>❌ Error</h3>
    <p>${message}</p>
  `;
  orderResult.classList.remove('hidden');
}

// Load recent orders
async function loadOrders() {
  try {
    const response = await fetch('/api/admin/orders?limit=20');
    if (response.ok) {
      orders = await response.json();
      renderOrders();
    }
  } catch (error) {
    console.error('Load orders error:', error);
  }
}

// Render orders table
function renderOrders() {
  if (orders.length === 0) {
    ordersTable.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No orders yet</p>';
    return;
  }
  
  ordersTable.innerHTML = `
    <div class="orders-grid">
      ${orders.map(order => {
        const date = new Date(order.created_at);
        const tierClass = order.amount >= 500 ? 'tier-gold' : order.amount >= 300 ? 'tier-silver' : 'tier-bronze';
        const tierEmoji = order.amount >= 500 ? '🥇' : order.amount >= 300 ? '🥈' : '🥉';
        
        return `
          <div class="order-item">
            <div class="order-id">${order.order_id}</div>
            <div class="email">${order.email}</div>
            <div class="amount">₹${parseFloat(order.amount).toFixed(2)}</div>
            <div class="tier-badge ${tierClass}">${tierEmoji}</div>
            <div class="status ${order.used_for_scratch ? 'used' : 'available'}">
              ${order.used_for_scratch ? 'Used' : 'Available'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Toggle products catalog
function toggleProductsCatalog() {
  productsManagement.classList.toggle('hidden');
}

// Render products catalog
function renderProductsCatalog() {
  if (products.length === 0) {
    productsCatalog.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No products available</p>';
    return;
  }
  
  // Group by category
  const grouped = products.reduce((acc, product) => {
    const cat = product.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});
  
  productsCatalog.innerHTML = Object.entries(grouped).map(([category, items]) => `
    <h4 style="margin-top: 20px; color: #667eea;">${category}</h4>
    <div class="products-grid">
      ${items.map(product => `
        <div class="product-card">
          <h4>${product.name}</h4>
          <div class="price">₹${parseFloat(product.price).toFixed(2)}</div>
          <span class="category">${product.category || 'Other'}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}
