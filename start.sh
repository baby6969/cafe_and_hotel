#!/bin/bash

# The Culinary Canvas - Professional Restaurant Website Startup Script
# This script starts both the backend API and frontend development server

echo "🍴 Starting The Culinary Canvas Restaurant Website"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

# Check Python (for frontend server)
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
elif command_exists python; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Python not found. Will try alternative frontend server...${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"

# Check if ports are available
if port_in_use 5000; then
    echo -e "${YELLOW}⚠️  Port 5000 is already in use. Backend might already be running.${NC}"
fi

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Frontend might already be running.${NC}"
fi

# Start Backend
echo -e "${BLUE}📡 Starting backend API server...${NC}"
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if port_in_use 5000; then
    echo -e "${GREEN}✅ Backend API started successfully on http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Failed to start backend API${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Frontend
echo -e "${BLUE}🌐 Starting frontend development server...${NC}"
cd ../frontend

# Try different methods to start frontend server
if command_exists python3; then
    echo -e "${BLUE}Using Python 3 HTTP server...${NC}"
    python3 -m http.server 3000 &
    FRONTEND_PID=$!
elif command_exists python; then
    echo -e "${BLUE}Using Python HTTP server...${NC}"
    python -m http.server 3000 &
    FRONTEND_PID=$!
elif command_exists npx; then
    echo -e "${BLUE}Using npx serve...${NC}"
    npx serve -s . -l 3000 &
    FRONTEND_PID=$!
else
    echo -e "${RED}❌ No suitable frontend server found. Please install Python or Node.js${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Wait for frontend to start
sleep 2

# Check if frontend started successfully
if port_in_use 3000; then
    echo -e "${GREEN}✅ Frontend server started successfully on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Failed to start frontend server${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 The Culinary Canvas is now running!${NC}"
echo "============================================="
echo -e "${BLUE}📱 Website:${NC}           http://localhost:3000"
echo -e "${BLUE}🔐 Admin Login:${NC}       http://localhost:3000/admin-login.html"
echo -e "${BLUE}📊 Admin Dashboard:${NC}   http://localhost:3000/admin.html"
echo -e "${BLUE}📡 Backend API:${NC}       http://localhost:5000"
echo ""
echo -e "${YELLOW}🔐 Admin Credentials:${NC}"
echo "   Email: admin@culinarycanvas.com (or just 'admin')"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}💾 Data Storage:${NC}"
echo "   • Uses local file storage (no database required)"
echo "   • All data saved to backend/storage/ directory"
echo "   • Production ready with MongoDB support"
echo ""
echo -e "${YELLOW}💡 Features:${NC}"
echo "   • Fully responsive website"
echo "   • Interactive admin dashboard"
echo "   • Menu management (add/edit/delete dishes)"
echo "   • Gallery management (upload/organize images)"
echo "   • Real-time updates between admin and website"
echo ""
echo -e "${BLUE}🛑 To stop the servers:${NC} Press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped successfully${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
echo -e "${GREEN}🔄 Servers are running. Press Ctrl+C to stop.${NC}"
wait