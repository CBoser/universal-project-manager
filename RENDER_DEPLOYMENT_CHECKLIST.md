# Render Deployment Checklist

This checklist ensures your Universal Project Manager is properly configured for Render deployment.

## ✅ Backend Service Configuration (Web Service)

### Service Settings
- [ ] **Name**: `universal-pm-backend` (or your preferred name)
- [ ] **Environment**: Node
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm run server`
- [ ] **Region**: Choose closest to you (e.g., Oregon)

### Required Environment Variables (Backend)

Copy these into Render Dashboard → Your Backend Service → Environment → Add Environment Variable:

```bash
# Frontend URL (REQUIRED - replace with your actual frontend URL)
FRONTEND_URL=https://universal-project-manager-frontend.onrender.com

# Database Connection (REQUIRED - from Render PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database

# Node Environment (REQUIRED - must be 'production')
NODE_ENV=production

# Anthropic API Key (REQUIRED - get from https://console.anthropic.com/)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key

# Session Secret (REQUIRED - generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your-randomly-generated-secret-here

# API Key Encryption Secret (REQUIRED - generate with same command as above)
API_KEY_ENCRYPTION_SECRET=your-randomly-generated-secret-here

# Optional Settings
VITE_USE_MOCK_AI=false
```

### Generate Secrets

Run these commands locally to generate secure secrets:

```bash
# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API Key Encryption Secret (use different value!)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Frontend Service Configuration (Static Site)

### Service Settings
- [ ] **Name**: `universal-pm-frontend` (or your preferred name)
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Publish Directory**: `dist`
- [ ] **Region**: Same as backend (recommended)

### Required Environment Variables (Frontend)

Copy these into Render Dashboard → Your Frontend Service → Environment → Add Environment Variable:

```bash
# Backend URL (REQUIRED - replace with your actual backend URL)
VITE_BACKEND_URL=https://universal-pm-backend.onrender.com

# Anthropic API Key (same as backend)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key

# Optional Settings
VITE_USE_MOCK_AI=false
```

---

## ✅ PostgreSQL Database Configuration

### Create Database
- [ ] Go to Render Dashboard → New → PostgreSQL
- [ ] **Name**: `universal-project-manager-db`
- [ ] **Database Name**: `universal_project_manager`
- [ ] **User**: Auto-generated
- [ ] **Region**: Same as backend (recommended)
- [ ] **Plan**: Free (or paid for better performance)

### Initialize Database Schema
- [ ] After database is created, copy the **Internal Database URL**
- [ ] Connect via psql or use Render's built-in query tool
- [ ] Run the schema from `server/database/schema.sql`

Or use the initialization script:
```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your-render-database-url"
npm run db:init
```

### Add Database URL to Backend
- [ ] Copy **Internal Database URL** from PostgreSQL service
- [ ] Paste as `DATABASE_URL` in Backend Environment Variables
- [ ] Format: `postgresql://user:password@host:5432/database`

---

## ✅ Deployment Order

Follow this exact order to avoid CORS issues:

1. **Deploy Backend First**
   - Create backend web service
   - Add all backend environment variables (except FRONTEND_URL)
   - Wait for deployment to complete
   - Copy backend URL (e.g., `https://universal-pm-backend.onrender.com`)

2. **Deploy Frontend Second**
   - Create frontend static site
   - Add frontend environment variables (use backend URL from step 1)
   - Wait for deployment to complete
   - Copy frontend URL (e.g., `https://universal-pm-frontend.onrender.com`)

3. **Update Backend with Frontend URL**
   - Go back to backend service
   - Add `FRONTEND_URL` environment variable (use frontend URL from step 2)
   - Render will automatically redeploy backend

---

## ✅ Verification Steps

### Test Backend Health
```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-02T..."}
```

### Test Frontend
1. Open `https://your-frontend-url.onrender.com`
2. Should see the Universal Project Manager interface
3. Try creating a project with AI
4. Check browser console for errors (F12)

### Test Database Connection
Check backend logs in Render Dashboard:
- Look for "✅ Connected to PostgreSQL database"
- Should see "🗄️  Database: Cloud PostgreSQL (SSL)"

### Test Authentication
1. Register a new account
2. Log in
3. Check if session persists after refresh

---

## ✅ Common Issues & Solutions

### Issue: "Failed to fetch" or CORS Error
**Solution:**
- Verify `FRONTEND_URL` in backend matches your actual frontend URL
- Verify `VITE_BACKEND_URL` in frontend matches your actual backend URL
- Ensure both URLs use HTTPS (not HTTP)
- Check backend logs for CORS warnings

### Issue: Database Connection Failed
**Solution:**
- Verify `DATABASE_URL` is correctly set in backend
- Ensure database is in same region as backend (faster, but not required)
- Check if database schema is initialized
- Look for "❌ Unexpected database error" in logs

### Issue: Session/Authentication Not Working
**Solution:**
- Verify `SESSION_SECRET` is set in backend
- Ensure `NODE_ENV=production` in backend
- Check that `secure` cookies are enabled (automatic with NODE_ENV=production)
- Verify backend has `trust proxy` enabled (already configured in code)

### Issue: "Invalid API Key"
**Solution:**
- Verify `VITE_ANTHROPIC_API_KEY` is set correctly in backend
- Check API key is active at https://console.anthropic.com/
- Ensure no extra spaces or quotes around the key

### Issue: Backend Sleeps After Inactivity (Free Tier)
**Explanation:** Free tier services sleep after 15 minutes of inactivity

**Solutions:**
- Accept 30-60 second cold start on first request
- Upgrade to paid tier ($7/month) for always-on service
- Use UptimeRobot to ping backend every 5 minutes (keeps it awake)

---

## ✅ Security Checklist

- [ ] `NODE_ENV=production` set in backend
- [ ] Unique `SESSION_SECRET` generated and set
- [ ] Unique `API_KEY_ENCRYPTION_SECRET` generated and set
- [ ] HTTPS enabled (automatic with Render)
- [ ] CORS configured with specific frontend URL
- [ ] `.env` file added to `.gitignore` (already done)
- [ ] API keys never committed to Git

---

## ✅ Post-Deployment

### Monitor Your Application
- [ ] Set up Render notifications for service failures
- [ ] Monitor Anthropic API usage at https://console.anthropic.com/
- [ ] Check backend logs regularly for errors
- [ ] Set up billing alerts for API usage

### Optional Improvements
- [ ] Custom domain (requires paid plan)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Backup strategy for database

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

**Backend Logs:**
```
🚀 Universal Project Manager Backend
📡 Server running on port 10000
🌍 Environment: production
🗄️  Database: Cloud PostgreSQL (SSL)
✅ Connected to PostgreSQL database
🤖 Anthropic API: Configured ✓
🔧 Mock mode: Disabled
🌐 CORS allowed origins: http://localhost:5173, http://localhost:3000, https://your-frontend-url.onrender.com
```

**Frontend:**
- Loads without errors
- Can register/login
- Can create projects
- AI features work
- Data persists after refresh

---

## Need Help?

If you encounter issues not covered here:

1. Check backend logs in Render Dashboard
2. Check browser console (F12) for frontend errors
3. Review [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for detailed instructions
4. Open an issue on GitHub

---

**Last Updated:** November 2025
