# Deploying Authentication System to Render with PostgreSQL

This guide will help you deploy the Universal Project Manager with authentication to Render using their PostgreSQL database service.

## Overview

You'll need **two Render services**:
1. **PostgreSQL Database** (for storing users, projects, API keys)
2. **Web Service** (your existing backend + frontend)

Render provides a **free PostgreSQL database tier** that's perfect for getting started!

---

## Step 1: Create PostgreSQL Database on Render

1. **Go to your Render Dashboard**: https://dashboard.render.com/

2. **Click "New +"** and select **"PostgreSQL"**

3. **Configure the database:**
   - **Name**: `universal-project-manager-db` (or any name you prefer)
   - **Database**: `universal_project_manager`
   - **User**: (auto-generated)
   - **Region**: Choose the **same region** as your web service for best performance
   - **PostgreSQL Version**: 16 (latest)
   - **Instance Type**:
     - **Free** tier: Good for development/testing (90-day limit, then deletes)
     - **Starter** ($7/month): Recommended for production use
     - **Standard** or higher: For larger applications

4. **Click "Create Database"**

5. **Wait for provisioning** (takes 1-2 minutes)

---

## Step 2: Get Database Connection Information

After the database is created:

1. Go to your database service in the Render dashboard
2. Scroll down to the **"Connections"** section
3. You'll see:
   - **Internal Database URL** ⭐ **Use this one** (faster, free data transfer)
   - **External Database URL** (for connecting from outside Render)

The **Internal Database URL** looks like:
```
postgres://username:password@dpg-xxxxx-a:5432/database_name
```

**Important**: Copy the **Internal Database URL** - you'll need it in the next step!

---

## Step 3: Update Your Web Service Environment Variables

Go to your **Web Service** (backend) in Render:

1. Click on your web service (e.g., `universal-project-manager-backend`)
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**

Add these **new** variables:

### Database Configuration

```bash
# Database connection (use Internal Database URL from Step 2)
DATABASE_URL=postgres://username:password@dpg-xxxxx-a:5432/database_name

# Enable SSL for Render PostgreSQL
DB_SSL=true
```

### Session & Encryption Secrets

**⚠️ CRITICAL**: Generate secure random secrets!

Generate secrets locally with this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice to get two different secrets, then add them:

```bash
# Session secret (run the command above to generate)
SESSION_SECRET=<your-generated-secret-1>

# API key encryption secret (run the command above for different secret)
API_KEY_ENCRYPTION_SECRET=<your-generated-secret-2>
```

### Application Configuration

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.onrender.com
VITE_BACKEND_URL=https://your-backend.onrender.com
```

### Optional: Anthropic API Key

```bash
# Optional fallback API key
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
VITE_USE_MOCK_AI=false
```

---

## Step 4: Initialize the Database Schema

After setting environment variables, you need to create all the database tables.

### Option A: Using Render Shell (Easiest)

1. Go to your **Web Service** in Render
2. Click on the **"Shell"** tab at the top
3. Run:

```bash
npm run db:init
```

This creates all tables (users, projects, API keys, etc.)

### Option B: Using Local PostgreSQL Client

1. Copy the **External Database URL** from your PostgreSQL service
2. Run locally:

```bash
export DATABASE_URL="<your-external-database-url>"
export DB_SSL=true
npm run db:init
```

---

## Step 5: Deploy Your Application

### If using automatic deploys:
1. Your changes are already committed and pushed
2. Render will deploy automatically
3. Watch the logs for `✅ Connected to PostgreSQL database`

### If using manual deploys:
1. Go to your Web Service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Step 6: Test Everything

1. Open your frontend URL
2. **Register** a new account
3. **Login** with your credentials
4. Go to **Settings** and add your **Anthropic API key**
5. **Create a project** - it's now stored in the database!
6. **Login from another device** - your projects sync automatically!

---

## Complete Environment Variables List

Here's everything your Web Service needs:

```bash
# Database
DATABASE_URL=postgres://user:pass@dpg-xxxxx-a:5432/dbname
DB_SSL=true

# Security (GENERATE THESE!)
SESSION_SECRET=<generate-64-char-hex-string>
API_KEY_ENCRYPTION_SECRET=<generate-different-64-char-hex-string>

# Application
NODE_ENV=production
PORT=3001

# URLs
FRONTEND_URL=https://your-frontend.onrender.com
VITE_BACKEND_URL=https://your-backend.onrender.com

# Optional
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_USE_MOCK_AI=false
```

---

## Troubleshooting

### "ECONNREFUSED" - Cannot connect to database

**Solutions**:
1. Use **Internal Database URL** (not External)
2. Make sure `DB_SSL=true`
3. Check database is "Available" in Render
4. Verify both services are in same region

### "relation 'users' does not exist"

**Solution**: Run database initialization:
```bash
npm run db:init
```

### Database connection works locally but not on Render

**Solution**:
1. Set `DATABASE_URL` in Render environment variables
2. Set `DB_SSL=true`
3. Redeploy the service

---

## Costs on Render

### Free Tier
- Web Service: Free (750 hours/month)
- PostgreSQL: Free for 90 days, then **deleted**

### Paid Tier (Recommended for Production)
- Web Service: $7/month
- PostgreSQL: $7/month
- **Total**: ~$14/month for persistent storage

---

## Database Backups

### Manual Backup (in Render Shell):
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Automatic Backups
Available on paid tiers - Render keeps 7 days of daily backups

---

## Production Checklist

Before going live:

- ✅ Generated secure `SESSION_SECRET` and `API_KEY_ENCRYPTION_SECRET`
- ✅ Set `DB_SSL=true`
- ✅ Using Internal Database URL
- ✅ Set `NODE_ENV=production`
- ✅ Ran `npm run db:init` successfully
- ✅ Tested user registration and login
- ✅ Tested API key storage
- ✅ Consider paid tier for persistent database

---

## What You Get

With this setup, users can:
- ✅ Create secure accounts with encrypted passwords
- ✅ Store Anthropic API keys securely (encrypted, never in git!)
- ✅ Access projects from any device
- ✅ Sync data automatically across all devices
- ✅ Have 30-day persistent login sessions
- ✅ Manage their own private projects

---

## Database Tables

After initialization, you'll have:
- `users` - User accounts with encrypted passwords
- `user_api_keys` - Encrypted API keys
- `projects` - User projects with full sync
- `tasks` - Project tasks
- `time_logs` - Time tracking
- `session` - User sessions

---

## Need Help?

Check your logs:
```bash
# In Render Shell - Test database connection
psql $DATABASE_URL -c "SELECT version();"

# List tables
psql $DATABASE_URL -c "\dt"

# Check users table
psql $DATABASE_URL -c "SELECT email FROM users;"
```

---

## Summary

**Yes, you can absolutely keep using Render!** Just add:
1. PostgreSQL database service ($0 for 90 days, then $7/month)
2. Environment variables for database and secrets
3. Run database initialization once
4. Deploy and enjoy cross-device synchronization!

Your app is now production-ready with secure authentication! 🎉
