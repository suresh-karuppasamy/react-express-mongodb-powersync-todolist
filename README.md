# React Express MongoDB IndexedDB TodoList

A full-stack todo list application with offline-first capabilities using IndexedDB for local storage. This application demonstrates how to build a modern web app with React frontend, Express backend, MongoDB database, and custom sync logic for seamless offline/online synchronization.

## 🚀 Features

- **Offline-First**: Works completely offline with local IndexedDB storage
- **Custom Sync Logic**: Seamless synchronization between local and remote data
- **Smart Sync**: Automatic data synchronization when online with duplicate prevention
- **User Management**: Create, read, update, and delete users
- **Modern UI**: Beautiful, responsive React interface
- **RESTful API**: Express.js backend with MongoDB integration
- **Duplicate Prevention**: Smart sync logic prevents data duplicates
- **Toggle Sync**: Turn sync on/off to work offline or online

## 🏗️ Architecture

```
Frontend (React)          Backend (Express)           Database (MongoDB)
┌─────────────────┐       ┌─────────────────┐         ┌─────────────────┐
│  Custom Sync    │◄────►│  REST API       │◄───────►│  User Data      │
│  IndexedDB      │       │  Port 5000      │         │  Port 27017     │
│  Port 3000      │       │                 │         │                 │
└─────────────────┘       └─────────────────┘         └─────────────────┘
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for cloning the repository)

### Installing Prerequisites

#### Ubuntu/Debian:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS:
```bash
# Install Node.js
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

#### Windows:
1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
3. Start MongoDB service

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd react-express-mongodb-indexeddb-todolist
```

### 2. Install Dependencies

#### Backend Dependencies:
```bash
cd backend
npm install
```

#### Frontend Dependencies:
```bash
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:
```bash
cd backend
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todolist
EOF
```

### 4. Database Setup

Start MongoDB (if not already running):
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb/brew/mongodb-community

# Windows
net start MongoDB
```

## 🚀 Quick Start

### Option 1: Using Scripts (Recommended)

```bash
# Start the application
./start.sh

# Stop the application
./stop.sh
```

### Option 2: Manual Start

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📱 Usage Guide

### Sync Features

1. **Sync ON**: 
   - Data syncs automatically between local IndexedDB and MongoDB
   - Real-time updates when online
   - Automatic sync when coming back online
   - Smart duplicate prevention

2. **Sync OFF**: 
   - Works completely offline
   - Data stored locally in IndexedDB
   - Manual sync available when needed
   - No network dependency

### User Management

1. **Create User**: Click "Create New User" button
2. **Edit User**: Click "Edit" button on any user card
3. **Delete User**: Click "Delete" button on any user card
4. **Sync Status**: View sync statistics in the Sync panel

## 💾 Local Storage (IndexedDB)

The application uses **IndexedDB** for offline storage:

- **Database Name**: `UserManagementDB`
- **Store Name**: `users`
- **Key Path**: `id` (custom generated IDs)
- **Indexes**: `name`, `age`, `createdAt`
- **Features**: Automatic schema creation, data persistence, offline-first

### IndexedDB Structure
```javascript
// User object structure in IndexedDB
{
  id: "user_1234567890_abcdef",     // Custom generated ID
  _id: "user_1234567890_abcdef",    // Same as id for compatibility
  name: "John Doe",                 // User name
  age: 25,                          // User age
  createdAt: "2024-01-01T00:00:00.000Z",  // Creation timestamp
  updatedAt: "2024-01-01T00:00:00.000Z",  // Update timestamp
  _deleted: false                   // Soft delete flag
}
```

## 🔧 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Sync
- `POST /api/users/sync/bulk` - Bulk sync users
- `POST /api/users/sync/cleanup` - Clean up duplicates
- `GET /api/users/sync/status` - Get sync status

### Health
- `GET /api/health` - Health check endpoint

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### 2. MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

#### 3. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Permission Issues
```bash
# Make scripts executable
chmod +x start.sh stop.sh

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Logs

Check application logs:
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# MongoDB logs
sudo journalctl -u mongod -f
```

## 🧪 Testing

### Manual Testing

1. **Offline Testing**:
   - Turn off Sync toggle
   - Add users (should work offline with IndexedDB)
   - Turn on Sync toggle
   - Verify users sync to MongoDB

2. **Sync Testing**:
   - Add users with Sync OFF
   - Turn Sync ON
   - Check that users appear in MongoDB
   - Verify no duplicates are created

3. **Duplicate Prevention**:
   - Add same user multiple times
   - Run cleanup endpoint
   - Verify duplicates are removed

4. **IndexedDB Testing**:
   - Open browser DevTools → Application → IndexedDB
   - Verify data is stored in "UserManagementDB"
   - Check data persistence across page refreshes

### API Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test users endpoint
curl http://localhost:5000/api/users

# Test sync cleanup
curl -X POST http://localhost:5000/api/users/sync/cleanup
```

## 📁 Project Structure

```
react-express-mongodb-indexeddb-todolist/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── middleware/          # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── database/       # IndexedDB database logic
│   │   ├── services/       # API services
│   │   └── App.js          # Main App component
│   └── package.json        # Frontend dependencies
├── logs/                   # Application logs
├── start.sh               # Start script
├── stop.sh                # Stop script
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## 🔒 Security Notes

- The application is configured for development use
- For production deployment, consider:
  - Environment variable security
  - CORS configuration
  - Authentication and authorization
  - HTTPS implementation
  - Database security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs in the `logs/` directory
3. Ensure all prerequisites are installed
4. Verify MongoDB is running
5. Check that ports 3000 and 5000 are available

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Data export/import
- [ ] Mobile app support
- [ ] Performance optimizations
- [ ] Unit and integration tests
- [ ] Docker containerization

---

**Happy Coding! 🚀**
