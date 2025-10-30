# Render Deployment Guide - Universal Project Manager

This guide will walk you through deploying your Universal Project Manager to Render step-by-step.

## Why Render?

- Free tier available (with automatic sleep after inactivity)
- Simple full-stack deployment
- Automatic HTTPS/SSL
- GitHub integration for auto-deploys
- No credit card required for free tier

## Overview

You'll deploy **two services**:
1. **Backend API** (Web Service) - Handles Anthropic AI calls
2. **Frontend** (Static Site) - React application

**Estimated time:** 15-20 minutes

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account with this project pushed to a repository
- [ ] Anthropic API key ([Get one free at console.anthropic.com](https://console.anthropic.com/))
- [ ] Render account ([Sign up free at render.com](https://render.com/))

---

## Part 1: Deploy the Backend (API Server)

### Step 1: Create Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click the **"New +"** button in the top right
3. Select **"Web Service"**

### Step 2: Connect Your Repository

1. Click **"Build and deploy from a Git repository"**
2. Click **"Connect GitHub"** (if not already connected)
3. Authorize Render to access your repositories
4. Find and select your `universal-project-manager` repository
5. Click **"Connect"**

### Step 3: Configure Backend Service

Fill in the following settings:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `universal-pm-backend` | Can be anything, but keep it memorable |
| **Region** | Select closest to you | e.g., Oregon (US West) |
| **Branch** | `main` or `master` | Your default branch |
| **Root Directory** | Leave blank | (unless your code is in a subdirectory) |
| **Runtime** | `Node` | Should auto-detect |
| **Build Command** | `npm install` | Installs dependencies |
| **Start Command** | `npm run server` | Starts the backend |
| **Instance Type** | `Free` | Or upgrade for always-on service |

### Step 4: Add Backend Environment Variables

Scroll down to the **"Environment Variables"** section and click **"Add Environment Variable"**.

Add these variables one by one:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Your actual API key from Anthropic |
| `VITE_USE_MOCK_AI` | `false` | Use real AI, not mock |
| `PORT` | `3001` | Backend port (Render may override) |
| `NODE_ENV` | `production` | Production mode |

**Important:** Keep the page open - you'll need to add one more variable after the frontend is deployed.

### Step 5: Deploy Backend

1. Scroll to the bottom
2. Click **"Create Web Service"**
3. Wait for deployment (2-5 minutes)
4. Watch the logs - you should see "Build successful" and then the server starting

### Step 6: Get Backend URL

Once deployed:
1. At the top of the page, you'll see your backend URL
2. It will look like: `https://universal-pm-backend.onrender.com`
3. **Copy this URL** - you'll need it for the frontend!

### Step 7: Test Backend

Test your backend is working:
```bash
curl https://your-backend-url.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T..."
}
```

---

## Part 2: Deploy the Frontend (React App)

### Step 1: Create Frontend Static Site

1. Go back to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** again
3. Select **"Static Site"**

### Step 2: Connect Same Repository

1. Click **"Build and deploy from a Git repository"**
2. Select your `universal-project-manager` repository again
3. Click **"Connect"**

### Step 3: Configure Frontend Service

Fill in the following settings:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `universal-pm-frontend` | Keep it memorable |
| **Branch** | `main` or `master` | Same as backend |
| **Root Directory** | Leave blank | |
| **Build Command** | `npm install && npm run build` | Builds the React app |
| **Publish Directory** | `dist` | Vite output directory |

### Step 4: Add Frontend Environment Variables

Click **"Add Environment Variable"** and add these:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_BACKEND_URL` | `https://universal-pm-backend.onrender.com` | **USE YOUR ACTUAL BACKEND URL FROM PART 1** |
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Same as backend (for client checks) |
| `VITE_USE_MOCK_AI` | `false` | Use real AI |

**Critical:** Make sure `VITE_BACKEND_URL` matches your actual backend URL from Part 1!

### Step 5: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for deployment (2-5 minutes)
3. Watch the build logs

### Step 6: Get Frontend URL

Once deployed:
1. Your frontend URL will be shown at the top
2. It will look like: `https://universal-pm-frontend.onrender.com`
3. **Copy this URL** - you need it for the final step!

---

## Part 3: Configure CORS (Final Step!)

Now that you have both URLs, you need to tell the backend to allow requests from your frontend.

### Step 1: Add Frontend URL to Backend

1. Go back to your **Backend Web Service** in Render dashboard
2. Click on the **"Environment"** tab in the left sidebar
3. Click **"Add Environment Variable"**
4. Add this variable:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://universal-pm-frontend.onrender.com` |

**Use your actual frontend URL from Part 2!**

### Step 2: Trigger Backend Redeploy

1. After adding the environment variable, Render will automatically redeploy
2. Wait for the backend to restart (1-2 minutes)
3. Or manually click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Part 4: Test Your Deployment!

### Step 1: Open Your App

1. Go to your frontend URL: `https://universal-pm-frontend.onrender.com`
2. The app should load!

### Step 2: Test AI Features

1. Click **"🤖 AI Project Setup"** button
2. Enter a project description (e.g., "Build a mobile app for expense tracking")
3. Select project type and experience level
4. Click **"Generate Project Plan with AI"**
5. Wait for AI to generate your project plan (20-30 seconds)

**If it works, congratulations!** Your app is fully deployed! 🎉

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS Error

**Solution:**
1. Check that `VITE_BACKEND_URL` in frontend matches your actual backend URL
2. Check that `FRONTEND_URL` in backend matches your actual frontend URL
3. Wait 2 minutes after adding `FRONTEND_URL` for backend to redeploy
4. Check backend logs for CORS warnings

### Issue: "Invalid API Key"

**Solution:**
1. Verify `VITE_ANTHROPIC_API_KEY` is set correctly in backend
2. Check your API key is active at [console.anthropic.com](https://console.anthropic.com/)
3. Make sure there are no extra spaces or quotes around the key
4. Test the key directly:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-sonnet-20240229","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
   ```

### Issue: Frontend Loads But Button Does Nothing

**Solution:**
1. Open browser developer console (F12)
2. Look for network errors
3. Check if backend URL is correct in frontend environment variables
4. Test backend health endpoint: `https://your-backend-url.onrender.com/api/health`

### Issue: Backend Logs Show "Not allowed by CORS"

**Solution:**
1. The frontend URL trying to connect doesn't match `FRONTEND_URL` in backend
2. Update `FRONTEND_URL` in backend environment variables
3. Wait for automatic redeploy

### Issue: App Works Initially, Then Stops

**Explanation:** Free tier services sleep after 15 minutes of inactivity.

**Solutions:**
- **Accept cold starts:** First request after sleep takes 30-60 seconds
- **Upgrade to paid tier:** $7/month for always-on backend
- **Use a pinger service:** [UptimeRobot](https://uptimerobot.com/) pings your backend every 5 minutes (keeps it awake)

---

## Free Tier Limitations

Understanding what to expect:

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Services sleep after 15min inactivity** | First load after inactivity takes 30-60s | Upgrade to paid ($7/mo) or accept cold starts |
| **750 hours/month** | About 31 days of continuous uptime | More than enough for most use cases |
| **No custom domains on free tier** | Use Render subdomain | Upgrade to paid for custom domain |

**Cost to upgrade:** $7/month per service ($14/month for both frontend and backend)

---

## Automatic Deployments

Great news! Your app now has **continuous deployment**:

1. Push code to GitHub
2. Render automatically detects the push
3. Runs build and deploys new version
4. Zero downtime deployments

To disable auto-deploy:
1. Go to service settings
2. Uncheck "Auto-Deploy"

---

## Monitoring Your App

### View Logs

**Backend logs:**
1. Go to Render Dashboard
2. Click on your backend service
3. Click **"Logs"** tab
4. See real-time server logs

**Frontend build logs:**
1. Click on your frontend service
2. Click **"Events"** tab
3. See deployment history and build logs

### Health Checks

Render automatically monitors your services:
- Backend health checks: Pings your service every minute
- If service crashes, Render automatically restarts it
- Email notifications on failures (configure in settings)

### Monitor API Usage

Keep an eye on your Anthropic API costs:
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Check usage dashboard
3. Set up billing alerts

---

## Custom Domain (Optional)

Want to use your own domain?

### Requirements
- Custom domain requires **paid plan** ($7/month per service)
- You need to own a domain (GoDaddy, Namecheap, etc.)

### Steps
1. Upgrade service to paid tier
2. Go to service → **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `mypm.com`)
4. Add DNS records to your domain provider:
   - **Frontend:** Add CNAME record pointing to Render
   - **Backend:** Add CNAME record pointing to Render
5. Wait for SSL certificate (automatic)
6. Update `FRONTEND_URL` in backend to use your custom domain
7. Update `VITE_BACKEND_URL` in frontend to use your custom API domain

---

## Updating Your App

### To Deploy Changes:

1. **Make changes locally**
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```

2. **Render automatically deploys** (2-5 minutes)

3. **Verify deployment**
   - Check logs for errors
   - Test your app

### Rolling Back

If something breaks:
1. Go to service → **"Events"** tab
2. Find previous successful deployment
3. Click **"Rollback to this version"**

---

## Security Best Practices

- ✅ **Never commit `.env` files** - Already in `.gitignore`
- ✅ **Use environment variables** - Set in Render dashboard
- ✅ **HTTPS enabled** - Render provides free SSL
- ✅ **CORS configured** - Restricts API access to your frontend
- ✅ **API key in backend only** - Not exposed to client
- 🔒 **Set up billing alerts** - Avoid unexpected Anthropic API costs
- 🔒 **Monitor logs** - Watch for suspicious activity
- 🔒 **Keep dependencies updated** - Run `npm audit` regularly

---

## Cost Summary

### Free Forever Option
- **Render:** $0 (with sleep after inactivity)
- **Anthropic API:** Pay-as-you-go (very low for personal use)
- **Total:** $0 + API usage

### Paid Option (Always-On)
- **Backend:** $7/month
- **Frontend:** $0 (static sites are free)
- **Anthropic API:** Pay-as-you-go
- **Total:** ~$7-10/month

### Example API Costs
Based on Anthropic pricing:
- **Light usage** (5 projects/week): ~$2-5/month
- **Medium usage** (20 projects/week): ~$10-20/month
- **Heavy usage** (50+ projects/week): ~$30-50/month

*Note: Prices may vary. Check [Anthropic pricing](https://www.anthropic.com/pricing) for current rates.*

---

## Next Steps

Now that your app is deployed:

1. ✅ Share your app URL with friends and colleagues
2. ✅ Create your first project with AI
3. ✅ Monitor API usage and costs
4. ✅ Consider upgrading to paid tier if you need always-on service
5. ✅ Set up custom domain (optional)
6. ✅ Add app to your portfolio/resume!

---

## Support

### Need Help?

- **Render Support:** [render.com/docs](https://render.com/docs)
- **Project Issues:** [GitHub Issues](https://github.com/CBoser/universal-project-manager/issues)
- **Anthropic API:** [docs.anthropic.com](https://docs.anthropic.com/)

### Quick Links

- [Render Dashboard](https://dashboard.render.com/)
- [Anthropic Console](https://console.anthropic.com/)
- [Project Documentation](./README.md)
- [Full Deployment Guide](./DEPLOYMENT.md) (all platforms)

---

**Congratulations on deploying your Universal Project Manager!** 🚀

You now have a production-ready, AI-powered project management tool running in the cloud!

---

*Last updated: October 2025*
