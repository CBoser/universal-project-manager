# Deployment Guide

This guide covers various options for deploying the Universal Project Manager to production.

## Architecture Overview

The Universal Project Manager consists of two components:

1. **Frontend**: React + Vite static site (port 5173 in dev)
2. **Backend**: Express.js API server (port 3001 in dev)

The backend is **required** because it securely handles Anthropic API calls (which cannot be made directly from the browser due to CORS restrictions).

## Prerequisites

Before deploying, ensure you have:
- An Anthropic API key ([get one here](https://console.anthropic.com/))
- Git repository access
- Node.js 18+ installed locally for testing

## Deployment Options

### Option 1: Render (Recommended - Full Stack)

[Render](https://render.com) is ideal for full-stack applications and offers a free tier.

#### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub/GitLab/Bitbucket

#### Step 2: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure the backend service:
   - **Name**: `universal-pm-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Instance Type**: Free (or paid for better performance)

5. Add environment variables:
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   VITE_USE_MOCK_AI=false
   PORT=3001
   NODE_ENV=production
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (you'll get a URL like `https://universal-pm-backend.onrender.com`)

#### Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect the same repository
3. Configure the frontend:
   - **Name**: `universal-pm-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add environment variables:
   ```
   VITE_BACKEND_URL=https://universal-pm-backend.onrender.com
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   VITE_USE_MOCK_AI=false
   ```

5. Click **"Create Static Site"**

#### Step 4: Update Backend CORS

Update `server/index.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://universal-pm-frontend.onrender.com', // Add your frontend URL
  ]
}));
```

Commit and push this change - Render will auto-deploy.

**Cost**: Free tier available (may sleep after inactivity)

---

### Option 2: Railway (Full Stack)

[Railway](https://railway.app) is excellent for full-stack apps with automatic deployments.

#### Step 1: Deploy Backend

1. Go to [Railway](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Node.js and creates a service
5. Go to **Variables** tab and add:
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   VITE_USE_MOCK_AI=false
   PORT=3001
   ```

6. Go to **Settings** → **Deployment**:
   - **Start Command**: `npm run server`

7. Railway provides a URL like `https://your-app.up.railway.app`

#### Step 2: Deploy Frontend

Railway doesn't natively support static sites in the same project easily, so you have two options:

**Option A**: Serve frontend from backend (simpler)
```javascript
// Add to server/index.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});
```

Then update `package.json`:
```json
{
  "scripts": {
    "start": "npm run build && npm run server",
    "server": "node server/index.js"
  }
}
```

**Option B**: Create a second Railway service for the frontend (see Render Option 1, Step 3)

**Cost**: $5/month per service after free trial

---

### Option 3: Vercel + Railway/Render (Hybrid)

Deploy frontend to Vercel (excellent for React apps) and backend separately.

#### Step 1: Deploy Backend

Follow **Option 1** or **Option 2** above to deploy backend to Render or Railway.

#### Step 2: Deploy Frontend to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run deployment:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - **Set up and deploy**: Yes
   - **Which scope**: Your account
   - **Link to existing project**: No
   - **Project name**: universal-project-manager
   - **Directory**: `./` (root)
   - **Override settings**: No

4. Add environment variables via Vercel dashboard:
   - Go to project settings → Environment Variables
   - Add:
     ```
     VITE_BACKEND_URL=https://your-backend-url.com
     VITE_ANTHROPIC_API_KEY=your_api_key_here
     VITE_USE_MOCK_AI=false
     ```

5. Redeploy:
   ```bash
   vercel --prod
   ```

**Cost**: Free for frontend, backend costs depend on platform

---

### Option 4: Netlify + Backend (Hybrid)

Similar to Vercel, but using Netlify for the frontend.

#### Step 1: Deploy Backend

Follow **Option 1** or **Option 2** above.

#### Step 2: Deploy Frontend to Netlify

1. Build your project locally:
   ```bash
   npm run build
   ```

2. Deploy via Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

3. Follow the prompts:
   - **Create & configure a new site**: Yes
   - **Team**: Your team
   - **Site name**: universal-project-manager
   - **Publish directory**: `./dist`

4. For production:
   ```bash
   netlify deploy --prod
   ```

5. Add environment variables:
   - Go to Netlify dashboard → Site settings → Environment variables
   - Add:
     ```
     VITE_BACKEND_URL=https://your-backend-url.com
     VITE_ANTHROPIC_API_KEY=your_api_key_here
     VITE_USE_MOCK_AI=false
     ```

6. Trigger a rebuild to apply environment variables

**Alternative**: Connect your GitHub repo to Netlify for automatic deployments:
1. Go to Netlify dashboard
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Set:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables in site settings

**Cost**: Free for frontend, backend costs depend on platform

---

### Option 5: AWS (EC2 or Elastic Beanstalk)

For full control and scalability, deploy to AWS.

#### Option A: Single EC2 Instance

1. Launch an Ubuntu EC2 instance (t2.micro for free tier)
2. SSH into the instance
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. Clone your repository:
   ```bash
   git clone https://github.com/YourUsername/universal-project-manager.git
   cd universal-project-manager
   npm install
   ```

5. Create `.env` file:
   ```bash
   nano .env
   ```
   Add:
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   VITE_USE_MOCK_AI=false
   VITE_BACKEND_URL=http://your-ec2-ip:3001
   ```

6. Build frontend:
   ```bash
   npm run build
   ```

7. Install PM2 to keep the app running:
   ```bash
   sudo npm install -g pm2
   pm2 start server/index.js --name universal-pm-backend
   pm2 startup
   pm2 save
   ```

8. Install Nginx to serve frontend:
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Configure:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Serve frontend
       location / {
           root /home/ubuntu/universal-project-manager/dist;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to backend
       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

10. Configure security group to allow HTTP (80) and your backend port

**Cost**: ~$3-10/month depending on instance type

---

### Option 6: Docker + Any Cloud Provider

Containerize your application for easy deployment anywhere.

#### Step 1: Create Dockerfile for Backend

Create `server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend code
COPY server/ ./server/

# Expose port
EXPOSE 3001

# Start backend
CMD ["node", "server/index.js"]
```

#### Step 2: Create Dockerfile for Frontend

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 3: Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - VITE_ANTHROPIC_API_KEY=${VITE_ANTHROPIC_API_KEY}
      - VITE_USE_MOCK_AI=false
      - PORT=3001
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### Step 4: Deploy

Deploy to any container platform:
- **DigitalOcean App Platform**
- **Google Cloud Run**
- **Azure Container Instances**
- **AWS ECS/Fargate**

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key | `sk-ant-xxxxx` |
| `VITE_BACKEND_URL` | Backend API URL | `https://api.example.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USE_MOCK_AI` | Use mock AI responses | `false` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `production` |

---

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend health check works: `GET /api/health`
- [ ] AI features work (create a test project)
- [ ] Data persists in browser localStorage
- [ ] Export functionality works (CSV/JSON)
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (recommended)
- [ ] Environment variables are secure (not exposed in frontend)
- [ ] Monitor API usage in Anthropic dashboard

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution**:
1. Check `VITE_BACKEND_URL` is set correctly
2. Update `server/index.js` CORS configuration to include your frontend domain
3. Ensure backend is running and accessible

### Issue: "Invalid API key"

**Solution**:
1. Verify `VITE_ANTHROPIC_API_KEY` is set correctly
2. Check API key is active in Anthropic dashboard
3. Ensure no extra spaces or quotes in the key

### Issue: Backend sleeps after inactivity (Render free tier)

**Solution**:
- Upgrade to paid tier for always-on service
- Use a service like UptimeRobot to ping your backend every 5 minutes
- Accept 30-60 second cold starts on free tier

### Issue: Build fails with "out of memory"

**Solution**:
1. Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
2. Add to `package.json`:
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
     }
   }
   ```

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use environment variables** - Never hardcode API keys
3. **Enable HTTPS** - Most platforms provide free SSL
4. **Rate limiting** - Consider adding rate limiting to backend endpoints
5. **Monitor API usage** - Set up alerts for unusual activity
6. **Keep dependencies updated** - Run `npm audit` regularly

---

## Monitoring & Maintenance

### Health Check Endpoint

Your backend includes a health check at `/api/health`. Use this for monitoring:

```bash
curl https://your-backend-url.com/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

### Recommended Monitoring Tools

- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Frontend monitoring
- Platform-specific monitoring (Render, Railway, etc.)

---

## Cost Comparison

| Platform | Frontend | Backend | Total/Month | Free Tier |
|----------|----------|---------|-------------|-----------|
| **Render** | $0 (static) | $7 | $7 | Yes (with sleep) |
| **Railway** | $5 | $5 | $10 | 500 hrs/month |
| **Vercel + Render** | $0 | $7 | $7 | Yes |
| **Netlify + Railway** | $0 | $5 | $5 | Yes |
| **AWS EC2 t2.micro** | Included | Included | $5-10 | 750 hrs/month (1 yr) |
| **DigitalOcean** | $5 | $5 | $10 | $200 credit |

*Note: Anthropic API usage is billed separately based on usage*

---

## Next Steps

After successful deployment:

1. **Set up custom domain** (if desired)
2. **Configure SSL/HTTPS** (most platforms auto-provide)
3. **Set up monitoring** (health checks, error tracking)
4. **Share your project** with users
5. **Monitor API costs** in Anthropic dashboard
6. **Consider backup strategy** for user data (currently localStorage only)

---

## Need Help?

- Check the [main README](./README.md) for general setup
- Open an issue on [GitHub](https://github.com/CBoser/universal-project-manager/issues)
- Review platform-specific documentation:
  - [Render Docs](https://render.com/docs)
  - [Railway Docs](https://docs.railway.app/)
  - [Vercel Docs](https://vercel.com/docs)
  - [Netlify Docs](https://docs.netlify.com/)

---

**Good luck with your deployment!** 🚀
