# 🔧 Environment-Based Configuration

## ✅ Migration Complete: config.js → .env

All configuration has been moved from `config.js` to environment variables in `.env` file.

---

## 🎯 Why This Change?

### **Before (config.js):**
- ❌ Required code changes to update settings
- ❌ Mixed code and configuration
- ❌ Not environment-friendly
- ❌ Hard to manage across deployments

### **After (.env):**
- ✅ Change settings without touching code
- ✅ Separation of configuration and code
- ✅ Environment-specific settings (dev, staging, prod)
- ✅ Standard industry practice
- ✅ Gitignored by default (secure)

---

## 📋 Configuration Reference

### Complete `.env` File Structure

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=scratch_card_db
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=postgres

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000

# ============================================
# BUSINESS RULES
# ============================================
MIN_PURCHASE_AMOUNT=500
SCRATCH_THRESHOLD=50

# ============================================
# STORE INFORMATION
# ============================================
STORE_NAME=OneCard Diwali Dhamaka
STORE_TAGLINE=शुभ दीपावली!
STORE_DESCRIPTION=Shop for Rangoli, Diyas, Scented Candles & More!

# ============================================
# PRIZE POOL (JSON format - one line)
# ============================================
# Format: [{"name": "Prize Name", "weight": probability_number}, ...]
# Higher weight = higher chance
PRIZES=[{"name":"🪔 Bumper Prize: ₹10,000 Cash!","weight":5},{"name":"🎇 Gold Coin Worth ₹5,000","weight":10},{"name":"🎆 Silver Hamper ₹2,500","weight":15},{"name":"✨ Shopping Voucher ₹1,000","weight":25},{"name":"🎁 Sweets & Dry Fruits ₹500","weight":45}]
```

---

## 🛠️ How to Configure

### 1. **Copy Example File**
```bash
cp .env.example .env
```

### 2. **Edit Settings**
```bash
nano .env
# or
vim .env
# or use any text editor
```

### 3. **Restart Server**
```bash
npm start
```

Changes take effect immediately on server restart!

---

## 📝 Configuration Examples

### Change Minimum Purchase Amount

```bash
# Require ₹1000 minimum instead of ₹500
MIN_PURCHASE_AMOUNT=1000
```

### Adjust Scratch Threshold

```bash
# Require 70% scratched (instead of 50%)
SCRATCH_THRESHOLD=70
```

### Update Store Name

```bash
STORE_NAME=Diwali Mega Sale 2024
STORE_TAGLINE=Win Big This Diwali!
```

### Modify Prize Pool

**Step 1:** Create prizes in readable JSON:
```json
[
  {
    "name": "🪔 Grand Prize: ₹25,000!",
    "weight": 3
  },
  {
    "name": "🎇 Second Prize: ₹10,000",
    "weight": 7
  },
  {
    "name": "🎆 Third Prize: ₹5,000",
    "weight": 15
  },
  {
    "name": "✨ Voucher: ₹1,000",
    "weight": 30
  },
  {
    "name": "🎁 Gift Hamper: ₹500",
    "weight": 45
  }
]
```

**Step 2:** Minify to one line (using online JSON minifier or:
```bash
echo '[{"name":"🪔 Grand Prize: ₹25,000!","weight":3},{"name":"🎇 Second Prize: ₹10,000","weight":7}]' | tr -d '\n'
```

**Step 3:** Add to `.env`:
```bash
PRIZES=[{"name":"🪔 Grand Prize: ₹25,000!","weight":3},{"name":"🎇 Second Prize: ₹10,000","weight":7},{"name":"🎆 Third Prize: ₹5,000","weight":15},{"name":"✨ Voucher: ₹1,000","weight":30},{"name":"🎁 Gift Hamper: ₹500","weight":45}]
```

---

## 🔍 How It Works

### Server Code (server.js)

```javascript
// Load environment variables
require('dotenv').config();

// Access configuration
const MIN_PURCHASE_AMOUNT = parseInt(process.env.MIN_PURCHASE_AMOUNT) || 500;
const PRIZES = JSON.parse(process.env.PRIZES || '[]');

// Use in application
if (amount >= MIN_PURCHASE_AMOUNT) {
  // Allow scratch & win
}
```

### Fallback Values

If a setting is missing from `.env`, the system uses sensible defaults:

```javascript
PORT: 3000
MIN_PURCHASE_AMOUNT: 500
SCRATCH_THRESHOLD: 50
STORE_NAME: 'OneCard Diwali Dhamaka'
PRIZES: [default prize pool]
```

---

## 🌍 Environment-Specific Configuration

### Development
```bash
# .env.development
MIN_PURCHASE_AMOUNT=100  # Lower for testing
PRIZES=[{"name":"Test Prize","weight":100}]
```

### Production
```bash
# .env.production
MIN_PURCHASE_AMOUNT=500
PRIZES=[{"name":"Real Prize: ₹10,000","weight":5}]
```

Load specific environment:
```bash
NODE_ENV=production npm start
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore` (already configured)
- Use `.env.example` for documentation
- Use strong database passwords in production
- Different passwords per environment

### ❌ DON'T:
- Commit `.env` to git
- Share `.env` file publicly
- Use same passwords everywhere
- Hardcode sensitive data in code

---

## 🧪 Testing Configuration

### Verify Settings Loaded:

Add this temporarily to `server.js`:
```javascript
console.log('Configuration:', {
  PORT,
  MIN_PURCHASE_AMOUNT,
  STORE_NAME: STORE_INFO.name,
  PRIZE_COUNT: PRIZES.length
});
```

Run server:
```bash
npm start
```

Should see:
```
Configuration: {
  PORT: 3000,
  MIN_PURCHASE_AMOUNT: 500,
  STORE_NAME: 'OneCard Diwali Dhamaka',
  PRIZE_COUNT: 5
}
```

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `.env` | Your actual configuration (gitignored) |
| `.env.example` | Template with all available settings |
| `.gitignore` | Ensures .env is not committed |
| `server.js` | Loads and uses environment variables |

---

## 🚀 Quick Reference

**View current settings:**
```bash
cat .env
```

**Edit settings:**
```bash
nano .env
```

**Validate JSON prizes:**
```bash
echo $PRIZES | python3 -m json.tool
```

**Restart server to apply changes:**
```bash
npm start
```

---

## 💡 Tips

1. **Keep `.env.example` updated** - When adding new settings, update the example
2. **Document changes** - Add comments in `.env` to explain settings
3. **Test locally first** - Verify changes work before deploying
4. **Backup production `.env`** - Keep a secure backup of production settings
5. **Use version control** - Commit `.env.example`, never `.env`

---

## ✨ Benefits Summary

✅ **Easier Configuration** - Edit text file instead of code  
✅ **Environment-Safe** - Different settings per environment  
✅ **Secure** - Sensitive data in gitignored file  
✅ **Standard Practice** - Follows 12-factor app methodology  
✅ **Flexible** - Change settings without code deployment  
✅ **Clear** - All settings in one place  

---

**Configuration is now fully environment-based! 🎉**
