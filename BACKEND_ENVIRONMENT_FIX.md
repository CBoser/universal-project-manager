# Backend Environment Configuration Fix

## Issue
Login screen not appearing because backend is blocking requests from the frontend due to missing `FRONTEND_URL` environment variable.

## Root Cause
The backend CORS configuration requires `FRONTEND_URL` to be set to allow cross-origin requests from your frontend. Without it, all API calls from the frontend are blocked with CORS errors.

## Quick Fix (5 minutes)

### Step 1: Check Backend Logs

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your **backend service** (`universal-pm-backend`)
3. Click **"Logs"** tab
4. Look for these messages when the server starts:

   **If you see:**
   ```
   ⚠️  WARNING: FRONTEND_URL not set in production! CORS will block frontend requests!
   ```

   **Then FRONTEND_URL is missing!** Continue to Step 2.

   **If you see CORS blocked messages:**
   ```
   ❌ CORS blocked request from origin: https://universal-pm-frontend.onrender.com
   ```

   **This confirms FRONTEND_URL is not set correctly!**

### Step 2: Add FRONTEND_URL to Backend

1. In Render Dashboard, go to your **backend service**
2. Click **"Environment"** in the left sidebar
3. Look for `FRONTEND_URL` - if it doesn't exist, add it:

   Click **"Add Environment Variable"**

   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://universal-pm-frontend.onrender.com` |

4. Click **"Save Changes"**

### Step 3: Redeploy Backend

After adding the environment variable:
1. Backend should auto-redeploy (wait 1-2 minutes)
2. OR manually click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

### Step 4: Check Logs Again

After redeployment:
1. Go to **"Logs"** tab
2. You should now see:
   ```
   🌐 CORS allowed origins: [ 'http://localhost:5173', 'http://localhost:3000', 'https://universal-pm-frontend.onrender.com' ]
   ```
3. When you visit the frontend, logs should show:
   ```
   ✅ CORS allowed request from origin: https://universal-pm-frontend.onrender.com
   ```

### Step 5: Test Frontend

1. Go to `https://universal-pm-frontend.onrender.com`
2. Open browser DevTools (F12)
3. Check Console tab - you should see:
   ```
   [AuthAPI] Using backend URL: https://universal-pm-backend.onrender.com
   [Auth] Checking authentication status...
   [AuthAPI] Response status: 401
   [Auth] No authenticated user found
   ```
4. **Login screen should now appear!**

---

## Complete Environment Variables Checklist

### Backend Environment Variables

Required for production:

| Variable | Value | Purpose |
|----------|-------|---------|
| `FRONTEND_URL` | `https://universal-pm-frontend.onrender.com` | CORS - allow frontend requests |
| `DATABASE_URL` | `postgresql://...` | Database connection (auto-set by Render) |
| `SESSION_SECRET` | `[32+ random chars]` | Session encryption |
| `API_KEY_ENCRYPTION_SECRET` | `[32+ random chars]` | API key encryption |
| `NODE_ENV` | `production` | Enable production mode |
| `PORT` | `3001` | Server port (optional, Render may override) |

Optional:
| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Default Anthropic API key |

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment Variables

Required for production:

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_BACKEND_URL` | `https://universal-pm-backend.onrender.com` | API endpoint |

Optional:
| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Client-side API key (not recommended) |
| `VITE_USE_MOCK_AI` | `false` | Use real AI |

---

## How to Verify Everything is Working

### 1. Check Backend Health

Visit: `https://universal-pm-backend.onrender.com/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T..."
}
```

**If you get 403 Forbidden:** This is normal from direct browser access (CORS). It's working.

### 2. Check Backend Logs

Look for these startup messages:
```
🌐 CORS allowed origins: [ 'http://localhost:5173', 'http://localhost:3000', 'https://universal-pm-frontend.onrender.com' ]
✅ Database pool created successfully
Server running on port 3001
```

**No warnings or errors about FRONTEND_URL!**

### 3. Check Frontend

Visit: `https://universal-pm-frontend.onrender.com`

Open DevTools (F12) → Console tab:

**Expected console output:**
```
[AuthAPI] Using backend URL: https://universal-pm-backend.onrender.com
[Auth] Checking authentication status...
[AuthAPI] Fetching current user from: https://universal-pm-backend.onrender.com/api/auth/me
[AuthAPI] Response status: 401
[AuthAPI] User not authenticated (401)
[Auth] No authenticated user found
[Auth] Auth check complete, showing UI
```

**Expected on screen:**
- Login form with email and password fields
- "Universal Project Manager" heading
- "Don't have an account? Create one here" link

### 4. Test Login

1. Click "Create one here" to register
2. Fill in email, password, name
3. Click "Sign Up"
4. Should redirect to dashboard
5. Projects should sync from database

---

## Common Issues & Solutions

### Issue: CORS errors in browser console

**Symptoms:**
```
Access to fetch at 'https://universal-pm-backend.onrender.com/api/auth/me' from origin 'https://universal-pm-frontend.onrender.com' has been blocked by CORS policy
```

**Solution:**
1. Verify `FRONTEND_URL` is set in backend environment variables
2. Verify the value exactly matches your frontend URL (including https://)
3. Redeploy backend after adding/changing FRONTEND_URL

### Issue: Backend logs show "CORS blocked request"

**Symptoms in backend logs:**
```
❌ CORS blocked request from origin: https://universal-pm-frontend.onrender.com
❌ Allowed origins are: http://localhost:5173, http://localhost:3000
```

**Solution:**
- `FRONTEND_URL` is not set or has wrong value
- Add/fix `FRONTEND_URL` in backend environment variables
- Must be exactly: `https://universal-pm-frontend.onrender.com`

### Issue: "Loading... Checking authentication" forever

**Symptoms:**
- Screen stuck on loading message
- No login screen appears
- No errors in console

**Solution:**
1. Check backend is running (Render dashboard shows "Live")
2. Check backend logs for errors
3. Verify `VITE_BACKEND_URL` in frontend environment variables
4. Wait 30-60 seconds if backend was sleeping (free tier)

### Issue: Login screen appears but login fails

**Symptoms:**
- Login screen shows correctly
- Clicking "Sign In" shows error
- Console shows 500 or 401 errors

**Possible causes:**
1. **Database not connected** - Check `DATABASE_URL` in backend
2. **Session issues** - Check `SESSION_SECRET` is set
3. **API key encryption** - Check `API_KEY_ENCRYPTION_SECRET` is set

**Solution:**
- Check all required environment variables are set
- Check backend logs for specific errors
- Verify database is running and accessible

### Issue: Can login but projects don't appear

**Symptoms:**
- Login works
- Dashboard shows but no projects
- Console shows sync errors

**Possible causes:**
1. Projects were created before authentication (in localStorage only)
2. Database sync failing
3. Projects belong to different user account

**Solution:**
1. Check backend logs for database errors
2. Verify you're logging in with the same email used to create projects
3. Check browser localStorage: `localStorage.getItem('upm_projects')`
4. If projects are in localStorage but not database, they need to be manually synced

---

## Prevention Tips

1. **Always set environment variables before first deployment**
2. **Use the deployment checklist:** `RENDER_DEPLOYMENT_CHECKLIST.md`
3. **Keep a secure backup of environment variables** (password manager, encrypted file)
4. **Test in staging/preview environment first**
5. **Monitor logs after each deployment**
6. **Set up health check alerts** in Render dashboard

---

## Still Having Issues?

### Enable Debug Logging

The latest code includes enhanced logging. Check:

**Frontend Console (F12):**
- All messages starting with `[Auth]` or `[AuthAPI]`
- Network tab → Filter by "auth"
- Check status codes and response bodies

**Backend Logs:**
- All messages with 🌐, ✅, or ❌ symbols
- Look for startup warnings
- Check for CORS messages during frontend requests

### Get Help

1. **Check documentation:**
   - `RENDER_DEPLOYMENT_GUIDE.md` - Full deployment guide
   - `PRODUCTION_LOGIN_FIX.md` - Frontend environment variable fix
   - `AUTH_SETUP.md` - Authentication system docs

2. **Provide diagnostic info:**
   - Backend logs (last 50 lines)
   - Frontend console output
   - Network tab screenshot showing failed requests
   - Exact error messages

3. **Common commands:**
   ```bash
   # Check backend health
   curl https://universal-pm-backend.onrender.com/api/health

   # Check if backend is accessible
   curl -I https://universal-pm-backend.onrender.com

   # Test auth endpoint (will return 401 if working)
   curl -I https://universal-pm-backend.onrender.com/api/auth/me
   ```

---

**Last updated:** November 2025
