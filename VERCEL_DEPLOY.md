# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Cloud Database Required
Your app uses PostgreSQL. **Localhost will not work on Vercel.** You need a cloud PostgreSQL database:

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| **[Vercel Postgres](https://vercel.com/storage/postgres)** | Yes | Integrates directly with Vercel |
| **[Neon](https://neon.tech)** | Yes | Get connection string from dashboard |
| **[Supabase](https://supabase.com)** | Yes | Project Settings → Database → Connection string |
| **[Railway](https://railway.app)** | Limited | Create PostgreSQL service |

### 2. Environment Variables
Set these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

**Option A: Use DATABASE_URL (recommended for cloud)**
```
DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require
```

**Option B: Individual variables**
```
DB_HOST=your-db-host.neon.tech
DB_PORT=5432
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
```

**Optional:**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Initialize Database
After first deploy, visit:
```
https://your-app.vercel.app/api/init-db
```
This creates the `aadhaar_details` table. Add test data via the app form or the test-data API.

### 4. Deploy to Vercel

1. Push your code to **GitHub**, **GitLab**, or **Bitbucket**
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repository
4. Add environment variables (from step 2)
5. Click **Deploy**

### 5. Post-Deploy
- Visit `/api/init-db` to create tables
- Add test Aadhaar records via the app or run `npm run add-test-data` locally (pointing to your cloud DB)

## Build Command
Vercel auto-detects Next.js. Default: `next build`

## Notes
- `.env` is in `.gitignore` — never commit credentials
- The app supports both `DATABASE_URL` and individual DB env vars
- SSL is auto-enabled for Vercel Postgres, Neon, Supabase, and similar providers
