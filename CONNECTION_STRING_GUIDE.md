# PostgreSQL Connection String Guide

## 🔗 What is a Connection String?

A connection string is a single URL that contains all database connection information in one place.

**Format:**
```
postgresql://username:password@host:port/database
```

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/aadhaar_db
```

---

## ✅ Benefits of Using Connection String

1. **Single Configuration** - All connection info in one place
2. **Easy to Copy/Paste** - Great for cloud databases
3. **Environment Variables** - Easy to set in production
4. **Cloud Compatible** - Works with AWS RDS, Azure, Heroku, etc.

---

## 🚀 Quick Setup

### Method 1: Using Setup Script (Easiest)

```powershell
npm run setup-connection-string
```

Or directly:
```powershell
.\scripts\setup-with-connection-string.ps1
```

**What it does:**
- Prompts for connection string
- Validates format
- Updates `.env` file
- Tests connection

### Method 2: Manual Setup

1. **Create/Edit `.env` file:**
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/aadhaar_db
   ```

2. **Replace:**
   - `postgres` → Your PostgreSQL username
   - `your_password` → Your PostgreSQL password
   - `localhost` → Database host (use `localhost` for local)
   - `5432` → Port (default is 5432)
   - `aadhaar_db` → Database name

3. **Save the file**

4. **Restart server:**
   ```powershell
   npm run dev
   ```

---

## 📝 Connection String Examples

### Local PostgreSQL
```
postgresql://postgres:mypassword@localhost:5432/aadhaar_db
```

### Remote PostgreSQL
```
postgresql://postgres:mypassword@192.168.1.100:5432/aadhaar_db
```

### AWS RDS
```
postgresql://username:password@your-db.xxxxx.us-east-1.rds.amazonaws.com:5432/aadhaar_db
```

### Azure Database
```
postgresql://username@server:password@server.postgres.database.azure.com:5432/aadhaar_db
```

### Heroku Postgres
```
postgresql://user:password@ec2-xxx-xxx-xxx.compute-1.amazonaws.com:5432/dbname
```

### With SSL (Cloud Databases)
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

---

## 🔄 Switching Between Methods

### Current: Individual Variables → Switch to Connection String

**Before (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=mypassword
```

**After (.env):**
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/aadhaar_db
```

### Current: Connection String → Switch to Individual Variables

**Before (.env):**
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/aadhaar_db
```

**After (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=mypassword
```

**Note:** Connection string takes priority if both are present.

---

## 🧪 Testing Connection String

### Method 1: Using Test Script

```powershell
npm run test-db
```

### Method 2: Direct API Test

1. Start server: `npm run dev`
2. Visit: `http://localhost:3000/api/aadhaar?aadhaar_number=123456789012`

### Method 3: Using Node.js

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/aadhaar_db'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Connected!', res.rows[0]);
  }
  pool.end();
});
```

---

## 🔒 Security Best Practices

### 1. Never Commit Connection Strings

Make sure `.env` is in `.gitignore`:
```
.env
.env.local
```

### 2. Use Environment Variables in Production

**Vercel:**
```bash
vercel env add DATABASE_URL
```

**Heroku:**
```bash
heroku config:set DATABASE_URL=postgresql://...
```

**AWS:**
- Use AWS Secrets Manager
- Or set in environment variables

### 3. Use Different Credentials for Production

- Development: Local database
- Production: Cloud database with strong password

---

## 🐛 Troubleshooting

### Issue: "Invalid connection string format"

**Solution:**
- Check format: `postgresql://user:password@host:port/database`
- No spaces in connection string
- Special characters in password should be URL-encoded

### Issue: "Connection refused"

**Solution:**
- Check if PostgreSQL is running
- Verify host and port are correct
- Check firewall settings

### Issue: "Authentication failed"

**Solution:**
- Verify username and password
- Check if user has access to database
- Try connecting with psql first

### Issue: "Database does not exist"

**Solution:**
- Create database: `CREATE DATABASE aadhaar_db;`
- Or use existing database name

---

## 📊 Priority Order

The application checks in this order:

1. **DATABASE_URL** (if set, uses this)
2. **Individual DB_* variables** (if DATABASE_URL not set)

So if both are present, `DATABASE_URL` takes priority.

---

## ✅ Verification

After setting up connection string:

1. ✅ Check `.env` has `DATABASE_URL`
2. ✅ Test connection: `npm run test-db`
3. ✅ Start server: `npm run dev`
4. ✅ Initialize database: Visit `/api/init-db`
5. ✅ Add test data: Visit `/api/test-data` (POST)
6. ✅ Test search: Search for `123456789012`

---

## 🎯 Quick Reference

**Local PostgreSQL:**
```
postgresql://postgres:password@localhost:5432/aadhaar_db
```

**Setup Command:**
```powershell
npm run setup-connection-string
```

**Test Command:**
```powershell
npm run test-db
```

---

**Your connection string setup is complete! 🎉**
