# 🚀 Setup Guide - Diwali Dhamaka Scratch Card

## ✅ Changes Implemented

### 1. Database Migration: SQLite → PostgreSQL
- ✅ Replaced `sqlite3` with `pg` (PostgreSQL client)
- ✅ Updated all database queries to use PostgreSQL syntax
- ✅ Added environment variable configuration
- ✅ Auto-creates tables on server startup

### 2. Email Collection Modal
- ✅ Beautiful Diwali-themed modal on first load
- ✅ Email validation before allowing play
- ✅ Email stored in database with user_id
- ✅ One play per email restriction
- ✅ Modal automatically hidden for returning users

## 📋 Setup Steps

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE scratch_card_db;

# Exit
\q
```

### Step 3: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**.env file contents:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scratch_card_db
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3000
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start Server

```bash
npm start
```

You should see:
```
✅ Database tables initialized
🪔 Diwali Dhamaka server running at http://localhost:3000
शुभ दीपावली! Happy Diwali! 🎆
```

## 🎯 Testing the App

1. **Open Browser**: Navigate to http://localhost:3000
2. **Email Modal**: You'll see the Diwali welcome modal
3. **Enter Email**: Enter any email address (e.g., test@example.com)
4. **Scratch Card**: Modal closes, scratch card appears
5. **Play**: Scratch to reveal your prize!
6. **Test Restriction**: 
   - Refresh page with same email → See previous prize
   - Use different email → Play again

## 🔍 Verify Database

Check if data is being stored:

```bash
psql -U postgres -d scratch_card_db

# View users
SELECT * FROM users;

# View plays
SELECT * FROM plays;

# Exit
\q
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** PostgreSQL is not running
```bash
# Mac
brew services start postgresql@14

# Ubuntu
sudo service postgresql start
```

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution:** Update password in .env file
```bash
# Reset PostgreSQL password
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
\q
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:** Change port in .env or kill existing process
```bash
lsof -ti:3000 | xargs kill
```

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-increment primary key |
| user_id | TEXT | Unique UUID for user |
| email | TEXT | User's email address |
| created_at | TIMESTAMP | Account creation time |

### Plays Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-increment primary key |
| user_id | TEXT | Foreign key to users |
| email | TEXT | User's email (for easy lookup) |
| prize | TEXT | Prize won |
| played_at | TIMESTAMP | When user played |

## 🎨 Features Added

1. **Email Modal**
   - Appears on first visit
   - Validates email format
   - Stores in localStorage + database
   - Skipped for returning users

2. **PostgreSQL Integration**
   - Production-ready database
   - Better performance than SQLite
   - Supports concurrent users
   - Easy to export user data for prize distribution

3. **Email-Based Restriction**
   - One play per email address
   - Returns same prize if user tries again
   - Data tracked for prize fulfillment

## 📧 Exporting User Data

To get list of winners for prize distribution:

```sql
-- All winners
SELECT email, prize, played_at FROM plays ORDER BY played_at DESC;

-- Winners by prize
SELECT prize, email, played_at 
FROM plays 
WHERE prize LIKE '%10,000%' 
ORDER BY played_at;

-- Export to CSV
\copy (SELECT email, prize, played_at FROM plays) TO '/tmp/winners.csv' CSV HEADER;
```

## 🚀 Deployment

For production deployment:

1. Use a managed PostgreSQL service (e.g., Heroku Postgres, AWS RDS, DigitalOcean)
2. Update .env with production database URL
3. Ensure SSL is enabled for database connections
4. Add email validation/verification if needed

## ✨ Next Steps

- [ ] Add email verification (send confirmation email)
- [ ] Admin dashboard to view all plays
- [ ] Prize claim form after winning
- [ ] Social media sharing
- [ ] Analytics integration
