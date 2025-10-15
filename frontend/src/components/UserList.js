import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './UserList.css';

const UserList = ({ onEditUser, onDeleteUser, syncEnabled = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSyncStatus();
  }, [syncEnabled]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userAPI.getUsers(syncEnabled);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const status = await userAPI.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await userAPI.deleteUser(userId, syncEnabled);
        setUsers(users.filter(user => user._id !== userId));
        onDeleteUser && onDeleteUser();
        fetchSyncStatus(); // Update sync status after deletion
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-container">
        <div className="error">{error}</div>
        <button onClick={fetchUsers} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="list-header">
        <h2>Users List</h2>
        <div className="sync-info">
          <span className={`sync-badge ${syncEnabled ? 'sync-on' : 'sync-off'}`}>
            {syncEnabled ? '🔄 Sync ON' : '💾 Sync OFF'}
          </span>
          {syncStatus && (
            <span className="user-count">
              {syncStatus.localUserCount} user(s) in local storage
            </span>
          )}
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="no-users">No users found. Create your first user!</div>
      ) : (
        <div className="users-grid">
          {users.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>Age: {user.age}</p>
                <p className="user-date">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <div className="storage-indicator">
                  {syncEnabled ? (
                    <span className="storage-badge mongo">MongoDB + Local</span>
                  ) : (
                    <span className="storage-badge local">Local Only</span>
                  )}
                </div>
              </div>
              <div className="user-actions">
                <button 
                  onClick={() => onEditUser(user)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(user._id, user.name)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
