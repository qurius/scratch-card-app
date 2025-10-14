# 🪔 Diwali Dhamaka Scratch Card

A mobile-optimized scratch-to-reveal prize web application with email collection and one-time play restriction using HTML5 Canvas, Node.js, Express, and PostgreSQL.

## ✨ Features

- **Email Collection Modal**: Beautiful modal to capture user email before playing
- **Mobile-Optimized**: Fully responsive design with touch event handling
- **HTML5 Canvas**: Smooth scratch effect using canvas compositing
- **PostgreSQL Database**: Robust database to track users and prevent multiple plays
- **One-Time Play**: Email-based restriction (one play per email)
- **Auto-Reveal**: Automatically reveals prize when 50% scratched
- **Sound Effects**: Scratch, reveal, and celebration audio
- **Diwali Theme**: Festive orange/gold colors, diya animations, Hindi text
- **Celebration Effects**: Firework-style confetti and mobile vibration on win
- **Weighted Prize System**: Configurable prize pool with probability weights
- **Session Persistence**: User sessions stored in localStorage and database

## 🏗️ Project Structure

```
scratch-card-app/
├── server.js              # Express server with PostgreSQL
├── package.json           # Dependencies
├── .env                   # Database configuration (create from .env.example)
├── .env.example           # Example environment variables
└── public/
    ├── index.html         # Main HTML page with email modal
    ├── style.css          # Diwali-themed responsive styling
    └── app.js             # Canvas, touch logic & email handling
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### 2. Set up PostgreSQL Database

```bash
# Install PostgreSQL (if not already installed)
# Mac: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL service
# Mac: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
psql -U postgres
CREATE DATABASE scratch_card_db;
\q
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=scratch_card_db
# DB_USER=postgres
# DB_PASSWORD=your_password
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will automatically create the required database tables on startup.

### 6. Open in Browser

Navigate to: **http://localhost:3000**

For mobile testing, find your local IP address:
- Mac/Linux: `ifconfig | grep inet`
- Then access from mobile: `http://YOUR_IP:3000`

## 📱 How It Works

### User Flow

1. User opens the web page → **Email modal appears**
2. User enters email address
3. System checks if email exists in database
   - If exists: Shows already played message with previous prize
   - If new: Creates user session and assigns prize
4. Modal closes, scratch card appears
5. User scratches canvas with finger/mouse
6. When 50%+ scratched, prize auto-reveals with fireworks and sound
7. User data saved with email for prize distribution

### Technical Implementation

**Canvas Scratching:**
- Uses `globalCompositeOperation = 'destination-out'` to erase overlay
- Tracks touch/mouse events for smooth scratching
- Calculates transparency percentage to trigger auto-reveal

**One-Time Play Restriction:**
- Email-based restriction (one play per email address)
- Each user gets unique UUID stored with their email
- UUID and email stored in browser localStorage and PostgreSQL database
- Database records user_id + email + prize when scratched
- Returning users (same email) see their previous prize

**Database Schema:**
```sql
users:  id (SERIAL), user_id (TEXT), email (TEXT), created_at (TIMESTAMP)
plays:  id (SERIAL), user_id (TEXT), email (TEXT), prize (TEXT), played_at (TIMESTAMP)
```

## 🎁 Prize Configuration

Edit prize pool in `server.js`:

```javascript
const prizes = [
  { name: '🪔 Bumper Prize: ₹10,000 Cash!', weight: 5 },      // 5% chance
  { name: '🎇 Gold Coin Worth ₹5,000', weight: 10 },          // 10% chance
  { name: '🎆 Silver Hamper ₹2,500', weight: 15 },            // 15% chance
  { name: '✨ Shopping Voucher ₹1,000', weight: 25 },         // 25% chance
  { name: '🎁 Sweets & Dry Fruits ₹500', weight: 45 }         // 45% chance
];
```

Higher weight = higher probability. Total weights = 100.

## 🔧 Customization

### Change Scratch Threshold

In `public/app.js`:
```javascript
const SCRATCH_THRESHOLD = 50; // Change to 30, 70, etc.
```

### Change Scratch Radius

In `public/app.js` (scratch function):
```javascript
ctx.arc(x, y, 30, 0, Math.PI * 2); // Change 30 to desired radius
```

### Change Colors/Styling

Edit `public/style.css` for:
- Background gradients
- Card appearance
- Animations
- Mobile responsiveness

## 📊 API Endpoints

### POST `/api/session`
Create or retrieve user session with email
```json
Request:  { "userId": "uuid-or-null", "email": "user@example.com" }
Response: { "userId": "uuid", "email": "user@example.com", "hasPlayed": false, "prize": null }
```

### POST `/api/scratch`
Scratch card and get prize
```json
Request:  { "userId": "uuid", "email": "user@example.com" }
Response: { "alreadyPlayed": false, "prize": "🪔 Bumper Prize: ₹10,000 Cash!" }
```

### GET `/api/stats`
Get statistics (optional)
```json
Response: { 
  "totalPlays": 42,
  "distribution": [
    { "prize": "🎉 Grand Prize: $1000", "count": 2 },
    ...
  ]
}
```

## 📱 Mobile Testing

### Test on Physical Device

1. Ensure computer and phone are on same WiFi
2. Find your computer's IP: `ifconfig | grep "inet "`
3. Start server: `npm start`
4. On phone browser: `http://YOUR_IP:3000`

### Test Mobile Features

- ✅ Touch events (scratch with finger)
- ✅ Responsive layout
- ✅ Vibration on reveal (if device supports)
- ✅ Prevent zoom/scroll during scratch

## 🛠️ Troubleshooting

**Canvas not appearing:**
- Check browser console for errors
- Ensure canvas size is set correctly
- Try hard refresh (Cmd+Shift+R)

**Prize doesn't save:**
- Check if `scratch_card.db` was created
- Verify server logs for database errors
- Clear localStorage and try again

**Can play multiple times:**
- Check localStorage for `scratchCardUserId`
- Verify database has play record
- Check server console for API errors

## 🎨 Browser Support

- ✅ Chrome/Safari Mobile (iOS 12+)
- ✅ Chrome/Firefox Desktop
- ✅ Android Chrome
- ⚠️ IE11 not supported (uses modern JS)

## 📝 License

MIT License - Feel free to use for your event!

## 🎯 Future Enhancements

- [ ] Admin panel to view all plays
- [ ] Email collection before scratch
- [ ] Social sharing of wins
- [ ] Multiple scratch card designs
- [ ] Expiration dates for events
- [ ] SMS/Email prize notifications
