#!/bin/bash

# React Express MongoDB IndexedDB TodoList - Stop Script
# This script stops both the backend and frontend servers

echo "🛑 Stopping React Express MongoDB IndexedDB TodoList Application..."

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

# Function to kill process by PID
kill_process() {
    local pid=$1
    local name=$2
    
    if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
        echo -e "${BLUE}🔄 Stopping $name (PID: $pid)...${NC}"
        kill $pid
        sleep 2
        
        # Force kill if still running
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Force killing $name...${NC}"
            kill -9 $pid 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ $name stopped successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  $name was not running${NC}"
    fi
}

# Read PIDs from file if it exists
if [ -f "logs/pids.env" ]; then
    source logs/pids.env
    kill_process $BACKEND_PID "Backend Server"
    kill_process $FRONTEND_PID "Frontend Server"
    rm -f logs/pids.env
else
    echo -e "${YELLOW}⚠️  PID file not found. Attempting to stop by port...${NC}"
fi

# Stop processes by port as fallback
if check_port 5000; then
    echo -e "${BLUE}🔄 Stopping backend server on port 5000...${NC}"
    BACKEND_PID=$(lsof -ti:5000)
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        sleep 2
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
fi

if check_port 3000; then
    echo -e "${BLUE}🔄 Stopping frontend server on port 3000...${NC}"
    FRONTEND_PID=$(lsof -ti:3000)
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
        sleep 2
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Frontend server stopped${NC}"
    fi
fi

# Clean up any remaining Node.js processes related to this project
echo -e "${BLUE}🧹 Cleaning up any remaining processes...${NC}"
pkill -f "node server.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

# Remove PID files
rm -f logs/backend.pid
rm -f logs/frontend.pid

# Final check
if ! check_port 5000 && ! check_port 3000; then
    echo -e "${GREEN}🎉 All servers stopped successfully!${NC}"
else
    echo -e "${RED}❌ Some servers may still be running. Check manually:${NC}"
    echo "   lsof -i :3000"
    echo "   lsof -i :5000"
fi

echo ""
echo -e "${BLUE}📋 To start the application again, run: ./start.sh${NC}"
echo ""
