# Diagnosing "Failed to fetch Aadhaar details" Error

## 🔍 Common Causes

### 1. Database Authentication Failed ⚠️ (Most Common)

**Symptoms:**
- Error: "Failed to fetch Aadhaar details"
- Or: "Database authentication failed"

**Cause:**
- Wrong password in `.env` file
- Default password `postgres` doesn't match your PostgreSQL password

**Fix:**
```powershell
# Option 1: Run fix script
.\scripts\fix-and-add-test-data.ps1

# Option 2: Manually update .env
# Change: DB_PASSWORD=postgres
# To: DB_PASSWORD=your_actual_password
```

---

### 2. Database Not Initialized

**Symptoms:**
- Error: "Database table not found"
- Or: "Failed to fetch Aadhaar details"

**Cause:**
- Database schema not created
- `aadhaar_details` table doesn't exist

**Fix:**
```powershell
# Start server first
npm run dev

# Then visit in browser:
http://localhost:3000/api/init-db
```

---

### 3. Test Data Not Added

**Symptoms:**
- Error: "Aadhaar details not found" (when searching for test data)
- No records in database

**Cause:**
- Test data hasn't been inserted
- Database is empty

**Fix:**
```powershell
# Option 1: Run fix script (does everything)
.\scripts\fix-and-add-test-data.ps1

# Option 2: Add test data only
npm run add-test-data

# Option 3: Via API (if server running)
# Visit: http://localhost:3000/api/test-data (POST)
```

---

### 4. Server Not Running

**Symptoms:**
- Error: "Failed to fetch Aadhaar details"
- Network error in browser console

**Cause:**
- Next.js server not started
- Port 3000 not accessible

**Fix:**
```powershell
npm run dev
```

---

### 5. Database Not Running

**Symptoms:**
- Error: "Database connection failed"
- Connection refused errors

**Cause:**
- PostgreSQL service not running
- Database server stopped

**Fix:**
```powershell
# Check if PostgreSQL is running
Get-Service -Name "*postgresql*"

# Start if not running
Start-Service postgresql-x64-<version>
```

---

### 6. Database Doesn't Exist

**Symptoms:**
- Error: "Database does not exist"
- Connection errors

**Cause:**
- `aadhaar_db` database not created

**Fix:**
```powershell
# Create database
createdb -U postgres aadhaar_db

# Or use pgAdmin to create it
```

---

## 🔧 Quick Diagnostic Steps

### Step 1: Check Server
```powershell
# Check if server is running
Get-NetTCPConnection -LocalPort 3000
```

**If not running:**
```powershell
npm run dev
```

### Step 2: Check Database Connection
```powershell
# Test database connection
npm run test-db
```

**If fails:** Update password in `.env`

### Step 3: Check Database Schema
```powershell
# Connect to database
psql -U postgres -d aadhaar_db

# Check if table exists
\dt aadhaar_details

# If not, initialize:
# Visit: http://localhost:3000/api/init-db
```

### Step 4: Check Test Data
```powershell
# Connect to database
psql -U postgres -d aadhaar_db

# Count records
SELECT COUNT(*) FROM aadhaar_details;

# If 0, add test data:
npm run add-test-data
```

### Step 5: Test API Directly
```powershell
# Test API endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/aadhaar?aadhaar_number=123456789012"
```

**If this fails:** Check server logs for errors

---

## 🎯 Complete Fix (All-in-One)

Run this script to fix everything:

```powershell
.\scripts\fix-and-add-test-data.ps1
```

**This will:**
1. ✅ Fix database password
2. ✅ Create database if needed
3. ✅ Initialize schema
4. ✅ Add test data
5. ✅ Verify everything works

---

## 📊 Error Message Guide

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "Failed to fetch Aadhaar details" | Generic error | Check all causes above |
| "Database authentication failed" | Wrong password | Update `.env` password |
| "Database connection failed" | DB not running | Start PostgreSQL |
| "Database table not found" | Schema not initialized | Run `/api/init-db` |
| "Aadhaar details not found" | No data in DB | Add test data |
| Network error | Server not running | Start with `npm run dev` |

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] Server is running (`npm run dev`)
- [ ] Database connection works (`npm run test-db`)
- [ ] Database schema exists (visit `/api/init-db`)
- [ ] Test data exists (`npm run add-test-data`)
- [ ] API works (test endpoint directly)
- [ ] Search works in browser

---

## 🚀 Quick Fix Command

If you're not sure what's wrong, run this:

```powershell
.\scripts\fix-and-add-test-data.ps1
```

This fixes **all common issues** automatically!
