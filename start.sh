#!/bin/bash

# React Express MongoDB PowerSync TodoList - Start Script
# This script starts both the backend and frontend servers

echo "🚀 Starting React Express MongoDB PowerSync TodoList Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if ports are already in use
if check_port 5000; then
    echo -e "${RED}❌ Port 5000 is already in use. Please stop the backend server first.${NC}"
    exit 1
fi

if check_port 3000; then
    echo -e "${RED}❌ Port 3000 is already in use. Please stop the frontend server first.${NC}"
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB first:${NC}"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   mongod --dbpath /var/lib/mongodb"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start backend server
echo -e "${BLUE}📦 Starting backend server on port 5000...${NC}"
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! check_port 5000; then
    echo -e "${RED}❌ Backend server failed to start. Check logs/backend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Backend server started successfully (PID: $BACKEND_PID)${NC}"

# Start frontend server
echo -e "${BLUE}⚛️  Starting frontend server on port 3000...${NC}"
cd ../frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! check_port 3000; then
    echo -e "${RED}❌ Frontend server failed to start. Check logs/frontend.log${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend server started successfully (PID: $FRONTEND_PID)${NC}"

# Save PIDs to a file for stop script
echo "BACKEND_PID=$BACKEND_PID" > ../logs/pids.env
echo "FRONTEND_PID=$FRONTEND_PID" >> ../logs/pids.env

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend API: http://localhost:5000${NC}"
echo -e "${BLUE}🏥 Health Check: http://localhost:5000/api/health${NC}"
echo ""
echo -e "${YELLOW}📋 To stop the application, run: ./stop.sh${NC}"
echo -e "${YELLOW}📋 To view logs: tail -f logs/backend.log or tail -f logs/frontend.log${NC}"
echo ""
