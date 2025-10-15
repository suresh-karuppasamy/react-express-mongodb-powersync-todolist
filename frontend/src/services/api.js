import axios from 'axios';
import { databaseHelpers } from '../database/database';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check if we're online
const isOnline = () => navigator.onLine;

// User API functions with sync integration
export const userAPI = {
  // Get all users (from local storage or MongoDB based on sync status)
  getUsers: async (syncEnabled = true) => {
    try {
      if (syncEnabled && isOnline()) {
        // Sync ON: Get from MongoDB and sync to local storage
        try {
          const response = await api.get('/users');
          const mongoUsers = response.data;
          
          // Sync MongoDB data to local storage
          await databaseHelpers.syncFromMongoDB(mongoUsers);
          
          console.log('Sync ON: Retrieved users from MongoDB and synced to local storage');
          return mongoUsers;
        } catch (error) {
          console.log('Sync ON: MongoDB unavailable, using local storage');
          return await databaseHelpers.getAllUsers();
        }
      } else {
        // Sync OFF: Get from local storage only
        console.log('Sync OFF: Using local storage only');
        return await databaseHelpers.getAllUsers();
      }
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUser: async (id, syncEnabled = true) => {
    try {
      if (syncEnabled && isOnline()) {
        try {
          const response = await api.get(`/users/${id}`);
          return response.data;
        } catch (error) {
          console.log('Sync ON: MongoDB unavailable, using local storage');
          return await databaseHelpers.getUserById(id);
        }
      } else {
        return await databaseHelpers.getUserById(id);
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create user (saves to local storage and optionally MongoDB)
  createUser: async (userData, syncEnabled = true) => {
    try {
      // Always save to local storage first
      const localUser = await databaseHelpers.insertUser(userData);
      
      if (syncEnabled && isOnline()) {
        // Sync ON: Also save to MongoDB
        try {
          const response = await api.post('/users', userData);
          console.log('Sync ON: User created in MongoDB and local storage');
          return response.data;
        } catch (error) {
          console.log('Sync ON: MongoDB unavailable, saved locally only');
          return localUser;
        }
      } else {
        // Sync OFF: Save to local storage only
        console.log('Sync OFF: User saved to local storage only');
        return localUser;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user (saves to local storage and optionally MongoDB)
  updateUser: async (id, userData, syncEnabled = true) => {
    try {
      // Always update local storage first
      const localUser = await databaseHelpers.updateUser(id, userData);
      
      if (syncEnabled && isOnline()) {
        // Sync ON: Also update MongoDB
        try {
          const response = await api.put(`/users/${id}`, userData);
          console.log('Sync ON: User updated in MongoDB and local storage');
          return response.data;
        } catch (error) {
          console.log('Sync ON: MongoDB unavailable, updated locally only');
          return localUser;
        }
      } else {
        // Sync OFF: Update local storage only
        console.log('Sync OFF: User updated in local storage only');
        return localUser;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (saves to local storage and optionally MongoDB)
  deleteUser: async (id, syncEnabled = true) => {
    try {
      // Always delete from local storage first
      await databaseHelpers.deleteUser(id);
      
      if (syncEnabled && isOnline()) {
        // Sync ON: Also delete from MongoDB
        try {
          const response = await api.delete(`/users/${id}`);
          console.log('Sync ON: User deleted from MongoDB and local storage');
          return response.data;
        } catch (error) {
          console.log('Sync ON: MongoDB unavailable, deleted locally only');
          return { message: 'User deleted from local storage only' };
        }
      } else {
        // Sync OFF: Delete from local storage only
        console.log('Sync OFF: User deleted from local storage only');
        return { message: 'User deleted from local storage only' };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Sync with backend (manual sync)
  syncWithBackend: async () => {
    if (!isOnline()) {
      throw new Error('Cannot sync: You are offline');
    }
    
    try {
      console.log('Manual sync: Syncing with backend...');
      
      // First, get current MongoDB users to identify existing ones
      const mongoResponse = await api.get('/users');
      const mongoUsers = mongoResponse.data;
      
      // Filter out users that have custom powersync_id (not MongoDB ObjectIds)
      const customSyncIds = mongoUsers
        .map(user => user.powersync_id)
        .filter(id => id && id.startsWith('user_')) // Only custom IDs start with 'user_'
        .filter(Boolean);
      
      const existingSyncIds = new Set(customSyncIds);
      
      // Get local users
      const localUsers = await databaseHelpers.getAllUsers();
      console.log('Local users to sync:', localUsers.length);
      
      // Filter out users that already exist in MongoDB
      const newLocalUsers = localUsers.filter(localUser => 
        !existingSyncIds.has(localUser.id)
      );
      
      console.log(`Found ${newLocalUsers.length} new local users to sync (out of ${localUsers.length} total)`);
      
      // Sync only new local users to MongoDB
      if (newLocalUsers.length > 0) {
        try {
          const bulkSyncResponse = await api.post('/users/sync/bulk', { users: newLocalUsers });
          console.log('Bulk sync to MongoDB completed:', bulkSyncResponse.data);
        } catch (error) {
          console.error('Error syncing local users to MongoDB:', error);
          // Continue with the sync process even if bulk sync fails
        }
      }
      
      // Get updated data from MongoDB and sync to local storage
      const updatedMongoResponse = await api.get('/users');
      const updatedMongoUsers = updatedMongoResponse.data;
      
      // Sync MongoDB data to local storage
      await databaseHelpers.syncFromMongoDB(updatedMongoUsers);
      
      console.log('Manual sync completed:', updatedMongoUsers.length, 'users synced');
      return { 
        message: 'Sync completed', 
        userCount: updatedMongoUsers.length,
        newUsersSynced: newLocalUsers.length
      };
    } catch (error) {
      console.error('Error syncing with backend:', error);
      throw error;
    }
  },

  // Sync local data to MongoDB (when Sync is turned on)
  syncLocalToMongoDB: async () => {
    if (!isOnline()) {
      throw new Error('Cannot sync: You are offline');
    }
    
    try {
      console.log('Syncing local data to MongoDB...');
      
      // First, get current MongoDB users to identify existing ones
      const mongoResponse = await api.get('/users');
      const mongoUsers = mongoResponse.data;
      
      // Filter out users that have custom powersync_id (not MongoDB ObjectIds)
      const customSyncIds = mongoUsers
        .map(user => user.powersync_id)
        .filter(id => id && id.startsWith('user_')) // Only custom IDs start with 'user_'
        .filter(Boolean);
      
      const existingSyncIds = new Set(customSyncIds);
      
      console.log('Existing MongoDB users with custom powersync_id:', existingSyncIds.size);
      console.log('Custom powersync_ids:', Array.from(existingSyncIds));
      
      // Get all local users
      const localUsers = await databaseHelpers.getAllUsers();
      
      if (localUsers.length === 0) {
        console.log('No local users to sync');
        return { message: 'No local users to sync', userCount: 0 };
      }
      
      // Filter out users that already exist in MongoDB
      const newLocalUsers = localUsers.filter(localUser => 
        !existingSyncIds.has(localUser.id)
      );
      
      console.log(`Found ${newLocalUsers.length} new local users to sync (out of ${localUsers.length} total)`);
      console.log('Local user IDs:', localUsers.map(u => u.id));
      console.log('Existing MongoDB powersync_ids:', Array.from(existingSyncIds));
      console.log('New local users to sync:', newLocalUsers.map(u => ({id: u.id, name: u.name})));
      
      if (newLocalUsers.length === 0) {
        console.log('All local users already exist in MongoDB');
        return { 
          message: 'All local users already exist in MongoDB', 
          userCount: 0,
          results: { created: 0, updated: 0, errors: [] }
        };
      }
      
      // Sync only new local users to MongoDB
      const response = await api.post('/users/sync/bulk', { users: newLocalUsers });
      console.log('New local users synced to MongoDB:', response.data);
      
      return {
        message: 'New local data synced to MongoDB',
        userCount: newLocalUsers.length,
        results: response.data.results
      };
    } catch (error) {
      console.error('Error syncing local data to MongoDB:', error);
      throw error;
    }
  },

  // Get sync status
  getSyncStatus: async () => {
    try {
      const localStatus = await databaseHelpers.getSyncStatus();
      
      if (isOnline()) {
        try {
          const response = await api.get('/users/sync/status');
          const mongoStatus = response.data;
          
          // Get detailed sync information
          const mongoResponse = await api.get('/users');
          const mongoUsers = mongoResponse.data;
          
          // Filter out users that have custom powersync_id (not MongoDB ObjectIds)
          const customSyncIds = mongoUsers
            .map(user => user.powersync_id)
            .filter(id => id && id.startsWith('user_')) // Only custom IDs start with 'user_'
            .filter(Boolean);
          
          const existingSyncIds = new Set(customSyncIds);
          const localUsers = await databaseHelpers.getAllUsers();
          const newLocalUsers = localUsers.filter(localUser => 
            !existingSyncIds.has(localUser.id)
          );
          
          return {
            ...localStatus,
            mongoUserCount: mongoStatus.mongoUserCount,
            mongoStatus: mongoStatus.status,
            lastMongoSync: mongoStatus.lastSync,
            syncInfo: {
              localUsers: localUsers.length,
              mongoUsers: mongoUsers.length,
              newLocalUsers: newLocalUsers.length,
              existingInMongo: existingSyncIds.size
            }
          };
        } catch (error) {
          return {
            ...localStatus,
            mongoStatus: 'Disconnected',
            mongoUserCount: 0
          };
        }
      } else {
        return {
          ...localStatus,
          mongoStatus: 'Offline',
          mongoUserCount: 0
        };
      }
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
};

export default api;
