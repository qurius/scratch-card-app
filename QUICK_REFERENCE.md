# 🚀 Quick Reference Guide

## 🎯 For Staff: Creating Orders

### Simple Command
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

### What You'll Get
```json
{
  "orderId": "AMIT",
  "message": "Order created! Tell customer: 'Your Order ID is AMIT'"
}
```

### Tell Customer
> "Your Order ID is **AMIT**. Visit our website and enter this ID with your email to play Scratch & Win!"

---

## 📧 Email-Based Order IDs

| Customer Email | First Order | Second Order | Third Order |
|---------------|-------------|--------------|-------------|
| amit@fplabs.tech | AMIT | AMIT-001 | AMIT-002 |
| priya@fplabs.tech | PRIYA | PRIYA-001 | PRIYA-002 |

**Rules:**
- ✅ Must be @fplabs.tech domain
- ✅ Auto-generated from email username
- ✅ Unique and sequential
- ✅ Easy to communicate verbally

---

## 🛍️ Product Data Format

### Recommended (Structured)
```json
"items": [
  {"name": "Rangoli Set", "quantity": 1},
  {"name": "Diya", "quantity": 5},
  {"name": "Scented Candle", "quantity": 2}
]
```

### Also Works (Simple String)
```json
"items": "Rangoli Set, Diya, Scented Candle"
```
Auto-converts to structured format with quantity: 1

---

## 🎮 Customer Journey

1. **Purchase** ≥ ₹500
2. **Provide** email (@fplabs.tech)
3. **Staff creates order** → System generates ID
4. **Staff tells customer**: "Your Order ID is **AMIT**"
5. **Customer visits** website
6. **Enters** Order ID + Email
7. **Validation**:
   - ✅ Valid → Scratch card appears
   - ❌ Invalid → 🔊 Error sound + message
8. **Scratch & Win!** 🎉

---

## 📊 Analytics Queries

### Get Sales Stats
```bash
curl http://localhost:3000/api/sales-stats
```

### Most Sold Products (SQL)
```sql
SELECT 
  item->>'name' as product,
  SUM((item->>'quantity')::int) as total_sold
FROM orders, jsonb_array_elements(items) as item
GROUP BY item->>'name'
ORDER BY total_sold DESC;
```

### Export to CSV
```sql
\copy (
  SELECT item->>'name', SUM((item->>'quantity')::int)
  FROM orders, jsonb_array_elements(items) as item
  GROUP BY item->>'name'
) TO 'products.csv' CSV HEADER;
```

---

## 🔊 Sound Effects

| Sound | When It Plays |
|-------|---------------|
| 🎵 Scratch | User starts scratching |
| 🎆 Reveal | Prize auto-reveals (50% scratched) |
| 🎉 Celebration | Confetti animation |
| ❌ Error | Invalid order validation |

**Error Sound Triggers:**
- Order not found
- Email mismatch
- Amount < ₹500
- Order already used

---

## ⚙️ Configuration

Edit `.env` file:

```bash
# Minimum purchase amount
MIN_PURCHASE_AMOUNT=500

# Prize pool (JSON format)
PRIZES=[{"name":"🪔 Bumper: ₹10,000","weight":5},{"name":"🎇 Gold: ₹5,000","weight":10}]

# Store info
STORE_NAME=OneCard Diwali Dhamaka
STORE_TAGLINE=शुभ दीपावली!

# Other settings
SCRATCH_THRESHOLD=50
PORT=3000
```

---

## 🛠️ Common Commands

### Start Server
```bash
npm start
```

### Test Orders
```bash
./test_new_features.sh
```

### View Database
```bash
psql -U postgres -d scratch_card_db
```

### Check Recent Orders
```sql
SELECT order_id, email, amount, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Winners
```sql
SELECT o.order_id, o.email, p.prize 
FROM plays p 
JOIN orders o ON p.order_id = o.order_id 
ORDER BY p.played_at DESC;
```

---

## ⚡ Quick Troubleshooting

### Issue: Order Not Found
```sql
SELECT * FROM orders WHERE order_id = 'AMIT';
```

### Issue: Email Rejected
Check: Must be @fplabs.tech domain

### Issue: Amount Too Low
Check: Must be ≥ ₹500 (configured in config.js)

### Issue: Already Used
```sql
SELECT used_for_scratch FROM orders WHERE order_id = 'AMIT';
```
If TRUE, order has been used

---

## 📱 Frontend URLs

- **Main App**: http://localhost:3000
- **Stats API**: http://localhost:3000/api/stats
- **Sales Stats**: http://localhost:3000/api/sales-stats
- **Config**: http://localhost:3000/api/config

---

## 📚 Documentation Files

- **NEW_FEATURES.md** - Detailed feature explanation
- **ADMIN_GUIDE.md** - Complete admin guide
- **PURCHASE_SYSTEM.md** - System architecture
- **ENV_CONFIGURATION.md** - Environment variable configuration guide
- **SETUP.md** - Database setup
- **README.md** - Overview

---

## 💡 Tips

1. ✅ Always verify customer email before creating order
2. ✅ Tell customer their Order ID clearly (e.g., "AMIT")
3. ✅ Remind customer to use same email on website
4. ✅ Use structured items format for better analytics
5. ✅ Check sales stats regularly

---

## 🎉 Sample Workflow

```bash
# 1. Customer purchases ₹850 of items
# 2. Customer email: amit@fplabs.tech

# 3. Create order
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amit@fplabs.tech",
    "amount": 850,
    "items": [
      {"name": "Rangoli Set", "quantity": 1},
      {"name": "Diya", "quantity": 5}
    ]
  }'

# 4. Response: "orderId": "AMIT"

# 5. Tell customer: "Your Order ID is AMIT"

# 6. Customer visits website, enters:
#    Order ID: AMIT
#    Email: amit@fplabs.tech

# 7. ✅ Validation passes → Scratch card appears
# 8. Customer wins prize! 🎉
```

---

**Need Help?** Check the detailed guides or contact technical support.
