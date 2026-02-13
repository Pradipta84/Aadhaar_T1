# Vercel Deployment Guide

## Quick Deploy (Recommended)

### 1. Get a free Neon database
1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

### 2. Deploy to Vercel
1. Push to [GitHub](https://github.com/Pradipta84/Aadhaar_T1)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. Add environment variable:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste your Neon connection string)
4. Click **Deploy**

### 3. Initialize database
After deploy, visit:
```
https://your-app.vercel.app/api/init-db
```
Then add test data via the app or visit `/api/test-data` and POST to add sample records.

---

## Other Database Options

| Provider | Setup |
|----------|-------|
| **Neon** (recommended) | [neon.tech](https://neon.tech) - best Vercel compatibility |
| **Supabase** | [supabase.com](https://supabase.com) - use connection string from Project Settings |
| **Vercel Postgres** | Vercel Dashboard → Storage → Create Database |
| **Railway** | [railway.app](https://railway.app) - create PostgreSQL service |

Set `DATABASE_URL` with your provider's connection string. For Supabase, use the **Connection Pooler** URL (Transaction mode, port 5432).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (for Vercel) | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | No | Your app URL (e.g. https://your-app.vercel.app) |

---

## Troubleshooting

- **Build fails:** Run `npm run build` locally first. Ensure no syntax errors.
- **"DATABASE_URL is not configured":** Add it in Vercel → Project → Settings → Environment Variables
- **Database connection errors:** Use Neon for best compatibility. Ensure connection string includes `?sslmode=require` for cloud DBs.
- **Table not found:** Visit `/api/init-db` after first deploy to create tables.
