# PostgreSQL Setup Guide for Aadhaar Project

## 📋 Prerequisites

- Windows 10/11
- Administrator access (for installation)

---

## 🚀 Step 1: Install PostgreSQL

### Option A: Download and Install (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Or direct: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Download PostgreSQL 14 or 15 (latest stable)

2. **Run Installer:**
   - Run the downloaded `.exe` file
   - Click "Next" through the wizard
   - **Important:** Remember the password you set for `postgres` user!
   - Default port: `5432` (keep this)
   - Default locale: `[Default locale]`

3. **Complete Installation:**
   - Wait for installation to finish
   - Uncheck "Stack Builder" if you don't need it
   - Click "Finish"

### Option B: Using Chocolatey (If you have it)

```powershell
choco install postgresql
```

---

## 🔧 Step 2: Verify Installation

### Check if PostgreSQL is Running

```powershell
Get-Service -Name "*postgresql*"
```

**Expected:** Service should show "Running"

### Test Connection

```powershell
psql -U postgres
```

Enter your password when prompted. If you see `postgres=#`, you're connected!

---

## 🗄️ Step 3: Create Database

### Method 1: Using psql (Command Line)

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aadhaar_db;

# Exit
\q
```

### Method 2: Using createdb Command

```powershell
createdb -U postgres aadhaar_db
```

### Method 3: Using pgAdmin (GUI)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to PostgreSQL server
3. Right-click **Databases** → **Create** → **Database**
4. Name: `aadhaar_db`
5. Click **Save**

---

## ⚙️ Step 4: Configure Project

### Create .env File

Create `.env` file in project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation!

### Or Use Setup Script

```powershell
.\scripts\fix-and-add-test-data.ps1
```

This will prompt for your password and configure everything automatically.

---

## ✅ Step 5: Test Connection

### Test Database Connection

```powershell
npm run test-db
```

**Expected:** Should show "Database connection successful!"

### Initialize Database Schema

```powershell
# Start server first
npm run dev

# Then visit in browser:
http://localhost:3000/api/init-db
```

**Expected:** `{"success":true,"message":"Database initialized successfully"}`

---

## 📊 Step 6: Add Test Data

### Method 1: Using Script

```powershell
npm run add-test-data
```

### Method 2: Using API

```powershell
# Start server
npm run dev

# In another terminal or browser:
Invoke-RestMethod -Uri http://localhost:3000/api/test-data -Method POST
```

---

## 🔍 Common PostgreSQL Commands

### Connect to Database

```powershell
psql -U postgres -d aadhaar_db
```

### List All Databases

```powershell
psql -U postgres -l
```

### List Tables

```sql
\dt
```

### View Table Structure

```sql
\d aadhaar_details
```

### Count Records

```sql
SELECT COUNT(*) FROM aadhaar_details;
```

### View All Records

```sql
SELECT * FROM aadhaar_details;
```

### Exit psql

```sql
\q
```

---

## 🛠️ Troubleshooting

### Issue: "psql: command not found"

**Solution:**
Add PostgreSQL to PATH:
1. Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\<version>\bin`)
2. Add to System PATH:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Edit "Path" → Add PostgreSQL bin folder

### Issue: "Password authentication failed"

**Solution:**
1. Check `.env` file has correct password
2. Try resetting password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```
3. Update `.env` with new password

### Issue: "Database does not exist"

**Solution:**
```powershell
createdb -U postgres aadhaar_db
```

### Issue: PostgreSQL Service Won't Start

**Solution:**
```powershell
# Check service status
Get-Service -Name "*postgresql*"

# Start service (as Administrator)
Start-Service postgresql-x64-<version>

# Or use Services app:
# Win+R → services.msc → Find PostgreSQL → Start
```

### Issue: Port 5432 Already in Use

**Solution:**
1. Find what's using port 5432:
   ```powershell
   Get-NetTCPConnection -LocalPort 5432
   ```
2. Either:
   - Stop the other service
   - Or change PostgreSQL port in `postgresql.conf`

---

## 📝 Quick Reference

### Default PostgreSQL Settings

- **Host:** localhost
- **Port:** 5432
- **Default User:** postgres
- **Default Database:** postgres
- **Password:** (the one you set during installation)

### Project Database Settings

- **Database Name:** aadhaar_db
- **Table Name:** aadhaar_details
- **Connection:** Via `.env` file

---

## ✅ Verification Checklist

After setup, verify:

- [ ] PostgreSQL is installed
- [ ] PostgreSQL service is running
- [ ] Database `aadhaar_db` exists
- [ ] `.env` file has correct credentials
- [ ] Connection test passes (`npm run test-db`)
- [ ] Database schema initialized
- [ ] Test data added

---

## 🎯 Complete Setup in One Command

If you want to do everything automatically:

```powershell
.\scripts\fix-and-add-test-data.ps1
```

This will:
1. ✅ Prompt for PostgreSQL password
2. ✅ Create/update `.env` file
3. ✅ Test connection
4. ✅ Create database if needed
5. ✅ Initialize schema
6. ✅ Add test data

---

## 📚 Additional Resources

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **pgAdmin Guide:** https://www.pgadmin.org/docs/
- **PostgreSQL Windows Guide:** https://www.postgresql.org/docs/current/installation-windows.html

---

**Your PostgreSQL setup is complete! 🎉**
