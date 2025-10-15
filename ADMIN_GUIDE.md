# 🎯 Admin Guide - Order Management for Diwali Scratch & Win

## 📋 Overview

This scratch-and-win system is now **purchase-based**. Only customers who purchase items worth **₹500 or more** can play and win prizes.

## 🔧 Configuration

All configuration is now in the **`.env`** file!

### Minimum Purchase Amount

Edit `.env` to change the minimum purchase amount:

```bash
MIN_PURCHASE_AMOUNT=500  # Change this value
```

### Prize Pool

Edit `.env` to modify prizes (JSON format):

```bash
PRIZES=[{"name":"🪔 Bumper Prize: ₹10,000 Cash!","weight":5},{"name":"🎇 Gold Coin Worth ₹5,000","weight":10},{"name":"🎆 Silver Hamper ₹2,500","weight":15}]
```

**Tip:** For easier editing, format the JSON in a separate editor, then minify it back to one line.

### Store Information

```bash
STORE_NAME=OneCard Diwali Dhamaka
STORE_TAGLINE=शुभ दीपावली!
STORE_DESCRIPTION=Shop for Rangoli, Diyas, Scented Candles & More!
```

### Other Settings

```bash
SCRATCH_THRESHOLD=50  # Percentage of canvas to scratch before auto-reveal
PORT=3000            # Server port
```

## 📝 How to Register Customer Orders

### ✨ Auto-Generated Order IDs

**Order IDs are now automatically generated from email addresses!**

- Email: `amit@fplabs.tech` → Order ID: **AMIT**
- Email: `priya@fplabs.tech` → Order ID: **PRIYA**
- Second order for amit → Order ID: **AMIT-001**
- Third order for amit → Order ID: **AMIT-002**

**Benefits:**
- ✅ Easy to communicate verbally
- ✅ Customer remembers it easily
- ✅ No manual ID generation needed
- ✅ Unique per customer

### Option 1: Using API (Recommended for POS Integration)

**Endpoint:** `POST /api/create-order`

**Request (Structured Items - Recommended):**
```json
{
  "email": "amit@fplabs.tech",
  "amount": 750,
  "items": [
    { "name": "Rangoli Set", "quantity": 1 },
    { "name": "Diya", "quantity": 5 },
    { "name": "Scented Candle", "quantity": 2 }
  ]
}
```

**Request (Simple String Format - Also Works):**
```json
{
  "email": "priya@fplabs.tech",
  "amount": 650,
  "items": "Rangoli Set, Diyas, Candles"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "AMIT",
  "amount": 750,
  "isEligible": true,
  "items": [
    { "name": "Rangoli Set", "quantity": 1 },
    { "name": "Diya", "quantity": 5 },
    { "name": "Scented Candle", "quantity": 2 }
  ],
  "message": "Order created! Tell customer: 'Your Order ID is AMIT'"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amit@fplabs.tech",
    "amount": 750,
    "items": [
      {"name": "Rangoli Set", "quantity": 1},
      {"name": "Diya", "quantity": 5}
    ]
  }'
```

### Option 2: Using Postman / Insomnia

1. Create POST request to `http://localhost:3000/api/create-order`
2. Set header: `Content-Type: application/json`
3. Add body with order details (see above)
4. Send request

### Option 3: Create Simple Admin Panel (To Be Built)

You can build a simple HTML form for staff to enter orders manually.

## 🎮 Customer Flow

1. **Customer makes purchase ≥ ₹500**
2. **Customer provides email** (must be @fplabs.tech)
3. **Staff creates order in system** (using API or admin panel)
   - Email: `amit@fplabs.tech`
   - Amount: ₹750
   - Items: Rangoli, Diyas, etc.
   - **System auto-generates Order ID: `AMIT`**
4. **Staff tells customer verbally**: 
   - "Your Order ID is **AMIT**"
   - Easy to remember and communicate!
5. **Customer visits website**
   - Enters Order ID: **AMIT**
   - Enters Email: amit@fplabs.tech
   - System validates order
6. **If valid → Scratch card appears**
   - **If invalid → Error sound plays** 🔊
7. **Customer wins prize!**
8. **Order marked as used** (prevents reuse)

## 🔍 Validating Orders

Customers enter their Order ID and Email on the website. The system checks:

✅ Order exists in database  
✅ Email matches the order  
✅ Amount ≥ minimum threshold (₹500)  
✅ Order not already used for scratch card  

## 📊 Database Schema

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,         -- e.g., "ORD-12345"
  email TEXT NOT NULL,                   -- Customer email
  amount DECIMAL(10, 2) NOT NULL,        -- Purchase amount
  items TEXT,                            -- Items purchased (optional)
  created_at TIMESTAMP DEFAULT NOW(),
  is_eligible BOOLEAN DEFAULT FALSE,     -- Amount >= minimum
  used_for_scratch BOOLEAN DEFAULT FALSE -- Already played?
);
```

### Plays Table (Linked to Orders)
```sql
CREATE TABLE plays (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT NOT NULL,                -- Links to orders table
  email TEXT NOT NULL,
  prize TEXT NOT NULL,
  played_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

## 🎯 Sample Workflow

### Scenario: Customer Purchases ₹850 Worth of Items

```bash
# Step 1: Customer completes purchase at stall

# Step 2: Staff creates order
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "DIW-001",
    "email": "amit@example.com",
    "amount": 850,
    "items": "Rangoli Colors, 5 Diyas, Rose Candle"
  }'

# Response:
# {
#   "success": true,
#   "orderId": "DIW-001",
#   "amount": 850,
#   "isEligible": true,
#   "message": "Order created! Customer can play scratch & win."
# }

# Step 3: Staff tells customer:
# "Your Order ID is DIW-001. Visit our website and enter this ID with your email to play!"

# Step 4: Customer visits website
# - Enters: DIW-001 and amit@example.com
# - System validates and shows scratch card
# - Customer scratches and wins prize!

# Step 5: Order is marked as used
# - Same order cannot be used again
```

## 🚫 Ineligible Orders

If purchase is less than minimum:

```bash
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "DIW-002",
    "email": "priya@example.com",
    "amount": 350,
    "items": "Small Diya Set"
  }'

# Response:
# {
#   "success": true,
#   "orderId": "DIW-002",
#   "amount": 350,
#   "isEligible": false,
#   "message": "Order created but not eligible. Minimum ₹500 required."
# }
```

Customer will see error: "Minimum purchase of ₹500 required. Your order: ₹350"

## 📈 View Statistics

### Prize Statistics

**Endpoint:** `GET /api/stats`

```bash
curl http://localhost:3000/api/stats
```

**Response:**
```json
{
  "totalPlays": 42,
  "distribution": [
    { "prize": "🪔 Bumper Prize: ₹10,000 Cash!", "count": 2 },
    { "prize": "🎇 Gold Coin Worth ₹5,000", "count": 5 },
    { "prize": "🎆 Silver Hamper ₹2,500", "count": 7 },
    { "prize": "✨ Shopping Voucher ₹1,000", "count": 10 },
    { "prize": "🎁 Sweets & Dry Fruits ₹500", "count": 18 }
  ]
}
```

### 📊 Sales & Product Statistics

**Endpoint:** `GET /api/sales-stats`

```bash
curl http://localhost:3000/api/sales-stats
```

**Response:**
```json
{
  "totalOrders": 156,
  "totalRevenue": 123450.50,
  "eligibilityBreakdown": [
    { "is_eligible": true, "count": 142, "total_amount": 118230.50 },
    { "is_eligible": false, "count": 14, "total_amount": 5220.00 }
  ],
  "productBreakdown": [
    { "product_name": "Diya", "total_quantity": 245, "orders_containing": 98 },
    { "product_name": "Rangoli Set", "total_quantity": 87, "orders_containing": 87 },
    { "product_name": "Scented Candle", "total_quantity": 156, "orders_containing": 76 }
  ],
  "dailySales": [
    { "date": "2025-10-14", "orders": 23, "revenue": 18450.00 },
    { "date": "2025-10-13", "orders": 31, "revenue": 24780.00 }
  ]
}
```

**What You Get:**
- **Total Orders & Revenue** - Overall sales performance
- **Eligibility Breakdown** - How many orders met ₹500 threshold
- **Product Breakdown** - Most popular items by quantity sold
- **Daily Sales** - Revenue trends over time

## 🗃️ Export Winner Data

To get list of all winners for prize distribution:

```sql
-- Connect to database
psql -U postgres -d scratch_card_db

-- View all winners with products purchased
SELECT 
  plays.order_id,
  orders.email,
  orders.amount as purchase_amount,
  orders.items,
  plays.prize,
  plays.played_at
FROM plays
JOIN orders ON plays.order_id = orders.order_id
ORDER BY plays.played_at DESC;

-- Export to CSV
\copy (SELECT plays.order_id, orders.email, orders.amount, plays.prize, plays.played_at FROM plays JOIN orders ON plays.order_id = orders.order_id) TO '/tmp/winners.csv' CSV HEADER;
```

## 📦 Query Product Sales Data

**Most Sold Products:**
```sql
-- Get total quantity sold per product
SELECT 
  item->>'name' as product_name,
  SUM((item->>'quantity')::int) as total_quantity_sold,
  COUNT(DISTINCT order_id) as number_of_orders
FROM orders,
jsonb_array_elements(items) as item
WHERE items IS NOT NULL
GROUP BY item->>'name'
ORDER BY total_quantity_sold DESC;
```

**Revenue by Product:**
```sql
-- Calculate revenue contribution per product
-- (Note: This gives orders containing the product, not exact per-item revenue)
SELECT 
  item->>'name' as product_name,
  COUNT(DISTINCT orders.order_id) as orders_count,
  SUM(orders.amount) as total_revenue_from_orders
FROM orders,
jsonb_array_elements(items) as item
WHERE items IS NOT NULL
GROUP BY item->>'name'
ORDER BY total_revenue_from_orders DESC;
```

**Products Purchased in Date Range:**
```sql
-- Products sold in last 7 days
SELECT 
  item->>'name' as product_name,
  SUM((item->>'quantity')::int) as quantity,
  DATE(orders.created_at) as date
FROM orders,
jsonb_array_elements(items) as item
WHERE items IS NOT NULL
  AND orders.created_at >= NOW() - INTERVAL '7 days'
GROUP BY item->>'name', DATE(orders.created_at)
ORDER BY date DESC, quantity DESC;
```

**Export Product Sales to CSV:**
```sql
\copy (
  SELECT 
    item->>'name' as product_name,
    SUM((item->>'quantity')::int) as total_sold,
    COUNT(DISTINCT order_id) as orders
  FROM orders, jsonb_array_elements(items) as item
  WHERE items IS NOT NULL
  GROUP BY item->>'name'
  ORDER BY total_sold DESC
) TO '/tmp/product_sales.csv' CSV HEADER;
```

## 🔐 Security Best Practices

1. **Order IDs should be unique** - Use sequential numbers with prefix (e.g., DIW-001, DIW-002)
2. **Validate email format** - System automatically validates
3. **One order = One play** - Database enforces this
4. **Secure API endpoint** - Consider adding authentication for `/api/create-order` in production

## 🛠️ Troubleshooting

### Order Not Found
- **Issue:** Customer enters Order ID but gets "Order not found"
- **Solution:** Check if order was created in database
```sql
SELECT * FROM orders WHERE order_id = 'DIW-001';
```

### Email Mismatch
- **Issue:** Customer enters correct Order ID but wrong email
- **Solution:** Verify email matches what was registered
```sql
SELECT email FROM orders WHERE order_id = 'DIW-001';
```

### Already Used
- **Issue:** Customer tries to play again with same order
- **Solution:** This is expected behavior - each order can only be used once
```sql
SELECT used_for_scratch FROM orders WHERE order_id = 'DIW-001';
-- If TRUE, order has been used
```

### Amount Below Threshold
- **Issue:** Order created but customer can't play
- **Solution:** Check if amount >= minimum
```sql
SELECT amount, is_eligible FROM orders WHERE order_id = 'DIW-001';
```

## 📱 Integration Ideas

### POS System Integration

If you have a Point of Sale (POS) system, you can integrate it to automatically create orders:

```javascript
// Pseudo-code for POS integration
async function onPaymentComplete(transaction) {
  const orderData = {
    orderId: transaction.receiptNumber,
    email: transaction.customerEmail,
    amount: transaction.total,
    items: transaction.items.map(i => i.name).join(', ')
  };
  
  await fetch('http://localhost:3000/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  // Print on receipt: "Play Scratch & Win with Order ID: [orderData.orderId]"
}
```

### SMS Notification

Send SMS to customer with Order ID:

```
Thank you for shopping! Your Order ID is DIW-001.
Visit [your-website.com] to play Scratch & Win!
```

## 💡 Tips for Staff

1. ✅ **Always verify email address** - Ask customer to spell it out
2. ✅ **Write Order ID clearly** - Use capital letters and numbers
3. ✅ **Check total amount** - Must be ≥ ₹500
4. ✅ **Inform customer immediately** - Tell them about scratch & win
5. ✅ **Keep receipt copy** - With Order ID for reference

## 📞 Support

For technical issues, check the server logs:
```bash
# View server logs
npm start

# Check for errors in console
```

Database issues:
```bash
# Connect to PostgreSQL
psql -U postgres -d scratch_card_db

# Check recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

# Check recent plays
SELECT * FROM plays ORDER BY played_at DESC LIMIT 10;
```
