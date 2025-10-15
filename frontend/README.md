# User Management with PowerSync

A React application for managing users with name and age fields, featuring **PowerSync** for offline-first functionality and real-time synchronization.

## Features

- ✅ **User List**: Display all users in a beautiful card layout
- ✅ **Create User**: Add new users with name and age
- ✅ **Edit User**: Update existing user information
- ✅ **Delete User**: Remove users with confirmation
- ✅ **Form Validation**: Client-side validation for name and age
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **PowerSync Integration**: Offline-first with real-time sync
- ✅ **Sync Toggle**: Turn PowerSync on/off for testing
- ✅ **Modern UI**: Beautiful gradient design with smooth animations

## PowerSync Features

### 🔄 **Offline-First Architecture**
- All data is stored locally in SQLite via PowerSync
- App works completely offline
- Changes are queued and synced when online

### ⚡ **Real-Time Synchronization**
- Automatic sync when online
- Manual sync button for immediate sync
- Conflict resolution handled by PowerSync

### 🎛️ **Sync Controls**
- Toggle PowerSync on/off
- Online/offline status indicator
- Manual sync button when online

## Components

### UserList
- Displays users from PowerSync local database
- Edit and delete actions for each user
- Loading states and error handling
- Empty state when no users exist

### UserForm
- Create new users or edit existing ones
- Form validation with error messages
- Loading states during save operations
- Cancel functionality

### SyncToggle
- Online/offline status indicator
- PowerSync enable/disable toggle
- Manual sync button
- Real-time status updates

## PowerSync Integration

The app uses PowerSync for:
- **Local SQLite Database**: All data stored locally
- **Offline Operations**: Full functionality without internet
- **Automatic Sync**: Changes sync when online
- **Conflict Resolution**: Handled by PowerSync engine

### Current Configuration
- **Development Mode**: PowerSync configured but not connected to real instance
- **Local Storage**: Uses SQLite database for offline operations
- **Backend Sync**: Attempts to sync with Express backend when online

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables in `.env`:**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_POWERSYNC_URL=wss://your-powersync-instance.com
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Testing Offline Functionality

### Method 1: Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Test creating/editing/deleting users
5. Uncheck "Offline" to go back online
6. Watch data sync automatically

### Method 2: Sync Toggle
1. Use the PowerSync toggle to disable sync
2. Make changes (they're stored locally)
3. Re-enable PowerSync
4. Click "Sync Now" to sync changes

### Method 3: Disconnect Internet
1. Disconnect your internet connection
2. Use the app normally
3. Reconnect internet
4. Data will sync automatically

## API Integration

The app connects to the backend API at `http://localhost:5000/api`:

- `GET /users` - Fetch all users (for initial sync)
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## PowerSync Schema

```javascript
{
  users: {
    primaryKey: 'id',
    columns: {
      id: 'text',
      name: 'text',
      age: 'integer',
      created_at: 'text',
      updated_at: 'text',
      _deleted: 'integer' // For soft deletes
    }
  }
}
```

## Usage

### Creating a User
1. Click "Create New User" button
2. Fill in name and age
3. Click "Create User"
4. Data is saved locally and synced when online

### Editing a User
1. Click "Edit" button on any user card
2. Modify the information
3. Click "Update User"
4. Changes are saved locally and synced when online

### Deleting a User
1. Click "Delete" button on any user card
2. Confirm the deletion
3. User is soft-deleted locally and synced when online

### Sync Controls
1. **PowerSync Toggle**: Enable/disable real-time sync
2. **Sync Now Button**: Manually trigger sync when online
3. **Status Indicator**: Shows online/offline status

## Development vs Production

### Development Mode (Current)
- PowerSync configured but not connected to real instance
- Uses local SQLite database
- Attempts backend sync when online
- Perfect for testing offline functionality

### Production Mode
To enable full PowerSync:
1. Set up a PowerSync instance
2. Update `REACT_APP_POWERSYNC_URL` in `.env`
3. Uncomment the connection line in `src/powersync/database.js`
4. Configure backend PowerSync endpoints

## File Structure

```
src/
├── components/
│   ├── UserList.js          # User list component
│   ├── UserList.css         # User list styles
│   ├── UserForm.js          # User form component
│   ├── UserForm.css         # User form styles
│   ├── SyncToggle.js        # PowerSync controls
│   └── SyncToggle.css       # Sync toggle styles
├── powersync/
│   ├── database.js          # PowerSync configuration
│   └── schema.js            # Database schema
├── services/
│   └── api.js               # API service with PowerSync
├── App.js                   # Main app component
├── App.css                  # Main app styles
└── index.js                 # App entry point
```

## Troubleshooting

### PowerSync Issues
- Check console logs for PowerSync messages
- Ensure PowerSync instance URL is correct
- Verify backend PowerSync endpoints are working

### Offline Testing
- Use browser DevTools Network tab
- Check "Offline" to simulate no internet
- Verify data persists in local SQLite database

### Sync Issues
- Check online/offline status indicator
- Try manual sync with "Sync Now" button
- Verify backend API is accessible

## Future Enhancements

- Real PowerSync instance integration
- Advanced conflict resolution
- Multi-device synchronization
- Data encryption
- User authentication
- Role-based permissions
- Advanced filtering and search
- Bulk operations
- Data export functionality
