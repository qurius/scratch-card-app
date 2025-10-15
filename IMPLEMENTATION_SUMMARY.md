# ✅ Tiered Scratch & Win - Final Implementation

## 🎉 System Overview

**Inventory-Based, Margin-Protected Prize System**

Your scratch & win now features 3 tiers based on purchase amounts, using your actual candle inventory with probability weights that protect profit margins.

---

## 🏆 Final Tier Configuration

### 🥉 **Bronze Tier (₹100-₹299)**

| Prize | Items | Cost | Probability | Why This Weight? |
|-------|-------|------|-------------|------------------|
| 1 Tealight | 1x Tealight | ₹5 | **50%** | Lowest cost = Highest probability |
| 3 Tealights | 3x Tealight | ₹15 | 30% | Moderate prize |
| 4 Tealights | 4x Tealight | ₹20 | 15% | Good prize |
| 5 Tealights | 5x Tealight | ₹25 | **5%** | Rare "jackpot" |

**Average Prize Cost:** ₹11.25 per customer  
**% of Order Value:** 7.5% (excellent margin!)

---

### 🥈 **Silver Tier (₹300-₹499)**

| Prize | Items | Cost | Probability | Why This Weight? |
|-------|-------|------|-------------|------------------|
| 1 Heart + 2 Tealights | 1x Heart + 2x Tealight | ₹45 | **45%** | Lowest cost = Highest probability |
| 1 Heart + 3 Tealights | 1x Heart + 3x Tealight | ₹50 | 30% | Moderate prize |
| 2 Hearts + 2 Tealights | 2x Heart + 2x Tealight | ₹80 | 20% | Good prize |
| 2 Hearts | 2x Heart | ₹70 | **5%** | Rare "jackpot" |

**Average Prize Cost:** ₹52 per customer  
**% of Order Value:** 13% (healthy margin!)

---

### 🥇 **Gold Tier (₹500-₹1000)**

| Prize | Items | Cost | Probability | Why This Weight? |
|-------|-------|------|-------------|------------------|
| 1 Damru + 3 Hearts | 1x Damru + 3x Heart | ₹150 | **40%** | Lowest cost = Highest probability |
| 1 Damru + 3 Hearts + 2 Tealights | 1x Damru + 3x Heart + 2x Tealight | ₹160 | 30% | Moderate prize |
| 1 Damru + 4 Hearts | 1x Damru + 4x Heart | ₹185 | 20% | Good prize |
| 1 Damru + 5 Hearts | 1x Damru + 5x Heart | ₹220 | 8% | Great prize |
| 2 Damru + 2 Hearts | 2x Damru + 2x Heart | ₹160 | **2%** | Rare "jackpot" |

**Average Prize Cost:** ₹163 per customer  
**% of Order Value:** 22% (still profitable!)

---

## 💰 Financial Projection (100 customers)

### Revenue
```
40 Bronze customers @ ₹150 avg  = ₹6,000
35 Silver customers @ ₹400 avg  = ₹14,000
25 Gold customers @ ₹750 avg    = ₹18,750
----------------------------------------
TOTAL REVENUE                   = ₹38,750
```

### Prize Costs
```
Bronze: 40 × ₹11.25  = ₹450   (7.5% of tier revenue)
Silver: 35 × ₹52     = ₹1,820 (13% of tier revenue)
Gold: 25 × ₹163      = ₹4,075 (22% of tier revenue)
----------------------------------------
TOTAL PRIZE COST     = ₹6,345  (16.4% of total revenue)
```

### **NET PROFIT: ₹32,405 (83.6% margin)** 🎉

---

## 🎯 Key Design Principles

### 1. **Margin Protection**
✅ Cheapest prizes have **highest probability** (50%, 45%, 40%)  
✅ Most expensive prizes are **rare** (5%, 2%)  
✅ Average prize cost stays under 25% of order value

### 2. **Customer Psychology**
✅ **Everyone wins** - No disappointment  
✅ **Jackpot excitement** - Rare big prizes create buzz  
✅ **Transparency** - Clear tier levels shown upfront

### 3. **Inventory Management**
✅ Uses existing candle stock  
✅ Predictable costs (fixed prize combinations)  
✅ Easy to track distribution

---

## 📊 Expected Distribution (100 customers)

### Bronze Tier (40 customers)
- 20 get 1 Tealight (₹5)
- 12 get 3 Tealights (₹15)
- 6 get 4 Tealights (₹20)
- 2 get 5 Tealights (₹25) 🎉

**Total Tealights Given:** ~110 candles

### Silver Tier (35 customers)
- 16 get 1 Heart + 2 Tealights
- 11 get 1 Heart + 3 Tealights
- 7 get 2 Hearts + 2 Tealights
- 1 gets 2 Hearts 🎉

**Total Hearts Given:** ~45 candles  
**Total Tealights Given:** ~70 candles

### Gold Tier (25 customers)
- 10 get 1 Damru + 3 Hearts
- 8 get 1 Damru + 3 Hearts + 2 Tealights
- 5 get 1 Damru + 4 Hearts
- 2 get 1 Damru + 5 Hearts
- 0-1 gets 2 Damru + 2 Hearts 🎉

**Total Damrus Given:** ~25 candles  
**Total Hearts Given:** ~87 candles  
**Total Tealights Given:** ~16 candles

---

## 🚀 Implementation Status

### ✅ Completed
- [x] Tiered prize configuration in .env
- [x] Margin-protected probability weights
- [x] Server-side tier detection based on order amount
- [x] Database schema with prize_details (JSONB) and tier columns
- [x] Prize selection algorithm (weighted random)
- [x] Frontend tier display with emojis (🥉🥈🥇)
- [x] Detailed prize breakdown display
- [x] Order validation with tier information
- [x] MIN_PURCHASE_AMOUNT lowered to ₹100

### 📝 Configuration Files
- `.env.example` - Complete tier configuration
- `server.js` - Tier logic and prize selection
- `public/app.js` - Frontend tier display
- Database tables updated with new columns

---

## 🧪 Testing

### Test Each Tier:

**Bronze (₹100-299):**
```bash
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bronze@fplabs.tech",
    "amount": 150,
    "items": [{"name":"Rangoli","quantity":1}]
  }'
```

**Silver (₹300-499):**
```bash
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "email": "silver@fplabs.tech",
    "amount": 400,
    "items": [{"name":"Diya","quantity":5}]
  }'
```

**Gold (₹500-1000):**
```bash
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gold@fplabs.tech",
    "amount": 750,
    "items": [{"name":"Candle Set","quantity":3}]
  }'
```

Then visit http://localhost:3000 and scratch to test prize distribution!

---

## 📈 Analytics Queries

### Check Prize Distribution:
```sql
SELECT 
  tier,
  prize,
  COUNT(*) as times_won,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY tier), 1) as percentage
FROM plays
GROUP BY tier, prize
ORDER BY tier, times_won DESC;
```

### Calculate Actual Average Prize Cost:
```sql
-- You'll need to add prize costs to a lookup table or calculate based on items
SELECT 
  tier,
  AVG(
    CASE 
      WHEN prize LIKE '%1 Tealight%' THEN 5
      WHEN prize LIKE '%3 Tealight%' THEN 15
      -- Add all prize cost mappings
    END
  ) as avg_prize_cost
FROM plays
GROUP BY tier;
```

### Total Inventory Distributed:
```sql
SELECT 
  item->>'name' as candle_type,
  SUM((item->>'quantity')::int) as total_given
FROM plays,
jsonb_array_elements(prize_details) as item
GROUP BY item->>'name'
ORDER BY total_given DESC;
```

---

## 💡 Marketing Messages

### For Customers:
> "**Every purchase over ₹100 wins a prize!**  
> 🥉 Bronze (₹100-299): Win 1-5 Tealight Candles  
> 🥈 Silver (₹300-499): Win Heart & Tealight Candles  
> 🥇 Gold (₹500+): Win Premium Damru & Heart Candles  
>  
> Visit our website with your Order ID to scratch & reveal your prize!"

### For Staff:
> "Tell customer: Your Order ID is **[NAME]**. Visit our website to play scratch & win! Every purchase wins a prize!"

---

## ⚙️ Adjusting Configuration

To modify tiers, edit `.env`:

1. **Change tier boundaries:**
```bash
# Make Bronze tier smaller, Silver tier bigger
{"min":100,"max":199,"name":"Bronze"...}
{"min":200,"max":599,"name":"Silver"...}
```

2. **Adjust probabilities:**
```bash
# Make lowest prize even more common (60% instead of 50%)
{"name":"1 Tealight","...","weight":60}
{"name":"3 Tealights","...","weight":25}
{"name":"4 Tealights","...","weight":12}
{"name":"5 Tealights","...","weight":3}
```

3. **Add new prizes:**
```bash
{"name":"New Prize","items":[...],"weight":10}
```

Always ensure: **Lower cost = Higher weight** to protect margins!

---

## ✅ Success Metrics to Track

1. **Average Order Value** - Target: Increase by 50%+
2. **Prize Cost %** - Keep under 20% of revenue
3. **Customer Satisfaction** - Survey winners
4. **Repeat Purchase Rate** - Do winners come back?
5. **Tier Distribution** - Are customers upgrading tiers?
6. **Inventory Turnover** - Prize stock moving?

---

## 🎉 Summary

Your scratch & win system is now:
- ✅ **Profitable** - 83.6% margin maintained
- ✅ **Fair** - Everyone wins something
- ✅ **Exciting** - Rare jackpot prizes create buzz
- ✅ **Manageable** - Uses existing inventory
- ✅ **Scalable** - Easy to adjust via .env
- ✅ **Data-Driven** - Full analytics available

**Ready to launch!** 🚀🕯️
