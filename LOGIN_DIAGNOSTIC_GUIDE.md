# Login Diagnostic Guide

## Issue: Screen loads but can't login or user information missing

This guide will help you diagnose and fix login issues step by step.

---

## Step 1: Deploy Latest Code with Enhanced Logging

First, merge and deploy the latest code which includes diagnostic logging:

```bash
git checkout main
git merge claude/fix-missing-nodemailer-011CUmEE4vPGCU41xQb445Z3
git push origin main
```

Wait 2-5 minutes for Render to auto-deploy both frontend and backend.

---

## Step 2: Check Backend Environment Variables

Go to [Render Dashboard](https://dashboard.render.com/) → **Backend Service** → **Environment** tab

**Required variables:**
- ✅ `FRONTEND_URL` = `https://universal-pm-frontend.onrender.com`
- ✅ `DATABASE_URL` = (auto-set by Render PostgreSQL addon)
- ✅ `SESSION_SECRET` = (32+ character random string)
- ✅ `API_KEY_ENCRYPTION_SECRET` = (32+ character random string)
- ✅ `NODE_ENV` = `production`

**If any are missing, add them and wait for redeploy.**

---

## Step 3: Check Frontend Environment Variables

Go to [Render Dashboard](https://dashboard.render.com/) → **Frontend Service** → **Environment** tab

**Required variables:**
- ✅ `VITE_BACKEND_URL` = `https://universal-pm-backend.onrender.com`

**If missing, add it and trigger a manual deploy with "Clear build cache & deploy"**

---

## Step 4: Check Backend Logs

Go to Backend Service → **Logs** tab

**Look for on startup:**
```
🌐 CORS allowed origins: [ 'http://localhost:5173', 'http://localhost:3000', 'https://universal-pm-frontend.onrender.com' ]
```

**If you see:**
```
⚠️  WARNING: FRONTEND_URL not set in production!
```
→ Go back to Step 2 and add FRONTEND_URL

**When you visit the frontend, logs should show:**
```
✅ CORS allowed request from origin: https://universal-pm-frontend.onrender.com
```

**If you see:**
```
❌ CORS blocked request from origin: https://universal-pm-frontend.onrender.com
```
→ FRONTEND_URL is not set correctly. Fix it in Step 2.

---

## Step 5: Open Frontend and Check Browser Console

1. Visit: `https://universal-pm-frontend.onrender.com`
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Refresh the page
5. Look for these messages:

### Expected Console Output (No User Logged In):

```
[AuthAPI] Using backend URL: https://universal-pm-backend.onrender.com
[Auth] Checking authentication status...
[AuthAPI] Fetching current user from: https://universal-pm-backend.onrender.com/api/auth/me
[AuthAPI] Response status: 401
[AuthAPI] User not authenticated (401)
[Auth] No authenticated user found
[Auth] Auth check complete, showing UI
```

**This is GOOD!** You should see the login screen.

### If you see errors:

**Error: "Failed to fetch" or CORS error**
```
Access to fetch at '...' has been blocked by CORS policy
```
→ Backend FRONTEND_URL is not set. Go back to Step 2.

**Error: Timeout**
```
[Auth] Error checking authentication: Error: Auth check timeout
```
→ Backend is not responding or is sleeping. Wait 30-60 seconds and refresh.

**Error: Different backend URL**
```
[AuthAPI] Using backend URL: http://localhost:3001
[AuthAPI] VITE_BACKEND_URL not set, using default: http://localhost:3001
```
→ Frontend VITE_BACKEND_URL is not set. Go back to Step 3.

---

## Step 6: Test Registration

1. Click **"Create one here"** on login screen
2. Fill in:
   - Email: `test@example.com`
   - Password: `testpassword123`
   - Name: `Test User`
3. Click **"Sign Up"**
4. Watch the console output

### Expected Console Output (Successful Registration):

```
[Auth] Attempting registration for: test@example.com
[AuthAPI] Response status: 200
[Auth] Registration successful, user: test@example.com
[Auth] Enabling sync for new user...
[Auth] Database sync enabled for new user
[Auth] Registration flow complete, showing dashboard
```

**Dashboard should load with:**
- Your name "Test User" in the top right
- A logout button
- Empty projects list (no projects yet)

### If Registration Fails:

**Error: "Cannot connect to server"**
```
[Auth] Registration failed: Cannot connect to server at https://...
```
→ Backend is down or sleeping. Check backend logs.

**Error: "Registration failed" with 500 status**
→ Check backend logs for database errors. DATABASE_URL might be wrong.

**Error: Email already exists**
```
[Auth] Registration failed: User with this email already exists
```
→ Use a different email or try logging in instead.

---

## Step 7: Test Login

If you already have an account:

1. Enter your email and password
2. Click **"Sign In"**
3. Watch the console output

### Expected Console Output (Successful Login):

```
[Auth] Attempting login for: test@example.com
[AuthAPI] Response status: 200
[Auth] Login successful, user: test@example.com
[Auth] Enabling sync and fetching projects...
[Auth] Projects synced from server after login
[Auth] Login flow complete, showing dashboard
```

**Dashboard should load with:**
- Your name in the top right
- Logout button visible
- Projects list (if you had any)

### If Login Fails:

**Error: "Invalid credentials"**
```
[Auth] Login failed: Invalid email or password
```
→ Check your email/password. Try registering a new account.

**Error: "User not found"**
```
[Auth] Login failed: User not found
```
→ Register a new account first.

**Error: Database connection**
→ Check backend logs for database errors.

---

## Step 8: Check Network Tab

Still in Developer Tools (F12):

1. Click **Network** tab
2. Try to login/register
3. Look for requests to your backend

### Find the `/api/auth/login` or `/api/auth/register` request:

1. Click on it
2. Check the **Headers** tab:
   - **Request URL:** Should be `https://universal-pm-backend.onrender.com/api/auth/login`
   - **Status Code:** Should be `200` (success) or `400`/`401` (error)
3. Click **Response** tab to see server response

### Common Issues:

**Status 403 - Forbidden**
→ CORS issue. FRONTEND_URL not set on backend.

**Status 500 - Internal Server Error**
→ Backend error. Check backend logs for details.

**Status 401 - Unauthorized** (on login)
→ Wrong password or user doesn't exist.

**Status 400 - Bad Request**
→ Missing email/password in request.

**Request failed - Network error**
→ Backend is down or unreachable. Check if backend is running in Render dashboard.

---

## Step 9: Verify User Information Displays

After successful login, you should see:

**In the top-right corner of dashboard:**
- Your name (e.g., "Test User")
- OR your email if name is not set
- A red "🚪 Logout" button

**If you see the dashboard but NO user name:**

1. Check console - does it show `[Auth] Login successful, user: ...`?
2. Open Console and type: `localStorage.getItem('upm_sync_enabled')`
   - Should return `"true"`
3. In Console, type: `document.querySelector('header').innerText`
   - Should contain your name/email

**If logout button is missing:**
→ You might not actually be logged in. Check console for auth errors.

---

## Step 10: Check Projects Loading

After login, projects should sync from database.

**In Console, look for:**
```
[ProjectAPI] Using backend URL: https://universal-pm-backend.onrender.com
[Auth] Enabling sync and fetching projects...
[Auth] Projects synced from server after login
```

**If projects don't appear:**

1. You might not have any projects yet - create one!
2. Projects might be in localStorage but not database
   - Check console: `JSON.parse(localStorage.getItem('upm_projects') || '[]')`
3. Database sync might have failed
   - Check backend logs for errors

---

## Step 11: Test Logout

1. Click the **"🚪 Logout"** button
2. Watch console output

**Expected:**
```
Database sync disabled after logout
```

**You should:**
- Return to login screen
- Console shows: `[Auth] No authenticated user found`

---

## Common Scenarios & Solutions

### Scenario 1: Login screen appears, but login button doesn't work

**Symptoms:**
- Login screen shows
- Click "Sign In" - nothing happens
- No console errors

**Solution:**
- Check Network tab for blocked requests
- Verify backend is running (check Render dashboard)
- Check CORS settings (Step 2)

### Scenario 2: Login works but dashboard is empty/broken

**Symptoms:**
- Login succeeds (console shows success)
- Dashboard loads but looks broken
- User name missing
- No projects

**Solution:**
1. Check if `currentUser` is set:
   - In console: Look for `[Auth] Login successful, user: YOUR_EMAIL`
2. Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
3. Clear browser cache and cookies
4. Check localStorage: `localStorage.clear()` then login again

### Scenario 3: "Loading..." screen forever

**Symptoms:**
- Stuck on "Loading... Checking authentication"
- Never shows login screen

**Solution:**
1. Backend might be sleeping (free tier) - wait 60 seconds
2. Check backend is running in Render dashboard
3. Check console for timeout errors
4. Verify VITE_BACKEND_URL is set (Step 3)

### Scenario 4: Login works locally but not in production

**Symptoms:**
- Everything works on `localhost:5173`
- Fails on `universal-pm-frontend.onrender.com`

**Solution:**
- Environment variables not set in Render (Steps 2 & 3)
- HTTPS/cookie issues - check backend session cookie settings
- CORS not configured for production URL

---

## Quick Diagnostic Commands

**In Browser Console (F12):**

```javascript
// Check which backend URL is being used
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

// Check if sync is enabled
console.log('Sync enabled:', localStorage.getItem('upm_sync_enabled'));

// Check stored projects
console.log('Projects:', JSON.parse(localStorage.getItem('upm_projects') || '[]'));

// Check last sync time
console.log('Last sync:', localStorage.getItem('upm_last_sync_time'));

// Clear everything and start fresh
localStorage.clear();
location.reload();
```

**Test Backend Directly:**

```bash
# Check backend health (will show 403 due to CORS, but proves it's alive)
curl -I https://universal-pm-backend.onrender.com/api/health

# Test auth endpoint (should return 401 if not logged in)
curl -I https://universal-pm-backend.onrender.com/api/auth/me
```

---

## Still Not Working?

### Collect This Information:

1. **Backend logs** (last 50 lines)
2. **Frontend console output** (full output from page load)
3. **Network tab** screenshot showing failed request
4. **Environment variables** (from Steps 2 & 3)
5. **Exact error message** you're seeing

### Reset Everything:

```bash
# Clear browser data
# In browser: F12 → Application tab → Clear storage → Clear site data

# In Console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Then try registering a brand new account with a new email.

---

## Success Checklist

✅ Backend shows CORS allowed origins including your frontend URL
✅ Frontend console shows correct backend URL
✅ No CORS errors in console
✅ Registration creates account successfully
✅ Login returns user data
✅ Dashboard shows user name in top right
✅ Logout button visible and working
✅ Projects can be created and synced

---

**Last updated:** November 2025
