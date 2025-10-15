# 🛍️ Purchase-Based Scratch & Win System

## 🎯 What Changed

### Before
- Anyone could play scratch & win
- One play per email
- No purchase validation

### After ✨
- **Purchase-based system** - Must buy ≥ ₹500 to play
- **Order ID validation** - Each order gets unique ID
- **One play per order** - Can't reuse same purchase
- **Full tracking** - Links purchases to prizes

---

## 📊 System Architecture

```
Customer Purchase (₹500+)
         ↓
Staff Creates Order → Database
         ↓
Order ID Given to Customer
         ↓
Customer Visits Website
         ↓
Enters Order ID + Email
         ↓
System Validates:
  ✓ Order exists?
  ✓ Email matches?
  ✓ Amount ≥ ₹500?
  ✓ Not already used?
         ↓
    If Valid ✅
         ↓
   Scratch Card Appears
         ↓
   Customer Wins Prize!
         ↓
Order Marked as Used (can't reuse)
```

---

## 🔧 Technical Implementation

### 1. **Configuration Management** (`.env`)

Centralized configuration in environment variables:
- Minimum purchase amount (₹500)
- Prize pool and weights
- Store information
- Scratch threshold

**Easy to update:**
```bash
MIN_PURCHASE_AMOUNT=500  # Change to 1000, 750, etc.
```

### 2. **Database Schema**

**Orders Table:**
- Stores all purchases
- Tracks eligibility (amount ≥ min)
- Flags if used for scratch

**Plays Table:**
- Links to specific order
- Records prize won
- Prevents duplicate plays

**Users Table:**
- Stores customer info
- Links to orders and plays

### 3. **API Endpoints**

| Endpoint | Purpose | Who Uses |
|----------|---------|----------|
| `POST /api/create-order` | Register new purchase | Staff/POS |
| `POST /api/validate-order` | Check order eligibility | Customer (Frontend) |
| `POST /api/scratch` | Award prize, mark order used | Customer (Frontend) |
| `GET /api/config` | Get min amount, store info | Frontend |
| `GET /api/stats` | View statistics | Admin |

### 4. **Frontend Flow**

**Order Validation Modal:**
- First screen customer sees
- Inputs: Order ID + Email
- Real-time validation with server
- Shows clear error/success messages

**Validation Checks:**
1. Order exists in database
2. Email matches order
3. Amount meets minimum
4. Not already used

**User Experience:**
- ✅ Valid → Modal closes → Scratch card appears
- ❌ Invalid → Error message with reason
- ⏳ Processing → "Validating order..." indicator

---

## 💼 Business Benefits

### For Store Owners

1. **Guaranteed Revenue**
   - Only paying customers can win
   - Minimum purchase threshold enforced
   - No prize waste on non-customers

2. **Sales Boost**
   - Encourages larger purchases (to reach ₹500)
   - Repeat visits (to use order ID)
   - Word-of-mouth marketing

3. **Full Tracking**
   - Every order linked to email
   - Know which purchases won prizes
   - Export data for prize fulfillment

4. **Fraud Prevention**
   - One play per order
   - Email verification required
   - Order ID must match email

### For Customers

1. **Fair Play**
   - Legitimate purchase required
   - Clear eligibility criteria
   - Instant validation

2. **Easy Process**
   - Simple Order ID + Email input
   - No app download needed
   - Works on any phone

3. **Transparency**
   - See purchase amount requirement upfront
   - Clear error messages if ineligible
   - Can play immediately after purchase

---

## 📈 Sample Usage Scenarios

### Scenario 1: Eligible Purchase

```
Customer buys: Rangoli Set (₹300) + Diyas (₹150) + Candle (₹200) = ₹650

Staff creates order:
- Order ID: DIW-101
- Email: customer@gmail.com
- Amount: ₹650
- Status: ✅ Eligible

Customer visits website:
1. Enters: DIW-101 + customer@gmail.com
2. System validates → ✅ Pass
3. Scratch card appears
4. Wins: "🎁 Sweets & Dry Fruits ₹500"
5. Order marked as used

If customer tries again:
- Error: "This order has already been used"
```

### Scenario 2: Below Threshold

```
Customer buys: Small Diya (₹200)

Staff creates order:
- Order ID: DIW-102
- Amount: ₹200
- Status: ❌ Not Eligible (< ₹500)

Customer visits website:
1. Enters: DIW-102 + email
2. System validates → ❌ Fail
3. Error: "Minimum purchase of ₹500 required. Your order: ₹200"
4. Scratch card does NOT appear
```

### Scenario 3: Email Mismatch

```
Customer buys: ₹750 worth

Staff creates order:
- Order ID: DIW-103
- Email: correct@gmail.com

Customer enters WRONG email:
1. Enters: DIW-103 + wrong@gmail.com
2. System validates → ❌ Fail
3. Error: "Email does not match the order"
4. Must use correct email
```

---

## 🗃️ Data Export for Prize Distribution

### Get All Winners

```sql
SELECT 
  orders.order_id,
  orders.email,
  orders.amount AS purchase_amount,
  orders.items AS purchased_items,
  plays.prize AS prize_won,
  plays.played_at AS won_date
FROM plays
JOIN orders ON plays.order_id = orders.order_id
ORDER BY plays.played_at DESC;
```

### Export to CSV

```bash
psql -U postgres -d scratch_card_db -c "\copy (
  SELECT orders.order_id, orders.email, orders.amount, plays.prize, plays.played_at 
  FROM plays JOIN orders ON plays.order_id = orders.order_id
) TO 'winners.csv' CSV HEADER"
```

### Winners by Prize

```sql
SELECT 
  plays.prize,
  COUNT(*) as total_winners,
  string_agg(orders.email, ', ') as winner_emails
FROM plays
JOIN orders ON plays.order_id = orders.order_id
GROUP BY plays.prize
ORDER BY total_winners DESC;
```

---

## 🔐 Security Features

1. **Order Uniqueness**
   - Each order ID can only exist once
   - Database constraint prevents duplicates

2. **Email Validation**
   - Format checked on frontend
   - Must match order on backend

3. **One-Time Use**
   - `used_for_scratch` flag in database
   - Transaction ensures atomicity

4. **Amount Verification**
   - Server-side validation
   - Cannot be bypassed from frontend

---

## 📱 Mobile Optimization

- Touch-optimized inputs
- Large, easy-to-tap buttons
- Clear error messages
- Responsive design
- Works on all screen sizes

---

## 🎨 Customization

### Change Minimum Amount

Edit `.env`:
```bash
MIN_PURCHASE_AMOUNT=750  # Increased from 500
```

### Add New Prizes

Edit `.env` (JSON format on one line):
```bash
PRIZES=[{"name":"🎁 New Prize: ₹2000","weight":12},{"name":"🪔 Bumper: ₹10,000","weight":5}]
```

**Tip:** Format in a JSON editor, then minify to one line.

### Modify Store Info

Edit `.env`:
```bash
STORE_NAME=Your Store Name
STORE_TAGLINE=Custom Tagline
STORE_DESCRIPTION=Your Description
```

### Change Scratch Threshold

Edit `.env`:
```bash
SCRATCH_THRESHOLD=70  # Increased from 50 (requires 70% scratched)
```

---

## 🚀 Future Enhancements

Possible additions:

1. **Admin Dashboard**
   - View all orders
   - Search by Order ID/Email
   - Manually mark orders as used
   - View analytics

2. **SMS Integration**
   - Auto-send Order ID via SMS
   - Prize notification

3. **Bulk Order Import**
   - Upload CSV of orders
   - Useful for high-volume events

4. **QR Code Generation**
   - Generate QR with Order ID
   - Scan to auto-fill on website

5. **Prize Tiers Based on Amount**
   - ₹500-₹1000: Tier 1 prizes
   - ₹1000-₹2000: Tier 2 prizes
   - ₹2000+: Tier 3 prizes

6. **Email Notifications**
   - Prize won confirmation
   - Claim instructions

---

## 📞 Support Workflow

### Customer Can't Play

**Issue:** "Order not found"
- **Check:** Is order in database?
```sql
SELECT * FROM orders WHERE order_id = 'DIW-XXX';
```

**Issue:** "Email doesn't match"
- **Check:** What email is registered?
```sql
SELECT email FROM orders WHERE order_id = 'DIW-XXX';
```

**Issue:** "Amount too low"
- **Check:** Order amount
```sql
SELECT amount FROM orders WHERE order_id = 'DIW-XXX';
```

**Issue:** "Already used"
- **Check:** Has order been played?
```sql
SELECT used_for_scratch, prize FROM orders 
LEFT JOIN plays ON orders.order_id = plays.order_id 
WHERE orders.order_id = 'DIW-XXX';
```

---

## ✅ Testing Checklist

Before going live:

- [ ] Create test order with amount ≥ ₹500
- [ ] Verify order validation works
- [ ] Test scratch card with test order
- [ ] Confirm prize is awarded
- [ ] Check order marked as used
- [ ] Try reusing same order (should fail)
- [ ] Test with amount < ₹500 (should fail)
- [ ] Test with wrong email (should fail)
- [ ] Export winner data
- [ ] Verify all database tables created

---

## 📚 Related Documentation

- **ADMIN_GUIDE.md** - How to create and manage orders
- **SETUP.md** - Database and server setup
- **README.md** - General project information
- **.env.example** - All configurable settings (copy to .env)

---

This purchase-based system ensures that only genuine customers can participate, while providing a seamless and engaging experience that drives sales and customer engagement! 🎉
