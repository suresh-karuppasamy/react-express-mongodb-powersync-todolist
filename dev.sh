#!/bin/bash

# React Express MongoDB PowerSync TodoList - Development Script
# This script provides development utilities

echo "🛠️  React Express MongoDB PowerSync TodoList - Development Tools"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show help
show_help() {
    echo -e "${BLUE}Available commands:${NC}"
    echo "  install    - Install all dependencies"
    echo "  clean      - Clean node_modules and reinstall"
    echo "  logs       - Show application logs"
    echo "  status     - Check application status"
    echo "  test       - Run API tests"
    echo "  cleanup    - Clean up duplicate users in MongoDB"
    echo "  help       - Show this help message"
    echo ""
}

# Function to install dependencies
install_deps() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install
    cd ..
    
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install
    cd ..
    
    echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
}

# Function to clean and reinstall
clean_install() {
    echo -e "${BLUE}🧹 Cleaning and reinstalling dependencies...${NC}"
    
    echo -e "${YELLOW}Cleaning backend...${NC}"
    cd backend
    rm -rf node_modules package-lock.json
    npm install
    cd ..
    
    echo -e "${YELLOW}Cleaning frontend...${NC}"
    cd frontend
    rm -rf node_modules package-lock.json
    npm install
    cd ..
    
    echo -e "${GREEN}✅ Clean installation completed!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Application Logs${NC}"
    echo ""
    
    if [ -f "logs/backend.log" ]; then
        echo -e "${YELLOW}Backend Logs:${NC}"
        tail -20 logs/backend.log
        echo ""
    fi
    
    if [ -f "logs/frontend.log" ]; then
        echo -e "${YELLOW}Frontend Logs:${NC}"
        tail -20 logs/frontend.log
        echo ""
    fi
    
    echo -e "${BLUE}To follow logs in real-time:${NC}"
    echo "  tail -f logs/backend.log"
    echo "  tail -f logs/frontend.log"
}

# Function to check status
check_status() {
    echo -e "${BLUE}📊 Application Status${NC}"
    echo ""
    
    # Check if ports are in use
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${GREEN}✅ Backend server is running on port 5000${NC}"
    else
        echo -e "${RED}❌ Backend server is not running${NC}"
    fi
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${GREEN}✅ Frontend server is running on port 3000${NC}"
    else
        echo -e "${RED}❌ Frontend server is not running${NC}"
    fi
    
    # Check MongoDB
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${RED}❌ MongoDB is not running${NC}"
    fi
    
    echo ""
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}🧪 Running API Tests${NC}"
    echo ""
    
    # Test health endpoint
    echo -e "${YELLOW}Testing health endpoint...${NC}"
    if curl -s http://localhost:5000/api/health > /dev/null; then
        echo -e "${GREEN}✅ Health endpoint is working${NC}"
    else
        echo -e "${RED}❌ Health endpoint is not responding${NC}"
    fi
    
    # Test users endpoint
    echo -e "${YELLOW}Testing users endpoint...${NC}"
    if curl -s http://localhost:5000/api/users > /dev/null; then
        echo -e "${GREEN}✅ Users endpoint is working${NC}"
    else
        echo -e "${RED}❌ Users endpoint is not responding${NC}"
    fi
    
    echo ""
}

# Function to cleanup duplicates
cleanup_duplicates() {
    echo -e "${BLUE}🧹 Cleaning up duplicate users in MongoDB...${NC}"
    
    if curl -s -X POST http://localhost:5000/api/users/sync/cleanup > /dev/null; then
        echo -e "${GREEN}✅ Duplicate cleanup completed${NC}"
    else
        echo -e "${RED}❌ Cleanup failed - make sure backend is running${NC}"
    fi
    
    echo ""
}

# Main script logic
case "$1" in
    "install")
        install_deps
        ;;
    "clean")
        clean_install
        ;;
    "logs")
        show_logs
        ;;
    "status")
        check_status
        ;;
    "test")
        run_tests
        ;;
    "cleanup")
        cleanup_duplicates
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
