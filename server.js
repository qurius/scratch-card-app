const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration from environment variables
const PORT = process.env.PORT || 3000;
const MIN_PURCHASE_AMOUNT = parseInt(process.env.MIN_PURCHASE_AMOUNT) || 500;
const SCRATCH_THRESHOLD = parseInt(process.env.SCRATCH_THRESHOLD) || 50;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-key';

// Store info
const STORE_INFO = {
  name: process.env.STORE_NAME || 'OneCard Diwali Dhamaka',
  tagline: process.env.STORE_TAGLINE || 'शुभ दीपावली!',
  description: process.env.STORE_DESCRIPTION || 'Shop for Rangoli, Diyas, Scented Candles & More!'
};

// Parse prize tiers from JSON
let PRIZE_TIERS;
try {
  PRIZE_TIERS = JSON.parse(process.env.PRIZE_TIERS || '[]');
  if (PRIZE_TIERS.length === 0) {
    // Default tiers if not configured (MARGIN PROTECTED - cheapest prizes have highest weight)
    PRIZE_TIERS = [
      {
        min: 100,
        max: 299,
        name: 'Bronze',
        prizes: [
          { name: '1 Tealight Candle', items: [{ name: 'Tealight Candle', quantity: 1 }], weight: 50 },
          { name: '3 Tealight Candles', items: [{ name: 'Tealight Candle', quantity: 3 }], weight: 30 },
          { name: '4 Tealight Candles', items: [{ name: 'Tealight Candle', quantity: 4 }], weight: 15 },
          { name: '5 Tealight Candles', items: [{ name: 'Tealight Candle', quantity: 5 }], weight: 5 }
        ]
      },
      {
        min: 300,
        max: 499,
        name: 'Silver',
        prizes: [
          { name: '1 Heart + 2 Tealights', items: [{ name: 'Heart Tealight Candle', quantity: 1 }, { name: 'Tealight Candle', quantity: 2 }], weight: 45 },
          { name: '1 Heart + 3 Tealights', items: [{ name: 'Heart Tealight Candle', quantity: 1 }, { name: 'Tealight Candle', quantity: 3 }], weight: 30 },
          { name: '2 Hearts + 2 Tealights', items: [{ name: 'Heart Tealight Candle', quantity: 2 }, { name: 'Tealight Candle', quantity: 2 }], weight: 20 },
          { name: '2 Heart Candles', items: [{ name: 'Heart Tealight Candle', quantity: 2 }], weight: 5 }
        ]
      },
      {
        min: 500,
        max: 1000,
        name: 'Gold',
        prizes: [
          { name: '1 Damru + 3 Hearts', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 3 }], weight: 40 },
          { name: '1 Damru + 3 Hearts + 2 Tealights', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 3 }, { name: 'Tealight Candle', quantity: 2 }], weight: 30 },
          { name: '1 Damru + 4 Hearts', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 4 }], weight: 20 },
          { name: '1 Damru + 5 Hearts', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 5 }], weight: 8 },
          { name: '2 Damru + 2 Hearts', items: [{ name: 'Damru Candle', quantity: 2 }, { name: 'Heart Tealight Candle', quantity: 2 }], weight: 2 }
        ]
      }
    ];
  }
} catch (err) {
  console.error('Error parsing PRIZE_TIERS from .env:', err);
  // Use default tiers
  PRIZE_TIERS = [
    {
      min: 100,
      max: 299,
      name: 'Bronze',
      prizes: [
        { name: '1 Tealight Candle', items: [{ name: 'Tealight Candle', quantity: 1 }], weight: 50 },
        { name: '3 Tealight Candles', items: [{ name: 'Tealight Candle', quantity: 3 }], weight: 30 },
        { name: '4 Tealight Candles', items: [{ name: 'Tealight Candle', quantity: 4 }], weight: 15 },
        { name: '5 Tealight Candles', items: [{ name: 'Tealight Candle', quantity: 5 }], weight: 5 }
      ]
    },
    {
      min: 300,
      max: 499,
      name: 'Silver',
      prizes: [
        { name: '1 Heart + 2 Tealights', items: [{ name: 'Heart Tealight Candle', quantity: 1 }, { name: 'Tealight Candle', quantity: 2 }], weight: 45 },
        { name: '1 Heart + 3 Tealights', items: [{ name: 'Heart Tealight Candle', quantity: 1 }, { name: 'Tealight Candle', quantity: 3 }], weight: 30 },
        { name: '2 Hearts + 2 Tealights', items: [{ name: 'Heart Tealight Candle', quantity: 2 }, { name: 'Tealight Candle', quantity: 2 }], weight: 20 },
        { name: '2 Heart Candles', items: [{ name: 'Heart Tealight Candle', quantity: 2 }], weight: 5 }
      ]
    },
    {
      min: 500,
      max: 1000,
      name: 'Gold',
      prizes: [
        { name: '1 Damru + 3 Hearts', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 3 }], weight: 40 },
        { name: '1 Damru + 3 Hearts + 2 Tealights', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 3 }, { name: 'Tealight Candle', quantity: 2 }], weight: 30 },
        { name: '1 Damru + 4 Hearts', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 4 }], weight: 20 },
        { name: '1 Damru + 5 Hearts', items: [{ name: 'Damru Candle', quantity: 1 }, { name: 'Heart Tealight Candle', quantity: 5 }], weight: 8 },
        { name: '2 Damru + 2 Hearts', items: [{ name: 'Damru Candle', quantity: 2 }, { name: 'Heart Tealight Candle', quantity: 2 }], weight: 2 }
      ]
    }
  ];
}

// Log loaded prize tiers at startup
console.log('\n🎁 Prize Tiers Configuration:');
PRIZE_TIERS.forEach(tier => {
  console.log(`  ${tier.name}: ₹${tier.min}-₹${tier.max} (${tier.prizes.length} prizes)`);
});
console.log('');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_POSTGRESDB_HOST || 'localhost',
  port: process.env.DB_POSTGRESDB_PORT || 5432,
  database: process.env.DB_POSTGRESDB_DATABASE || 'scratch_card_db',
  user: process.env.DB_POSTGRESDB_USER || 'postgres',
  password: process.env.DB_POSTGRESDB_PASSWORD || 'postgres',
});

console.log(process.env);

// Create tables
const initDatabase = async () => {
  try {
    // Orders table - stores purchase information
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        items JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_eligible BOOLEAN DEFAULT FALSE,
        used_for_scratch BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Plays table - now linked to orders with prize details and tier
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plays (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        order_id TEXT NOT NULL,
        email TEXT NOT NULL,
        prize TEXT NOT NULL,
        prize_details JSONB,
        tier TEXT,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
      )
    `);

    // Products table - catalog with prices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category TEXT,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default products if table is empty
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await pool.query(`
          INSERT INTO products (name, price, category) 
          VALUES('Modak', 60, 'Candle'),
          ('Motichoor', 60, 'Candle'),
          ('Urli', 290, 'Candle'),
          ('Floating Daisy', 45, 'Candle'),
          ('Floating Daisy Stick', 60, 'Candle'),
          ('Tlight Candle Set', 95, 'Candle'),
          ('Heart Shape Tlight', 35, 'Candle'),
          ('Tablet', 110, 'Candle'),
          ('Tulip', 180, 'Candle'),
          ('Heart', 200, 'Candle'),
          ('Holding Hand', 200, 'Candle'),
          ('Couple', 130, 'Candle'),
          ('Bride & Groom', 200, 'Candle'),
          ('Light Weight', 80, 'Diya'),
          ('Medium Weight', 100, 'Diya'),
          ('Heavy Weight', 180, 'Diya'),
          ('Damru (set of 2)', 10, 'Diya'),
          ('Heavy Flower / Kalash', 600, 'ShubhLabh'),
          ('Lotus', 180, 'ShubhLabh'),
          ('Moti', 1000, 'Bandhanwar'),
          ('Heavy Flower', 1900, 'Bandhanwar'),
          ('Light Weight Rangoli', 1000, 'Rangoli'), 
          ('Heavy', 2400, 'Rangoli');
      `);
      console.log('✅ Default products added');
    }

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initDatabase();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate order ID from email with random 2-digit number
// Example: amit@fplabs.tech -> AMIT_47, parth@fplabs.tech -> PARTH_23
async function generateOrderId(email) {
  // Extract username from email (before @)
  const username = email.split('@')[0].toUpperCase();
  
  // Generate random 2-digit number (00-99)
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Create order ID: USERNAME_XX
  const orderId = `${username}_${randomNum}`;
  
  // Check if this order ID already exists (unlikely but possible)
  const existingOrder = await pool.query(
    'SELECT order_id FROM orders WHERE LOWER(order_id) = LOWER($1)',
    [orderId]
  );
  
  // If by chance it exists, try again with a different random number
  if (existingOrder.rows.length > 0) {
    console.log(`Order ID ${orderId} already exists, generating new one...`);
    return generateOrderId(email); // Recursive call to get a different random number
  }
  
  return orderId;
}

// Get tier based on order amount
function getTierForAmount(amount) {
  console.log('Getting tier for amount:', amount);
  console.log('Available tiers:', PRIZE_TIERS.length);
  
  if (!PRIZE_TIERS || PRIZE_TIERS.length === 0) {
    console.error('ERROR: PRIZE_TIERS is not loaded!');
    return null;
  }
  
  for (const tier of PRIZE_TIERS) {
    console.log(`Checking tier ${tier.name}: ₹${tier.min}-₹${tier.max}`);
    if (amount >= tier.min && amount <= tier.max) {
      console.log(`✅ Matched tier: ${tier.name}`);
      return tier;
    }
  }
  
  // If amount exceeds all tiers, return the highest tier
  console.log('No exact match, returning highest tier');
  return PRIZE_TIERS[PRIZE_TIERS.length - 1];
}

// Select prize from a tier using weighted random selection
function selectPrizeFromTier(tier) {
  const prizes = tier.prizes;
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) {
      return {
        name: prize.name,
        items: prize.items
      };
    }
  }
  // Fallback to last prize
  return {
    name: prizes[prizes.length - 1].name,
    items: prizes[prizes.length - 1].items
  };
}

// Select prize based on order amount (tiered system)
function selectPrize(orderAmount) {
  const tier = getTierForAmount(orderAmount);
  const prizeData = selectPrizeFromTier(tier);
  
  return {
    prize: prizeData.name,
    prizeDetails: prizeData.items,
    tier: tier.name
  };
}

// ============================================
// ADMIN AUTHENTICATION & ENDPOINTS
// ============================================

// Auth middleware for admin routes
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login.' });
}

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check admin auth status
app.get('/api/admin/check', (req, res) => {
  res.json({ isAuthenticated: !!req.session.isAdmin });
});

// Get all products (ordered by category, then name within category)
app.get('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE in_stock = true ORDER BY category ASC, name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add new product
app.post('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const { name, price, category } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *',
      [name, parseFloat(price), category || 'Other']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product
app.put('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, in_stock } = req.body;
    
    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           price = COALESCE($2, price), 
           category = COALESCE($3, category),
           in_stock = COALESCE($4, in_stock)
       WHERE id = $5 
       RETURNING *`,
      [name, price ? parseFloat(price) : null, category, in_stock, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Create order with products
app.post('/api/admin/create-order', requireAuth, async (req, res) => {
  try {
    const { email, items } = req.body;
    // items format: [{ product_id: 1, quantity: 2 }, ...]
    
    console.log('Create order request:', { email, items });
    
    if (!email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Email and items are required' });
    }
    
    // Validate email domain
    if (!email.endsWith('@fplabs.tech')) {
      return res.status(400).json({ error: 'Email must be @fplabs.tech domain' });
    }
    
    // Calculate total from products
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      console.log('Looking for product ID:', item.product_id);
      
      const product = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [item.product_id]
      );
      
      console.log('Product query result:', product.rows);
      
      if (product.rows.length === 0) {
        return res.status(400).json({ 
          error: `Product with ID ${item.product_id} not found. Please refresh the page to load latest products.` 
        });
      }
      
      const prod = product.rows[0];
      
      if (!prod.in_stock) {
        return res.status(400).json({ 
          error: `Product "${prod.name}" (ID: ${item.product_id}) is out of stock` 
        });
      }
      
      const itemTotal = parseFloat(prod.price) * parseInt(item.quantity);
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: prod.id,
        name: prod.name,
        price: parseFloat(prod.price),
        quantity: parseInt(item.quantity),
        subtotal: itemTotal
      });
    }
    
    const isEligible = totalAmount >= MIN_PURCHASE_AMOUNT;
    const orderId = await generateOrderId(email);
    
    // Insert order
    await pool.query(
      `INSERT INTO orders (order_id, email, amount, items, is_eligible, used_for_scratch)
       VALUES ($1, $2, $3, $4, $5, false)
       ON CONFLICT (order_id) DO NOTHING`,
      [orderId, email.toLowerCase(), totalAmount, JSON.stringify(orderItems), isEligible]
    );
    
    // Get tier info
    const tier = getTierForAmount(totalAmount);
    
    if (!tier) {
      console.error('ERROR: Could not determine tier for amount:', totalAmount);
      return res.status(500).json({ 
        error: 'Failed to determine prize tier. Please check server configuration.' 
      });
    }
    
    const tierEmoji = tier.name === 'Bronze' ? '🥉' : tier.name === 'Silver' ? '🥈' : '🥇';
    
    console.log(`Order created: ₹${totalAmount} → ${tier.name} tier for ${email}`);
    
    res.json({
      success: true,
      orderId,
      email: email.toLowerCase(),
      amount: totalAmount,
      items: orderItems,
      isEligible,
      tier: {
        name: tier.name,
        emoji: tierEmoji,
        range: `₹${tier.min}-₹${tier.max}`
      },
      message: isEligible
        ? `Order created! Tell customer: "Your Order ID is ${orderId}"`
        : `Order created but not eligible. Minimum ₹${MIN_PURCHASE_AMOUNT} required.`
    });
    
  } catch (err) {
    console.error('Admin create order error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: err.message 
    });
  }
});

// Get recent orders (admin)
app.get('/api/admin/orders', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      `SELECT 
        order_id, 
        email, 
        amount, 
        items,
        is_eligible, 
        used_for_scratch,
        created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ============================================
// CUSTOMER-FACING ENDPOINTS
// ============================================

// API: Validate order and check eligibility
app.post('/api/validate-order', async (req, res) => {
  try {
    const { orderId, email } = req.body;
    
    if (!orderId || !email) {
      return res.status(400).json({ error: 'Order ID and email are required' });
    }
    
    // Check if order exists (case-insensitive comparison)
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE LOWER(order_id) = LOWER($1)',
      [orderId]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.json({
        valid: false,
        message: 'Order not found. Please check your Order ID.'
      });
    }
    
    const order = orderCheck.rows[0];
    
    // Check if email matches
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return res.json({
        valid: false,
        message: 'Email does not match the order. Please verify your details.'
      });
    }
    
    // Check if amount is eligible
    if (parseFloat(order.amount) < MIN_PURCHASE_AMOUNT) {
      return res.json({
        valid: false,
        message: `Minimum purchase of ₹${MIN_PURCHASE_AMOUNT} required. Your order: ₹${order.amount}`
      });
    }
    
    // Check if already used for scratch
    if (order.used_for_scratch) {
      return res.json({
        valid: false,
        alreadyUsed: true,
        message: 'This order has already been used for scratch & win.'
      });
    }
    
    // Order is valid
    return res.json({
      valid: true,
      orderId: order.order_id,
      amount: order.amount,
      email: order.email,
      message: 'Order validated! Ready to play.'
    });
    
  } catch (err) {
    console.error('Order validation error:', err);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// API: Create/register new order (for staff/admin use)
app.post('/api/create-order', async (req, res) => {
  try {
    const { email, amount, items } = req.body;
    
    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount are required' });
    }
    
    // Validate email domain
    if (!email.endsWith('@fplabs.tech')) {
      return res.status(400).json({ error: 'Email must be @fplabs.tech domain' });
    }
    
    const purchaseAmount = parseFloat(amount);
    const isEligible = purchaseAmount >= MIN_PURCHASE_AMOUNT;
    
    // Auto-generate order ID from email
    const orderId = await generateOrderId(email);
    
    // Parse and validate items array
    let itemsData = null;
    if (items && Array.isArray(items)) {
      itemsData = items; // Already in correct format
    } else if (items && typeof items === 'string') {
      // Convert comma-separated string to structured format
      itemsData = items.split(',').map(item => {
        const trimmed = item.trim();
        return { name: trimmed, quantity: 1 };
      });
    }
    
    // Insert order
    await pool.query(
      `INSERT INTO orders (order_id, email, amount, items, is_eligible, used_for_scratch) 
       VALUES ($1, $2, $3, $4, $5, false) 
       ON CONFLICT (order_id) DO NOTHING`,
      [orderId, email.toLowerCase(), purchaseAmount, JSON.stringify(itemsData), isEligible]
    );
    
    res.json({
      success: true,
      orderId,
      amount: purchaseAmount,
      isEligible,
      items: itemsData,
      message: isEligible 
        ? `Order created! Tell customer: "Your Order ID is ${orderId}"` 
        : `Order created but not eligible. Minimum ₹${MIN_PURCHASE_AMOUNT} required.`
    });
    
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// API: Get configuration (for frontend)
app.get('/api/config', (req, res) => {
  res.json({
    minPurchaseAmount: MIN_PURCHASE_AMOUNT,
    scratchThreshold: SCRATCH_THRESHOLD,
    storeInfo: STORE_INFO
  });
});

// API: Get or create user session
app.post('/api/session', async (req, res) => {
  try {
    let { userId, email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if email already exists
    const emailCheck = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    
    if (emailCheck.rows.length > 0) {
      // Email exists, use that user_id
      userId = emailCheck.rows[0].user_id;
    } else if (!userId) {
      // New user
      userId = uuidv4();
      await pool.query(
        'INSERT INTO users (user_id, email) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
        [userId, email]
      );
    }
    
    // Check if user has already played
    const playCheck = await pool.query('SELECT * FROM plays WHERE user_id = $1', [userId]);
    const existingPlay = playCheck.rows[0];
    
    res.json({
      userId,
      email,
      hasPlayed: !!existingPlay,
      prize: existingPlay ? existingPlay.prize : null
    });
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Scratch and reveal prize
app.post('/api/scratch', async (req, res) => {
  try {
    const { userId, email, orderId } = req.body;
    
    if (!userId || !orderId) {
      return res.status(400).json({ error: 'User ID and Order ID required' });
    }
    
    // Check if order already used (case-insensitive comparison)
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE LOWER(order_id) = LOWER($1)',
      [orderId]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid order' });
    }
    
    const order = orderCheck.rows[0];
    
    if (order.used_for_scratch) {
      // Get existing prize for this order (case-insensitive)
      const playCheck = await pool.query(
        'SELECT * FROM plays WHERE LOWER(order_id) = LOWER($1)',
        [orderId]
      );
      const existingPlay = playCheck.rows[0];
      return res.json({
        alreadyPlayed: true,
        prize: existingPlay?.prize || 'Unknown',
        prizeDetails: existingPlay?.prize_details || [],
        tier: existingPlay?.tier || 'Unknown'
      });
    }
    
    // Select prize based on order amount
    const prizeResult = selectPrize(parseFloat(order.amount));
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert play record with prize details and tier (use actual order_id from DB)
      await client.query(
        'INSERT INTO plays (user_id, order_id, email, prize, prize_details, tier) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, order.order_id, email || order.email, prizeResult.prize, JSON.stringify(prizeResult.prizeDetails), prizeResult.tier]
      );
      
      // Mark order as used (case-insensitive)
      await client.query(
        'UPDATE orders SET used_for_scratch = true WHERE LOWER(order_id) = LOWER($1)',
        [orderId]
      );
      
      await client.query('COMMIT');
      
      res.json({
        alreadyPlayed: false,
        prize: prizeResult.prize,
        prizeDetails: prizeResult.prizeDetails,
        tier: prizeResult.tier
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('Scratch error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to save prize',
      details: err.message 
    });
  }
});

// API: Get statistics (optional)
app.get('/api/stats', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM plays');
    const distributionResult = await pool.query(
      'SELECT prize, COUNT(*) as count FROM plays GROUP BY prize'
    );
    
    res.json({
      totalPlays: parseInt(totalResult.rows[0].count),
      distribution: distributionResult.rows
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get sales statistics with product breakdown
app.get('/api/sales-stats', async (req, res) => {
  try {
    // Total sales
    const totalSales = await pool.query(
      'SELECT COUNT(*) as total_orders, SUM(amount) as total_revenue FROM orders'
    );
    
    // Eligible vs ineligible
    const eligibilityStats = await pool.query(`
      SELECT 
        is_eligible,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM orders
      GROUP BY is_eligible
    `);
    
    // Product breakdown - aggregate items from JSONB
    const productStats = await pool.query(`
      SELECT 
        item->>'name' as product_name,
        SUM((item->>'quantity')::int) as total_quantity,
        COUNT(*) as orders_containing
      FROM orders,
      jsonb_array_elements(items) as item
      WHERE items IS NOT NULL
      GROUP BY item->>'name'
      ORDER BY total_quantity DESC
    `);
    
    // Daily sales
    const dailySales = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(amount) as revenue
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    
    res.json({
      totalOrders: parseInt(totalSales.rows[0].total_orders),
      totalRevenue: parseFloat(totalSales.rows[0].total_revenue || 0),
      eligibilityBreakdown: eligibilityStats.rows,
      productBreakdown: productStats.rows,
      dailySales: dailySales.rows
    });
  } catch (err) {
    console.error('Sales stats error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`🪔 Diwali Dhamaka server running at http://localhost:${PORT}`);
  console.log(`शुभ दीपावली! Happy Diwali! 🎆`);
});
