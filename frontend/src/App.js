import React, { useState, useEffect } from 'react';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import SyncToggle from './components/SyncToggle';
import { initializePowerSync } from './powersync/database';
import { userAPI } from './services/api';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Initialize PowerSync connection
    const initDB = async () => {
      try {
        await initializePowerSync();
        setDbInitialized(true);
        console.log('Database initialization completed');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still set as initialized to show error state
        setDbInitialized(true);
      }
    };
    
    initDB();
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSaveUser = () => {
    setShowForm(false);
    setEditingUser(null);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const handleSyncToggle = async () => {
    const newSyncEnabled = !syncEnabled;
    setSyncEnabled(newSyncEnabled);
    
    // If turning PowerSync ON, sync local data to MongoDB first
    if (newSyncEnabled) {
      try {
        console.log('PowerSync enabled: Syncing local data to MongoDB...');
        const syncResult = await userAPI.syncLocalToMongoDB();
        console.log('Local to MongoDB sync completed:', syncResult);
        
        // Show sync result to user
        if (syncResult.userCount > 0) {
          console.log(`✅ Synced ${syncResult.userCount} new users to MongoDB`);
        } else {
          console.log('ℹ️ No new users to sync - all local users already exist in MongoDB');
        }
      } catch (error) {
        console.error('Error syncing local data to MongoDB:', error);
        // Continue anyway - the user can manually sync later
      }
    }
    
    setRefreshKey(prev => prev + 1); // Trigger refresh when sync status changes
    console.log('PowerSync toggled:', newSyncEnabled);
  };

  // Show loading state while database initializes
  if (!dbInitialized) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>User Management System</h1>
          <p>Initializing PowerSync database...</p>
        </header>
        <main className="App-main">
          <div className="loading-container">
            <div className="loading">🔄 Initializing database...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Management System</h1>
        <p>Create, edit, and manage users with PowerSync offline capabilities</p>
      </header>

      <main className="App-main">
        <SyncToggle 
          syncEnabled={syncEnabled}
          onSyncToggle={handleSyncToggle}
        />
        
        {!showForm ? (
          <div>
            <div className="action-bar">
              <button 
                onClick={handleCreateUser}
                className="create-btn"
              >
                + Create New User
              </button>
            </div>
            <UserList 
              key={refreshKey}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              syncEnabled={syncEnabled}
            />
          </div>
        ) : (
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={handleCancelForm}
            syncEnabled={syncEnabled}
          />
        )}
      </main>

      <footer className="App-footer">
        <p>Built with React, Express, MongoDB, and PowerSync</p>
        <p>PowerSync Status: {syncEnabled ? 'Enabled' : 'Disabled'}</p>
      </footer>
    </div>
  );
}

export default App;
