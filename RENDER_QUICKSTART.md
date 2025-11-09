# Render Quick Start Guide

This guide shows you how to deploy the Universal Project Manager as a **single web service** on Render (simpler than the two-service setup).

## Prerequisites

- GitHub account with this repository
- Anthropic API key ([Get one free](https://console.anthropic.com/))
- Render account ([Sign up free](https://render.com/))
- PostgreSQL database (see database setup below)

## Step 1: Set Up PostgreSQL Database

### Option A: Use Render PostgreSQL (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `universal-pm-db`
   - **Database**: `universal_pm` (or any name)
   - **User**: `universal_pm` (or any name)
   - **Region**: Same as your web service will be
   - **Instance Type**: Free tier is fine
4. Click **"Create Database"**
5. Wait for it to provision (2-3 minutes)
6. Copy the **Internal Database URL** (starts with `postgres://`)

### Option B: Use External PostgreSQL

If you have your own PostgreSQL database (e.g., from another provider), make sure you have the connection string in this format:
```
postgresql://user:password@host:port/database
```

For external databases with SSL, use:
```
postgresql://user:password@host:port/database?sslmode=require
```

## Step 2: Initialize the Database Schema

Before deploying, you need to set up the database tables. You have two options:

### Option A: Using provided SQL script (Recommended)

1. In Render Dashboard, go to your PostgreSQL database
2. Click on **"Shell"** tab or **"Connect"**
3. Copy the connection command and run it locally, or use the web shell
4. Run the schema initialization:
   ```bash
   # If using Render's web shell, you can paste the SQL directly
   # Otherwise, from your local machine:
   psql "YOUR_DATABASE_URL_HERE" < server/database/schema.sql
   ```

### Option B: Using the init script

You can also use the Node.js initialization script after deployment:
```bash
# Set the DATABASE_URL environment variable locally
export DATABASE_URL="your_database_url_here"
npm run db:init
```

## Step 3: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `universal-project-manager` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | Free (or paid for always-on) |

## Step 4: Set Environment Variables

Click **"Add Environment Variable"** and add these:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Your Anthropic API key |
| `DATABASE_URL` | `postgres://...` | Use the Internal Database URL from Step 1 |
| `SESSION_SECRET` | (any random string) | For session encryption |
| `VITE_USE_MOCK_AI` | `false` | Use real AI |

**Optional variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `FRONTEND_URL` | (your render URL) | Only needed if you get CORS errors |
| `PORT` | `3001` | Render auto-assigns, usually not needed |

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for the build (3-5 minutes)
3. Watch the logs for any errors

## Step 6: Test Your Deployment

1. Once deployed, click on your service URL (e.g., `https://universal-project-manager.onrender.com`)
2. The app should load!
3. Try creating an account and logging in
4. Test the AI features by creating a project

## Troubleshooting

### Issue: "Cannot find module 'path'" or build errors

**Solution:** The build should work with the current configuration. If you see module errors, check the build logs.

### Issue: "Failed to connect to database"

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Make sure you're using the **Internal Database URL** from Render
3. Check that the database is in the same region as your web service
4. Verify the database schema is initialized (see Step 2)

### Issue: "CORS error" when using the app

**Solution:**
1. The new configuration should not have CORS issues for single-service deployment
2. If you still see CORS errors, add `FRONTEND_URL` environment variable with your Render service URL
3. Redeploy the service

### Issue: Frontend shows blank page

**Solution:**
1. Check browser console for errors (F12)
2. Verify the build completed successfully in Render logs
3. Check that `dist/` folder was created during build
4. Look for any TypeScript compilation errors

### Issue: "Invalid API key" errors

**Solution:**
1. Verify `VITE_ANTHROPIC_API_KEY` is set correctly (no extra spaces)
2. Check the API key is active at [console.anthropic.com](https://console.anthropic.com/)
3. Make sure you copied the entire key (starts with `sk-ant-`)

### Issue: Database tables not found

**Solution:**
1. You need to initialize the database schema first (see Step 2)
2. Run the schema.sql file against your database
3. Or use `npm run db:init` after setting DATABASE_URL locally

## Database Connection Issues

If you're having trouble connecting to the database:

1. **Check SSL Mode**: Render PostgreSQL requires SSL. The app auto-detects this based on the DATABASE_URL
2. **Verify Connection String**: Make sure DATABASE_URL includes the full connection string
3. **Test Connection**: In Render logs, look for the database connection message

## Free Tier Limitations

- **Services sleep after 15 min inactivity** - First request after sleep takes 30-60 seconds
- **Database**: 1GB storage, 97 hours/month (enough for testing)
- **Web Service**: 750 hours/month

**To keep services awake:**
- Upgrade to paid tier ($7/month for web service)
- Use a pinger service like [UptimeRobot](https://uptimerobot.com/)

## Monitoring

### View Logs
1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. See real-time server logs

### Health Check
Test the API health endpoint:
```bash
curl https://your-service.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T..."
}
```

## Updating Your App

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Render automatically detects and deploys changes
3. Wait 2-5 minutes for deployment
4. Check logs for any errors

## Cost Summary

### Free Option
- Web Service: $0 (with sleep)
- PostgreSQL: $0 (1GB storage)
- Anthropic API: Pay-as-you-go
- **Total**: $0 + API usage

### Paid Option (Always-On)
- Web Service: $7/month
- PostgreSQL: $7/month (if you need more than 1GB)
- Anthropic API: Pay-as-you-go
- **Total**: $7-14/month + API usage

## Next Steps

After successful deployment:

1. ✅ Create your first user account
2. ✅ Set up your Anthropic API key in the app settings
3. ✅ Create a test project with AI
4. ✅ Invite team members (if using multi-user features)
5. ✅ Monitor API usage and costs
6. ✅ Consider upgrading to paid tier for always-on service

## Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Project Issues**: [GitHub Issues](https://github.com/CBoser/universal-project-manager/issues)
- **Full Deployment Guide**: See `DEPLOYMENT.md` for other platform options

---

**You're all set!** 🚀 Your Universal Project Manager is now running on Render!
