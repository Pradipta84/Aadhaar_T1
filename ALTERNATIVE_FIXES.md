# Alternative Ways to Fix Database Authentication

Here are **5 different methods** to fix the database authentication issue:

## Method 1: Interactive Setup Wizard ⭐ (Easiest)

Run the interactive wizard that guides you through the entire setup:

```powershell
npm run setup-db
```

Or directly:
```powershell
.\scripts\setup-database.ps1
```

**What it does:**
- Checks if PostgreSQL is running
- Tests common passwords automatically
- Creates/updates .env file
- Verifies the connection
- Creates database if needed

## Method 2: Auto-Find Password

Automatically tests common passwords and updates .env if found:

```powershell
npm run find-password
```

Or directly:
```powershell
.\scripts\find-postgres-password.ps1
```

**What it does:**
- Tests 9 common passwords automatically
- Updates .env file if password is found
- No manual input needed if your password is common

## Method 3: Connection String Method

Use a full PostgreSQL connection string instead of individual variables:

```powershell
.\scripts\use-connection-string.ps1
```

**Format:**
```
postgresql://username:password@host:port/database
```

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/aadhaar_db
```

**Benefits:**
- Single string instead of multiple variables
- Easier to copy/paste
- Works with cloud databases too

## Method 4: Windows Authentication

Use Windows login instead of password (if PostgreSQL supports it):

```powershell
.\scripts\use-windows-auth.ps1
```

**When to use:**
- PostgreSQL is configured for Windows Authentication
- You want to use your Windows login credentials
- No password needed

## Method 5: Manual .env.local Override

Create a `.env.local` file (Next.js prioritizes this over `.env`):

1. Create `.env.local` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

2. Restart server

**Benefits:**
- `.env.local` is git-ignored (more secure)
- Overrides `.env` automatically
- No need to modify existing `.env`

## Method 6: Reset PostgreSQL Password

If you want to reset your PostgreSQL password to something simple:

### Using pgAdmin:
1. Open pgAdmin
2. Connect to server
3. Right-click "Login/Group Roles" → "postgres"
4. "Definition" tab → Enter new password → Save

### Using SQL:
```sql
ALTER USER postgres WITH PASSWORD 'newpassword';
```

Then update `.env` with the new password.

## Quick Comparison

| Method | Ease | Speed | Best For |
|--------|------|-------|----------|
| Setup Wizard | ⭐⭐⭐⭐⭐ | Fast | First-time setup |
| Auto-Find | ⭐⭐⭐⭐ | Very Fast | Common passwords |
| Connection String | ⭐⭐⭐ | Fast | Cloud/Remote DB |
| Windows Auth | ⭐⭐ | Medium | Enterprise setups |
| .env.local | ⭐⭐⭐ | Fast | Multiple environments |

## Recommended Approach

**For most users:** Use Method 1 (Setup Wizard)
```powershell
npm run setup-db
```

**If you know your password:** Use Method 2 (Auto-Find)
```powershell
npm run find-password
```

**For production/cloud:** Use Method 3 (Connection String)

## After Any Method

1. Restart Next.js server:
   ```powershell
   npm run dev
   ```

2. Test connection:
   ```powershell
   npm run test-db
   ```

3. Initialize database:
   Visit: `http://localhost:3000/api/init-db`

4. Add test data:
   Visit: `http://localhost:3000/api/test-data` (POST)
