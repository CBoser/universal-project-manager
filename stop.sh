#!/bin/bash

echo "========================================"
echo "Stopping Universal Project Manager"
echo "========================================"
echo ""

# Stop using saved PIDs
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null && echo "  Backend stopped ✓" || echo "  Backend not running"
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "Stopping frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null && echo "  Frontend stopped ✓" || echo "  Frontend not running"
    rm .frontend.pid
fi

# Also kill any processes on these ports as backup
echo ""
echo "Checking for processes on ports 3001 and 5173..."
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "  Killed process on port 3001" || echo "  Port 3001 already free"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "  Killed process on port 5173" || echo "  Port 5173 already free"

echo ""
echo "All servers stopped ✓"
echo ""
