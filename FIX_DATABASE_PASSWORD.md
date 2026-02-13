# Fix Database Authentication Error

## The Problem
You're seeing: "Database authentication failed. Please check your database credentials."

This means the password in your `.env` file doesn't match your PostgreSQL password.

## Solution Steps

### Step 1: Find Your PostgreSQL Password

**Option A: If you remember your password**
- Use that password in the `.env` file

**Option B: If you forgot your password**
- Reset it using one of these methods:

#### Windows (Using pgAdmin):
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Login/Group Roles" → "postgres"
4. Go to "Definition" tab
5. Enter new password
6. Click "Save"

#### Windows (Using Command Line):
```powershell
# Open PowerShell as Administrator
# Navigate to PostgreSQL bin directory (usually):
cd "C:\Program Files\PostgreSQL\<version>\bin"

# Reset password (will prompt for new password)
.\psql.exe -U postgres -c "ALTER USER postgres WITH PASSWORD 'your_new_password';"
```

#### Using SQL:
```sql
ALTER USER postgres WITH PASSWORD 'your_new_password';
```

### Step 2: Update .env File

Open `.env` file and update the password:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
```

**Replace `your_actual_password_here` with your real PostgreSQL password!**

### Step 3: Test the Connection

Run this command to test:
```powershell
npm run add-test-data
```

Or use the test script:
```powershell
npx tsx scripts/test-db-connection.ts
```

### Step 4: Restart Next.js Server

After updating `.env`, restart your development server:
1. Stop the current server (Ctrl+C)
2. Start it again: `npm run dev`

## Quick Test

If you want to test the password directly:

```powershell
# Test connection with psql
psql -U postgres -d aadhaar_db
# Enter password when prompted
```

If this works, use the same password in your `.env` file.

## Common Default Passwords

If you just installed PostgreSQL:
- **Windows**: The password you set during installation
- **Some installers**: `postgres` (default)
- **Docker**: Usually `postgres`

## Still Having Issues?

1. Make sure PostgreSQL service is running:
   ```powershell
   Get-Service -Name "*postgresql*"
   ```

2. Check if database exists:
   ```powershell
   psql -U postgres -l
   ```

3. Create database if it doesn't exist:
   ```powershell
   createdb -U postgres aadhaar_db
   ```
