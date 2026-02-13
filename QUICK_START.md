# Quick Start Guide

## 🚀 Fast Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `aadhaar_db`
4. Click Save

**Option B: Using Command Line**
```bash
# Windows (PowerShell)
createdb -U postgres aadhaar_db

# Mac/Linux
createdb aadhaar_db
```

### 3. Configure Environment

Create `.env` file in root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

**Replace `your_password_here` with your PostgreSQL password!**

### 4. Initialize Database

**Method 1: Using Browser (Easiest)**
1. Start the dev server: `npm run dev`
2. Open browser: `http://localhost:3000/api/init-db`
3. You should see: `{"success":true,"message":"Database initialized successfully"}`

**Method 2: Using SQL Script**
```bash
psql -U postgres -d aadhaar_db -f scripts/init-db.sql
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Test the Application

1. **Add New Aadhaar:**
   - Enter Aadhaar Number: `123456789012`
   - Enter Name: `John Doe`
   - Fill other fields (optional)
   - Click "Save Details"

2. **Search Aadhaar:**
   - Enter Aadhaar Number: `123456789012`
   - Click "Search"
   - Details will appear below

## 🔧 Troubleshooting

**Can't connect to database?**
- Check PostgreSQL is running: `services.msc` (Windows) or `sudo service postgresql status` (Linux/Mac)
- Verify `.env` file has correct credentials
- Test connection: `psql -U postgres -d aadhaar_db`

**Port 3000 already in use?**
```bash
PORT=3001 npm run dev
```

**Module errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Need More Help?

See `README.md` for detailed documentation.
