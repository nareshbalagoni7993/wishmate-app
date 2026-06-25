# WishMate Setup Guide

## ❌ Current Error: MongoDB not installed / not running

MongoDB is required to run this app. Choose ONE option below.

---

## ✅ OPTION A — MongoDB Atlas (FREE Cloud) — RECOMMENDED
### No installation needed. Works in 5 minutes.

### Step 1: Create Free Atlas Account
1. Open: https://cloud.mongodb.com
2. Click "Try Free"
3. Sign up with Google or email

### Step 2: Create a Free Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" (always free)
3. Select any region close to you
4. Click "Create"

### Step 3: Set Up Database User
1. Username: `wishmate`
2. Password: `wishmate123` (or any strong password)
3. Click "Create User"

### Step 4: Allow All IP Addresses
1. Click "Add My Current IP Address"
2. Also add `0.0.0.0/0` (allows all IPs for development)
3. Click "Finish and Close"

### Step 5: Get Connection String
1. Click "Connect" → "Drivers"
2. Copy the connection string. It looks like:
   `mongodb+srv://wishmate:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
3. Replace `<password>` with your actual password

### Step 6: Update server/.env
Open `server/.env` and change MONGO_URI:

```env
MONGO_URI=mongodb+srv://wishmate:wishmate123@cluster0.xxxxx.mongodb.net/wishmate?retryWrites=true&w=majority
```

### Step 7: Restart Server
```bash
cd server
npm run dev
```

You should see: ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net

---

## ✅ OPTION B — Install MongoDB Locally

### Step 1: Download MongoDB Community Server
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 8.0 (current)
   - Platform: Windows
   - Package: MSI
3. Click Download

### Step 2: Install
1. Run the downloaded `.msi` file
2. Choose "Complete" setup
3. ✅ Check "Install MongoDB as a Service"
4. ✅ Check "Install MongoDB Compass" (optional GUI)
5. Click Install

### Step 3: Create Data Directory (if not auto-created)
Open PowerShell as Administrator:
```powershell
mkdir C:\data\db
```

### Step 4: Start MongoDB Service
```powershell
# As Administrator:
net start MongoDB
```

### Step 5: Verify MongoDB is Running
```powershell
mongod --version
# Should show: db version v8.x.x
```

### Step 6: Restart WishMate Server
```bash
cd server
npm run dev
```

You should see: ✅ MongoDB Connected: 127.0.0.1

---

## Starting the App (After MongoDB is connected)

### Terminal 1 — Backend:
```bash
cd server
npm run dev
# → http://localhost:5000/health
```

### Terminal 2 — Frontend:
```bash
cd client
npm run dev
# → http://localhost:5173
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB not running → `net start MongoDB` |
| `ECONNREFUSED ::1:27017` | IPv6 issue → Use `127.0.0.1` in .env (already fixed) |
| `Duplicate schema index` | Fixed in User.model.js |
| `Cannot POST /api/auth/register` | Server not running → `cd server && npm run dev` |
| `Network Error` on frontend | Backend not running or wrong port |
