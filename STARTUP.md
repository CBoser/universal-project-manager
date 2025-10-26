# Universal Project Manager - Startup Guide

This guide explains how to start the Universal Project Manager application using the provided startup scripts.

## Quick Start

### Option 1: Using npm (Cross-Platform) ⭐ RECOMMENDED

The simplest way to start both servers:

```bash
npm start
```

This will start both the backend and frontend servers in a single terminal window with colored output.

- **BACKEND** (blue): Backend API server on port 3001
- **FRONTEND** (green): Vite dev server on port 5173

To stop: Press `Ctrl+C`

---

### Option 2: Windows (.bat file)

Double-click `start.bat` or run from command prompt:

```cmd
start.bat
```

This will:
- Open a new window for the backend server (port 3001)
- Open a new window for the frontend dev server (port 5173)

To stop: Close each window or press `Ctrl+C` in each window

---

### Option 3: Linux/Mac (.sh file)

Run from terminal:

```bash
./start.sh
```

This will:
- Start backend server in the background
- Start frontend dev server in the background
- Show combined logs from both servers
- Save process IDs for easy stopping

To stop: Run the stop script

```bash
./stop.sh
```

Or manually kill the processes:
```bash
kill $(cat .backend.pid .frontend.pid)
```

---

## Manual Start (Advanced)

If you prefer to run servers separately:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## Accessing the Application

Once started, open your browser to:

**Frontend Application:** http://localhost:5173

**Backend API:** http://localhost:3001 (used internally by frontend)

---

## Troubleshooting

### Port Already in Use

If you see an error about ports already in use:

**Linux/Mac:**
```bash
# Check what's using the ports
lsof -i :3001
lsof -i :5173

# Kill processes on those ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Or use the stop script
./stop.sh
```

**Windows:**
```cmd
# Find process using port
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Kill process by PID
taskkill /PID <PID> /F
```

### Backend API Not Working

1. Make sure the backend server is running (check for "Backend Server: Configured ✓" message)
2. Verify `.env` file exists with your API key
3. Check backend logs for errors

### Frontend Not Loading

1. Make sure you're accessing http://localhost:5173 (not 3001)
2. Check frontend terminal for build errors
3. Try clearing browser cache

---

## Environment Variables

Required `.env` file in project root:

```env
# Anthropic API Key (required for AI features)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Optional: Use mock AI for testing
VITE_USE_MOCK_AI=false
```

---

## Log Files (Linux/Mac)

When using `./start.sh`, logs are saved to:

- `backend.log` - Backend server logs
- `frontend.log` - Frontend dev server logs

View logs in real-time:
```bash
tail -f backend.log
tail -f frontend.log
```

---

## Support

For issues or questions, check the main README.md or open an issue on GitHub.
