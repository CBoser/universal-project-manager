# Production Login Issue - Quick Fix Guide

## Problem
The frontend at `https://universal-pm-frontend.onrender.com/` is not showing the login screen and projects are missing.

## Root Cause
The frontend deployment is missing the `VITE_BACKEND_URL` environment variable, so it cannot connect to the backend API for authentication.

## Solution

### Step 1: Find Your Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your **backend service** (likely named something like `universal-pm-backend` or `universal-project-manager`)
3. Copy the URL at the top of the page (should look like: `https://universal-pm-backend-XXXX.onrender.com` or similar)

### Step 2: Add Environment Variable to Frontend

1. In Render Dashboard, click on your **frontend static site** (`universal-pm-frontend`)
2. Click on **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Add this variable:

   | Key | Value |
   |-----|-------|
   | `VITE_BACKEND_URL` | `https://your-actual-backend-url.onrender.com` |

   **IMPORTANT:** Replace with your ACTUAL backend URL from Step 1!

5. Click **"Save Changes"**

### Step 3: Redeploy Frontend

After adding the environment variable:

1. Go to the **"Manual Deploy"** button at the top right
2. Select **"Clear build cache & deploy"**
3. Wait for the deployment to complete (2-5 minutes)

### Step 4: Test

1. Go to your frontend URL: `https://universal-pm-frontend.onrender.com/`
2. You should now see the **Login** screen
3. Register a new account or login with existing credentials
4. Your projects should appear after login (they're stored in the database)

## Additional Required Environment Variables

Make sure these are also set in your frontend deployment:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_BACKEND_URL` | `https://your-backend-url.onrender.com` | Points to your backend API |
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Your Anthropic API key (optional for frontend) |
| `VITE_USE_MOCK_AI` | `false` | Use real AI |

## Backend Environment Variables Checklist

Also verify your backend has these set:

| Key | Value | Notes |
|-----|-------|-------|
| `FRONTEND_URL` | `https://universal-pm-frontend.onrender.com` | Your actual frontend URL |
| `SESSION_SECRET` | `[random-32-char-string]` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `API_KEY_ENCRYPTION_SECRET` | `[random-32-char-string]` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URL` | `postgresql://...` | Should be auto-set by Render if you have a PostgreSQL addon |
| `NODE_ENV` | `production` | |

## Why This Happened

When you deploy a Vite app (React), environment variables starting with `VITE_` are baked into the build at build-time. If they're not set before building, the app uses the fallback value (`http://localhost:3001`), which doesn't work in production.

## Recovering Your Projects

Your projects should be safe if:
- They were created after you set up authentication
- You were logged in when you created them
- The database sync was working

After fixing the authentication:
1. Login with the same account you used before
2. Your projects should automatically sync from the database
3. If projects are missing, check the database directly or contact support

## Still Having Issues?

### Issue: Login screen appears but login fails

**Check:**
1. Backend logs in Render for errors
2. Browser console (F12) for network errors
3. Verify `FRONTEND_URL` is set in backend environment variables
4. Check CORS settings in backend

### Issue: Login works but no projects appear

**Check:**
1. Database connection in backend logs
2. Run this in your local terminal connected to the database:
   ```sql
   SELECT * FROM projects WHERE user_id = 'your-user-id';
   ```
3. Check if projects were created before authentication was added (they'd be in localStorage only)

### Issue: "Cannot connect to server" error

**Solutions:**
1. Verify backend is running (check Render dashboard)
2. Test backend health: `curl https://your-backend-url.onrender.com/api/health`
3. Wait for backend to wake up if on free tier (can take 30-60 seconds)

## Prevention

To avoid this in the future:
1. Always set environment variables BEFORE first deployment
2. Use the deployment checklist: `RENDER_DEPLOYMENT_CHECKLIST.md`
3. Test in a staging environment first
4. Keep a copy of your environment variables in a secure location

---

**Need more help?** Check:
- Full deployment guide: `RENDER_DEPLOYMENT_GUIDE.md`
- Database setup: `RENDER_DATABASE_SETUP.md`
- Authentication docs: `AUTH_SETUP.md`
