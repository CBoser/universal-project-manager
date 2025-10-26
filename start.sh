#!/bin/bash

echo "========================================"
echo "Universal Project Manager - Startup"
echo "========================================"
echo ""
echo "Starting backend server and frontend..."
echo ""

# Kill any existing processes on these ports
echo "Checking for existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend server in background
echo "Starting backend server on port 3001..."
npm run server > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 2

# Start frontend dev server in background
echo "Starting frontend dev server on port 5173..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "Both servers are running!"
echo "========================================"
echo ""
echo "Backend Server:  http://localhost:3001"
echo "Frontend App:    http://localhost:5173"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend:  backend.log"
echo "  Frontend: frontend.log"
echo ""
echo "To stop the servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or use: ./stop.sh"
echo ""

# Save PIDs to a file for easy stopping
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "Servers are running in the background."
echo "Press Ctrl+C to exit this script (servers will keep running)."
echo ""

# Keep script running and show logs
tail -f backend.log frontend.log
