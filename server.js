const express = require('express');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_POSTGRESDB_HOST || 'localhost',
  port: process.env.DB_POSTGRESDB_PORT || 5432,
  database: process.env.DB_POSTGRESDB_DATABASE || 'scratch_card_db',
  user: process.env.DB_POSTGRESDB_USER || 'postgres',
  password: process.env.DB_POSTGRESDB_PASSWORD || 'postgres',
});

// Create tables
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS plays (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        prize TEXT NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initDatabase();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Diwali Prize pool
const prizes = [
  { name: '🪔 Bumper Prize: ₹10,000 Cash!', weight: 5 },
  { name: '🎇 Gold Coin Worth ₹5,000', weight: 10 },
  { name: '🎆 Silver Hamper ₹2,500', weight: 15 },
  { name: '✨ Shopping Voucher ₹1,000', weight: 25 },
  { name: '🎁 Sweets & Dry Fruits ₹500', weight: 45 }
];

// Select random prize based on weights
function selectPrize() {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) {
      return prize.name;
    }
  }
  return prizes[prizes.length - 1].name;
}

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
    const { userId, email } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Check if user already played
    const playCheck = await pool.query('SELECT * FROM plays WHERE user_id = $1', [userId]);
    const existingPlay = playCheck.rows[0];
    
    if (existingPlay) {
      return res.json({
        alreadyPlayed: true,
        prize: existingPlay.prize
      });
    }
    
    // Select and save prize
    const prize = selectPrize();
    await pool.query(
      'INSERT INTO plays (user_id, email, prize) VALUES ($1, $2, $3)',
      [userId, email || 'unknown', prize]
    );
    
    res.json({
      alreadyPlayed: false,
      prize
    });
  } catch (err) {
    console.error('Scratch error:', err);
    res.status(500).json({ error: 'Failed to save prize' });
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

app.listen(PORT, () => {
  console.log(`🪔 Diwali Dhamaka server running at http://localhost:${PORT}`);
  console.log(`शुभ दीपावली! Happy Diwali! 🎆`);
});
